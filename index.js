import { spawn, spawnSync } from 'node:child_process'
import ora from 'ora'
import colors from 'picocolors'
import fs from 'node:fs'
import path from 'node:path'
import { checkbox, input, select } from '@inquirer/prompts'
import stringWidth from 'string-width'

const error = (s) => colors.bold(colors.red(s))
const warning = (s) => colors.bold(colors.yellow(s))
const success = (s) => colors.bold(colors.green(s))
const info = (s) => colors.cyan(s)
const gray = (s) => colors.gray(s)
const getHintPre = (t) => `${gray('[')}${t}${gray(']')} `
const WARN = getHintPre(warning('WARN'))
const ERROR = getHintPre(error('ERROR'))
const OK = getHintPre(success('OK'))

const startSpawn = (c, p, config = { silent: false }) => {
  return new Promise((resolve, reject) => {
    if (!config.silent) {
      ora(`${c} ${p.join(' ')}`).succeed()
    }
    const subprocess = spawnSync(c, p, { stdio: 'inherit' })
    if (subprocess.status !== 0) {
      reject()
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
    const subprocess = spawn(c, p)
    subprocess.stdout.on('data', (data) => {
      stdoutData = `${stdoutData}${data}`
    })
    subprocess.stderr.on('data', (data) => {
      stderrData = `${stderrData}${data}`
    })
    subprocess.on('close', (code) => {
      if (code !== 0) {
        spinner?.fail()
        console.log(`${WARN}Uh, something went wrong.`)
        reject(stderrData)
      } else {
        spinner?.succeed()
        resolve(stdoutData)
      }
      if (!config.silent) {
        process.stdout.write(stderrData)
        process.stdout.write(stdoutData)
      }
    })
  })
}
const handleSuccess = () => {
  console.log(`${OK}Success!`)
}
const requestWithTimeout = async (url, options = {}, timeout = 1500) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}
const getOllamaModels = async () => {
  try {
    const res = await requestWithTimeout('http://127.0.0.1:11434/api/tags')
    if (!res.ok) return []
    const data = await res.json()
    return (data?.models || []).map((item) => item?.model || item?.name).filter(Boolean)
  } catch {
    return []
  }
}
const parseOllamaCommitResponse = (rawResponse) => {
  try {
    const parsed = JSON.parse(rawResponse)
    if (parsed?.zh && parsed?.en) {
      return {
        zh: String(parsed.zh).trim(),
        en: String(parsed.en).trim(),
      }
    }
  } catch {}
  return null
}
const hasChineseChars = (text) => /[\u4e00-\u9fff]/.test(text)
const normalizeEnglishCommitMessage = (msg) => {
  const text = String(msg || '').trim()
  if (!text) return text
  const sep = ': '
  const idx = text.indexOf(sep)
  if (idx < 0) {
    return text.replace(/[A-Z]/, (c) => c.toLowerCase())
  }
  const header = text.slice(0, idx + sep.length)
  const subject = text.slice(idx + sep.length)
  const normalizedSubject = subject.replace(/[A-Z]/, (c) => c.toLowerCase())
  return `${header}${normalizedSubject}`
}
const generateCommitMessagesWithOllama = async (diff, model) => {
  const buildPrompt = (strictZh = false) =>
    [
      'You are a senior software engineer writing git commit messages.',
      'Based on the git diff, generate two concise Conventional Commit messages.',
      'Rules:',
      '- Keep each message to one line.',
      '- Include type and scope when useful (e.g., feat(cli): ...).',
      '- Use the most appropriate Conventional Commit type from: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.',
      '- Do not default to feat. Infer the type from the actual diff.',
      '- Prefer non-feat types when the change is not a new user-facing capability.',
      '- Do not include markdown, code fences, quotes, or explanations.',
      '- Return only valid JSON with keys: zh, en.',
      '- en must be English.',
      '- en subject must start with a lowercase letter.',
      '- zh must be Simplified Chinese.',
      '- Keep zh and en semantically aligned and use the same commit type.',
      strictZh
        ? '- zh MUST contain Chinese characters. If zh is English, your answer is invalid.'
        : '',
      '',
      'Git diff:',
      diff,
    ]
      .filter(Boolean)
      .join('\n')
  for (let i = 0; i < 2; i++) {
    try {
      const res = await requestWithTimeout(
        'http://127.0.0.1:11434/api/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            stream: false,
            format: 'json',
            options: { temperature: 0.2 },
            prompt: buildPrompt(i > 0),
          }),
        },
        20000,
      )
      if (!res.ok) continue
      const data = await res.json()
      const rawText = data?.response?.trim()
      if (!rawText) continue
      const parsed = parseOllamaCommitResponse(rawText)
      if (!parsed?.zh || !parsed?.en) continue
      if (!hasChineseChars(parsed.zh)) continue
      return {
        ...parsed,
        en: normalizeEnglishCommitMessage(parsed.en),
      }
    } catch {}
  }
  return null
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
    message: 'Which branch do you want?',
    choices: branches,
    pageSize: 15,
  })
  return rawBranch.split(' ')[1]
}
const cmdType = process.argv[2]
const args = process.argv.slice(3)
const handles = {
  '-v': () => {
    const version = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'package.json'), 'utf8'),
    ).version
    console.log(version)
  },
  query: async () => {
    try {
      let remoteAlias = 'gitcut'
      let [remoteUrl, branch, ...paths] = args
      if (!remoteUrl || !branch) {
        const remotes = (await startSpawnPipe('git', ['remote'], { silent: true }))
          .split('\n')
          .filter(Boolean)
        remoteUrl = await select({
          message: 'Which remote do you want?',
          choices: remotes,
        })
        await startSpawnPipe('git', ['fetch', remoteUrl])
        branch = await inquireBranch(remoteUrl)
        paths = (
          await input({
            message: 'Enter the file paths:',
            validate: (v) => {
              if (v.trim()) {
                return true
              }
              return 'Please enter a valid path'
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
        await startSpawn('git', [
          'merge',
          `${remoteAlias}/${branch}`,
          '--allow-unrelated-histories',
        ])
      }
      if (excludePaths[0]) {
        await startSpawn('git', ['reset', ...excludePaths])
        await startSpawn('git', ['checkout', '--', ...excludePaths])
      }
      if (remoteAlias === 'gitcut') await startSpawn('git', ['remote', 'rm', remoteAlias])
      handleSuccess()
    } catch {}
  },
  submit: async () => {
    try {
      let msg = args.join(' ')
      let hasAddedFiles = false
      if (!msg) {
        const models = await getOllamaModels()
        if (!models.length) {
          console.log(`${ERROR}Usage: gt submit <msg>`)
          return
        }
        await startSpawn('git', ['add', '.'])
        hasAddedFiles = true
        const stagedDiff = (
          await startSpawnPipe('git', ['diff', '--cached'], { silent: true })
        ).trim()
        if (!stagedDiff) {
          console.log(`${WARN}No changes to commit.`)
          return
        }
        let model = models[0]
        if (models.length > 1) {
          model = await select({
            message: 'Select Ollama model:',
            choices: models.map((item) => ({
              name: item,
              value: item,
            })),
          })
        }
        const generated = await generateCommitMessagesWithOllama(stagedDiff, model)
        if (!generated?.zh || !generated?.en) {
          console.log(
            `${WARN}Ollama failed to generate commit message, please pass message manually.`,
          )
          return
        }
        msg = await select({
          message: 'Select commit message language:',
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
      if (!hasAddedFiles) {
        await startSpawn('git', ['add', '.'])
      }
      await startSpawn('git', ['commit', '-m', msg])
      await startSpawn('git', ['pull'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch {}
  },
  rc: async () => {
    try {
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['rebase', '--continue'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch {}
  },
  bh: async () => {
    try {
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
        console.log(info(branches))
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
          message: 'What type of branch do you want to create?',
          choices: ['feature', 'hotfix'],
        })
        const name = await input({
          message: 'What is the name of the branch?',
          validate: (v) => {
            if (v.trim()) {
              return true
            }
            return 'Please enter a valid name'
          },
        })
        const answer = { type, name: name.trim() }
        const emoji = showEmoji ? emojis[answer.type] : ''
        branch = `${answer.type}/${answer.name}${emoji}`
      }
      await startSpawn('git', ['checkout', '-b', branch])
      await startSpawn('git', ['push', '-u', 'origin', branch])
      handleSuccess()
    } catch {}
  },
  cp: async () => {
    try {
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
        message: 'Which commits do you want to pick?',
        choices: commits,
        pageSize: 15,
        validate: (v) => {
          if (v.length < 1) {
            return 'You must choose at least one commit'
          }
          return true
        },
      })
      const hashes = selectedCommits.map((item) => item.split(' ')[0].split('）')[1])
      await startSpawn('git', ['cherry-pick', ...hashes.reverse()])
      handleSuccess()
    } catch {}
  },
  mg: async () => {
    try {
      const remote = 'origin'
      await updateRepo()
      const branch = await inquireBranch(remote)
      await startSpawn('git', ['merge', `${remote}/${branch}`])
    } catch {}
  },
  stats: async () => {
    const range = args[0] || '1.week'
    try {
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
    } catch {}
  },
}
handles.s = handles.submit
if (!cmdType) {
  startSpawn('git', [])
  process.exit(0)
}
if (handles[cmdType]) {
  handles[cmdType]()
} else {
  startSpawn('git', [cmdType, ...args]).catch(() => {})
}
