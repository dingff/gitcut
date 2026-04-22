import { spawn, spawnSync } from 'node:child_process'
import ora from 'ora'
import colors from 'picocolors'
import fs from 'node:fs'
import path from 'node:path'
import { checkbox, input, select } from '@inquirer/prompts'
import stringWidth from 'string-width'
import { createLLM } from 'llm-local'

const getHintPre = (t) => colors.gray('[') + t + colors.gray(']')
const logger = {
  warn: (message) => console.log(`${getHintPre(colors.bold(colors.yellow('WARN')))} ${message}`),
  error: (message) => console.log(`${getHintPre(colors.bold(colors.red('ERROR')))} ${message}`),
  success: (message) => console.log(`${getHintPre(colors.bold(colors.green('OK')))} ${message}`),
}

const startSpawn = (c, p, config = { silent: false }) => {
  return new Promise((resolve, reject) => {
    if (!config.silent) {
      ora(`${c} ${p.join(' ')}`).succeed()
    }
    const subprocess = spawnSync(c, p, { stdio: 'inherit' })
    if (subprocess.error) {
      reject(subprocess.error)
      return
    }
    if (subprocess.status !== 0) {
      reject(new Error(`${c} ${p.join(' ')} exited with code ${subprocess.status}`))
    } else {
      resolve()
    }
  })
}
const startSpawnPipe = (c, p, config = { silent: false }) => {
  return new Promise((resolve, reject) => {
    const spinner = config.silent ? null : ora(`${c} ${p.join(' ')}`).start()
    let stdoutData = ''
    let stderrData = ''
    let settled = false
    const finishReject = (err) => {
      if (settled) return
      settled = true
      reject(err)
    }
    const finishResolve = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const subprocess = spawn(c, p)
    subprocess.stdout.on('data', (data) => {
      stdoutData = `${stdoutData}${data}`
    })
    subprocess.stderr.on('data', (data) => {
      stderrData = `${stderrData}${data}`
    })
    subprocess.on('error', (err) => {
      spinner?.fail()
      finishReject(err)
    })
    subprocess.on('close', (code) => {
      if (code !== 0) {
        spinner?.fail()
        finishReject(
          new Error(
            `${c} ${p.join(' ')} exited with code ${code}\n${stderrData.trim() || '[no stderr]'}`,
          ),
        )
      } else {
        spinner?.succeed()
        finishResolve(stdoutData)
      }
      if (!config.silent) {
        process.stdout.write(stderrData)
        process.stdout.write(stdoutData)
      }
    })
  })
}
const logSuccess = () => {
  logger.success('Success!')
}
const parseCommitResponse = (rawResponse) => {
  const text = String(rawResponse || '').trim()
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    if (parsed?.zh && parsed?.en) {
      return {
        zh: parsed.zh.trim(),
        en: parsed.en.trim(),
      }
    }
  } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0])
    if (parsed?.zh && parsed?.en) {
      return {
        zh: parsed.zh.trim(),
        en: parsed.en.trim(),
      }
    }
  } catch {}
  return null
}
const generateCommitMessagesWithLLM = async (llm, diff, provider, model) => {
  const buildPrompt = () =>
    [
      'You are a JSON-only output machine. Output raw JSON with no markdown, no explanation, no preamble.',
      '',
      'Task:',
      'Generate ONE Conventional Commit message based on the git diff.',
      '',
      'Output EXACTLY in this JSON format:',
      '{ "en": "message", "zh": "message" }',
      '',
      'Example (do NOT copy this, it is only to show the format):',
      '{ "en": "fix(blob-cache): resolve stale entry eviction", "zh": "fix(blob-cache): 修复过期条目未被清除的问题" }',
      '',
      'Rules:',
      '- Use Conventional Commit format: type(scope): subject.',
      '- type MUST be one of: feat, fix, docs, style, refactor, perf, test, chore, ci, build.',
      '- The scope MUST follow ALL of these rules:',
      '  1. MUST be lowercase.',
      '  2. MUST be a single word if possible; use kebab-case (words separated by hyphens) only when a single word is insufficient.',
      '  3. MUST be 2-15 characters long.',
      '  4. MUST be a concise module or feature name (NOT a sentence).',
      '  5. MUST NOT contain verbs (only nouns or noun phrases).',
      '- "en" and "zh" MUST share the SAME type and scope — copy them character-for-character, do NOT translate.',
      '- "en" subject MUST start with a lowercase letter.',
      '- "zh" subject MUST contain Chinese characters.',
      '- Keep each message to ONE line only.',
      '- Both messages must NOT contain double quotes or newlines.',
      '',
      'Git diff:',
      diff.slice(0, 4000),
    ].join('\n')
  const response = await llm.generate({
    provider,
    model,
    prompt: buildPrompt(),
    temperature: 0.2,
    format: 'json',
    think: false,
  })
  const parsed = parseCommitResponse(response?.content)
  if (!parsed?.zh || !parsed?.en) return null
  return parsed
}
const updateRepo = async () => {
  await startSpawnPipe('git', ['fetch', '--prune'], { silent: true })
}
const inquireBranch = async (remote) => {
  const branches = (
    await startSpawnPipe(
      'git',
      [
        'for-each-ref',
        '--sort=-committerdate',
        '--format=%(refname:short)',
        '--count=30',
        `refs/remotes/${remote}/`,
      ],
      { silent: true },
    )
  )
    .split('\n')
    .filter(Boolean)
    .map((item, i) => {
      return `${i + 1}) ${item.replace(`${remote}/`, '')}`
    })
  const rawBranch = await select({
    message: 'Select branch:',
    choices: branches,
    pageSize: 15,
  })
  return rawBranch.split(' ')[1]
}
const cmdType = process.argv[2]
const args = process.argv.slice(3)
const handles = {
  '-v': async () => {
    const version = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'package.json'), 'utf8'),
    ).version
    console.log(version)
  },
  query: async () => {
    let remoteAlias = 'gitcut'
    let [remoteUrl, branch, ...paths] = args
    if (!remoteUrl || !branch) {
      const remotes = (await startSpawnPipe('git', ['remote'], { silent: true }))
        .split('\n')
        .filter(Boolean)
      remoteUrl = await select({
        message: 'Select remote:',
        choices: remotes,
      })
      await startSpawnPipe('git', ['fetch', remoteUrl])
      branch = await inquireBranch(remoteUrl)
      paths = (
        await input({
          message: 'Enter file paths (space-separated):',
          validate: (v) => {
            if (v.trim()) {
              return true
            }
            return 'Please enter at least one valid file path.'
          },
        })
      )
        .trim()
        .split(' ')
        .filter(Boolean)
    }
    if (remoteUrl.startsWith('https://') || remoteUrl.startsWith('git@')) {
      const r = await startSpawnPipe('git', ['remote'])
      if (r.includes(remoteAlias)) await startSpawn('git', ['remote', 'rm', remoteAlias])
      await startSpawn('git', ['remote', 'add', remoteAlias, remoteUrl])
    } else {
      remoteAlias = remoteUrl
    }
    await startSpawn('git', ['fetch', remoteAlias, branch])
    // Separate paths that should be excluded
    const excludePaths = []
    const includePaths = []
    paths?.forEach((path) => {
      if (path.startsWith('!')) {
        excludePaths.push(path.slice(1))
      } else {
        includePaths.push(path)
      }
    })
    if (includePaths[0]) {
      await startSpawn('git', ['checkout', `${remoteAlias}/${branch}`, ...includePaths])
    } else {
      await startSpawn('git', ['merge', `${remoteAlias}/${branch}`, '--allow-unrelated-histories'])
    }
    if (excludePaths[0]) {
      await startSpawn('git', ['reset', ...excludePaths])
      await startSpawn('git', ['checkout', '--', ...excludePaths])
    }
    if (remoteAlias === 'gitcut') await startSpawn('git', ['remote', 'rm', remoteAlias])
    logSuccess()
  },
  submit: async () => {
    let msg = args.join(' ')
    const unstagedDiffNames = (
      await startSpawnPipe('git', ['diff', '--name-only'], { silent: true })
    ).trim()
    if (unstagedDiffNames) {
      const shouldStageAll = await select({
        message: 'Unstaged changes detected. Stage them?',
        choices: [
          { name: 'Yes, stage and commit', value: true },
          { name: 'No, commit staged only', value: false },
        ],
      })
      if (shouldStageAll) {
        await startSpawn('git', ['add', '.'])
      }
    }
    if (!msg) {
      const stagedDiff = (
        await startSpawnPipe('git', ['diff', '--cached', '-U1', '--no-color', '--no-prefix'], {
          silent: true,
        })
      ).trim()
      if (!stagedDiff) {
        logger.warn('No changes to commit.')
        return
      }
      const llm = await createLLM()
      const providers = llm.listProviders()
      if (!providers.length) {
        logger.error('No LLM providers available.')
        return
      }
      let provider = providers[0]
      if (providers.length > 1) {
        provider = await select({
          message: 'Select LLM provider:',
          choices: providers.map((item) => ({
            name: item,
            value: item,
          })),
        })
      }
      const models = llm.listModels(provider)
      if (!models.length) {
        logger.error(`No models available for ${provider}.`)
        return
      }
      let model = models[0]
      if (models.length > 1) {
        model = await select({
          message: 'Select model:',
          choices: models.map((item) => ({
            name: item,
            value: item,
          })),
        })
      }
      const generatingSpinner = ora('Generating commit message...').start()
      const generated = await generateCommitMessagesWithLLM(llm, stagedDiff, provider, model)
      if (!generated?.zh || !generated?.en) {
        generatingSpinner.fail('Failed to generate commit message.')
        return
      }
      generatingSpinner.stop()
      msg = await select({
        message: 'Select language for commit message:',
        choices: [
          {
            name: generated.en,
            value: generated.en,
          },
          {
            name: generated.zh,
            value: generated.zh,
          },
        ],
      })
    }
    await startSpawn('git', ['commit', '-m', msg])
    await startSpawn('git', ['pull'])
    await startSpawn('git', ['push'])
    logSuccess()
  },
  rc: async () => {
    await startSpawn('git', ['add', '.'])
    await startSpawn('git', ['rebase', '--continue'])
    await startSpawn('git', ['push'])
    logSuccess()
  },
  bh: async () => {
    let branch = args[0]
    if (branch === '-l') {
      await updateRepo()
      const branches = (
        await startSpawnPipe(
          'git',
          [
            'for-each-ref',
            '--sort=-committerdate',
            '--format=%(refname:short)',
            '--count=15',
            'refs/remotes',
          ],
          { silent: true },
        )
      )
        .split('\n')
        .filter(Boolean)
        .join('\n')
      console.log(colors.cyan(branches))
      return
    }
    let showEmoji = false
    if (branch === '-e') {
      showEmoji = true
      branch = undefined
    }
    if (!branch) {
      const emojis = {
        feature: '🎉',
        hotfix: '🐛',
      }
      const type = await select({
        message: 'Select branch type:',
        choices: ['feature', 'hotfix'],
      })
      const name = await input({
        message: 'Enter branch name:',
        validate: (v) => {
          if (v.trim()) {
            return true
          }
          return 'Please enter a valid branch name.'
        },
      })
      const answer = { type, name: name.trim() }
      const emoji = showEmoji ? emojis[answer.type] : ''
      branch = `${answer.type}/${answer.name}${emoji}`
    }
    await startSpawn('git', ['checkout', '-b', branch])
    await startSpawn('git', ['push', '-u', 'origin', branch])
    logSuccess()
  },
  cp: async () => {
    const remote = 'origin'
    const branch = await inquireBranch(remote)
    const commits = (
      await startSpawnPipe('git', ['log', '--format=%h %s', '-n', 50, `${remote}/${branch}`], {
        silent: true,
      })
    )
      .split('\n')
      .filter(Boolean)
      .map((item, i) => {
        return `${i + 1}）${item}`
      })
    const selectedCommits = await checkbox({
      message: 'Select commits to cherry-pick:',
      choices: commits,
      pageSize: 15,
      validate: (v) => {
        if (v.length < 1) {
          return 'Please select at least one commit.'
        }
        return true
      },
    })
    const hashes = selectedCommits.map((item) => item.split(' ')[0].split('）')[1])
    await startSpawn('git', ['cherry-pick', ...hashes.reverse()])
    logSuccess()
  },
  mg: async () => {
    const remote = 'origin'
    await updateRepo()
    const branch = await inquireBranch(remote)
    await startSpawn('git', ['merge', `${remote}/${branch}`])
  },
  stats: async () => {
    const range = args[0] || '1.week'
    await updateRepo()
    const shellCommand = `git log --all --no-merges --since=${range}.ago --pretty='%an' --numstat`
    const stdout = await startSpawnPipe('sh', ['-c', shellCommand], { silent: true })
    const lines = stdout.split('\n')
    const stats = {}
    let currentAuthor = ''
    lines.forEach((line) => {
      if (line.trim() === '') return
      if (!line.includes('\t')) {
        // The author name is on its own line and contains no tab
        currentAuthor = line.trim()
        if (!stats[currentAuthor]) {
          stats[currentAuthor] = { added: 0, deleted: 0, commits: 0 }
        }
        stats[currentAuthor].commits += 1
        return
      }
      // The following lines are file change stats for this commit
      const [added, deleted] = line.split('\t').slice(0, 2)
      if (added !== '-' && !Number.isNaN(Number.parseInt(added))) {
        stats[currentAuthor].added += Number.parseInt(added)
      }
      if (deleted !== '-' && !Number.isNaN(Number.parseInt(deleted))) {
        stats[currentAuthor].deleted += Number.parseInt(deleted)
      }
    })
    const authors = Object.keys(stats)
      .map((author) => ({
        name: author,
        added: stats[author].added,
        deleted: stats[author].deleted,
        total: stats[author].added + stats[author].deleted,
        commits: stats[author].commits,
        displayWidth: stringWidth(author), // Calculate actual display width
      }))
      .sort((a, b) => b.total - a.total)

    // Use display width to calculate max length
    const maxNameWidth = authors.reduce((max, author) => Math.max(max, author.displayWidth), 0)
    const maxAddedLen = authors.reduce(
      (max, author) => Math.max(max, author.added.toString().length),
      0,
    )
    const maxDeletedLen = authors.reduce(
      (max, author) => Math.max(max, author.deleted.toString().length),
      0,
    )
    const maxTotalLen = authors.reduce(
      (max, author) => Math.max(max, author.total.toString().length),
      0,
    )
    const maxCommitsLen = authors.reduce(
      (max, author) => Math.max(max, author.commits.toString().length),
      0,
    )
    authors.forEach((author) => {
      // Calculate the number of padding spaces needed
      const padding = ' '.repeat(maxNameWidth - author.displayWidth)
      console.log(
        colors.cyan(author.name + padding),
        '+',
        colors.green(author.added.toString().padStart(maxAddedLen)),
        '-',
        colors.red(author.deleted.toString().padStart(maxDeletedLen)),
        'Σ',
        colors.yellow(author.total.toString().padStart(maxTotalLen)),
        'C',
        colors.magenta(author.commits.toString().padStart(maxCommitsLen)),
      )
    })
  },
}
handles.s = handles.submit
if (!cmdType) {
  startSpawn('git', [])
  process.exit(0)
}
if (handles[cmdType]) {
  handles[cmdType]().catch(() => {})
} else {
  startSpawn('git', [cmdType, ...args]).catch(() => {})
}
