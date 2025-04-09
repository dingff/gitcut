const { spawn, spawnSync } = require('node:child_process')
const ora = require('ora')
const colors = require('picocolors')
const fs = require('node:fs')
const path = require('node:path')
const inquirer = require('inquirer')

const error = (s) => colors.bold(colors.red(s))
const warning = (s) => colors.bold(colors.yellow(s))
const success = (s) => colors.bold(colors.green(s))
const info = (s) => colors.cyan(s)
const gray = (s) => colors.gray(s)
const getHintPre = (t) => `${gray('[')}${t}${gray(']')} `
const WARN = getHintPre(warning('WARN'))
const ERROR = getHintPre(error('ERROR'))
const OK = getHintPre(success('OK'))
const inquirerPageSize = 15

const startSpawn = (c, p, config = { silent: false }) => {
  return new Promise((resolve, reject) => {
    if (!config.silent) {
      ora(`${c} ${p.join(' ')}`).succeed()
    }
    const subprocess = spawnSync(c, p, { stdio: 'inherit' })
    subprocess.status !== 0 ? reject() : resolve()
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
    .map((item) => {
      return item.replace(`${remote}/`, '')
    })
  return (
    await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'data',
        message: 'Which branch do you want?',
        choices: branches,
        pageSize: inquirerPageSize,
      },
    ])
  ).data
}
const cmdType = process.argv[2]
const args = process.argv.slice(3)
const configPath = path.join(process.cwd(), 'gtconfig.json')
// 获取不同命令的本地配置
const getConfig = () => {
  if (!fs.existsSync(configPath)) return
  const config = fs.readFileSync(configPath, 'utf8')
  if (config) return JSON.parse(config)[cmdType]
}
const handles = {
  '-v': () => {
    const version = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'),
    ).version
    console.log(version)
  },
  '--init': () => {
    if (fs.existsSync(configPath)) return
    const defaultConfig = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')
    fs.writeFileSync(configPath, defaultConfig)
  },
  query: async () => {
    try {
      let remoteAlias = 'gitcut'
      let [remoteUrl, branch, ...paths] = args
      const alias = getConfig()
      if (alias?.[remoteUrl]) ({ remoteUrl, branch, paths } = alias[remoteUrl])
      if (!remoteUrl || !branch) {
        const remotes = (await startSpawnPipe('git', ['remote'], { silent: true }))
          .split('\n')
          .filter(Boolean)
        remoteUrl = (
          await inquirer.prompt([
            {
              type: 'rawlist',
              name: 'data',
              message: 'Which remote do you want?',
              choices: remotes,
            },
          ])
        ).data
        await startSpawnPipe('git', ['fetch', remoteUrl])
        branch = await inquireBranch(remoteUrl)
        paths = (
          await inquirer.prompt([
            {
              type: 'input',
              name: 'data',
              message: 'Enter the file paths:',
              validate: (v) => {
                if (v) {
                  return true
                }
                return 'Please enter a valid path'
              },
              filter: (v) => {
                return v.trim()
              },
            },
          ])
        ).data
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
      // 区分出要排除在外的路径
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
    } catch (_) {}
  },
  submit: async () => {
    const emojis = {
      feat: ':sparkles:',
      fix: ':bug:',
      docs: ':memo:',
      style: ':art:',
      refactor: ':hammer:',
      perf: ':zap:',
      test: ':white_check_mark:',
      chore: ':wrench:',
      ci: ':green_heart:',
      revert: ':rewind:',
      build: ':package:',
    }
    try {
      const submitConfig = getConfig()
      let msg = args.join(' ')
      if (!msg) {
        console.log(`${ERROR}Usage: gt submit <msg>`)
        return
      }
      const msgToken = msg.split(': ')
      if (msgToken.length > 1 && submitConfig?.emoji === true) {
        const [commitType, commitInfo] = msgToken
        const commitEmoji =
          emojis[Object.keys(emojis).filter((item) => commitType.includes(item))[0]] || ''
        const space = commitEmoji ? ' ' : ''
        msg = `${commitType}: ${commitEmoji}${space}${commitInfo}`
      }
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['commit', '-m', msg])
      await startSpawn('git', ['pull'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch (_) {}
  },
  rc: async () => {
    try {
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['rebase', '--continue'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch (_) {}
  },
  bh: async () => {
    try {
      let branch = args[0]
      if (branch === '-l') {
        await startSpawnPipe('git', ['fetch'])
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
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: 'What type of branch do you want to create?',
            choices: ['feature', 'hotfix'],
          },
          {
            type: 'input',
            name: 'name',
            message: 'What is the name of the branch?',
            validate: (v) => {
              if (v) {
                return true
              }
              return 'Please enter a valid name'
            },
            filter: (v) => {
              return v.trim()
            },
          },
        ])
        const emoji = showEmoji ? emojis[answer.type] : ''
        branch = `${answer.type}/${answer.name}${emoji}`
      }
      await startSpawn('git', ['checkout', '-b', branch])
      await startSpawn('git', ['push', '-u', 'origin', branch])
      handleSuccess()
    } catch (_) {}
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
      const selectedCommits = (
        await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'data',
            message: 'Which commits do you want to pick?',
            choices: commits,
            pageSize: inquirerPageSize,
            validate: (v) => {
              if (v.length < 1) {
                return 'You must choose at least one commit'
              }
              return true
            },
          },
        ])
      ).data
      const hashes = selectedCommits.map((item) => item.split(' ')[0].split('）')[1])
      await startSpawn('git', ['cherry-pick', ...hashes.reverse()])
      handleSuccess()
    } catch (_) {}
  },
  mg: async () => {
    try {
      const remote = 'origin'
      await startSpawnPipe('git', ['fetch'])
      const branch = await inquireBranch(remote)
      await startSpawn('git', ['merge', `${remote}/${branch}`])
    } catch (_) {}
  },
  stats: async () => {
    const range = args[0] || '1.week'
    try {
      // 使用 shell 模式执行复杂的管道命令
      const shellCommand = `git log --no-merges --since=${range}.ago --pretty='%an' --numstat | awk '
NF == 1 { author = $0; next }
NF == 3 { add[author] += $1; del[author] += $2 }
END {
    # 找出最长作者名、最大增加行数位数、最大删除行数位数
    max_name_len = 0
    max_add_len = 0
    max_del_len = 0
    
    for (a in add) {
        name_len = length(a)
        if (name_len > max_name_len) max_name_len = name_len
        
        add_len = length(add[a])
        if (add_len > max_add_len) max_add_len = add_len
        
        del_len = length(del[a])
        if (del_len > max_del_len) max_del_len = del_len
    }
    
    for (a in add)
        printf "%d\\t%d\\t%d\\t%d\\t%d\\t%s\\n", add[a], del[a], max_name_len, max_add_len, max_del_len, a
}' | sort -nr | awk -F'\\t' '
BEGIN {
    COLOR_RESET = "\\x1b[0m"
    COLOR_AUTHOR = "\\x1b[0;36m"   # 作者名：青色
    COLOR_ADD = "\\x1b[0;32m"      # 增加行数：绿色
    COLOR_DEL = "\\x1b[0;31m"      # 删除行数：红色
    COLOR_LABEL = "\\x1b[0m"       # 标签：默认颜色
}
{
    # 使用动态宽度格式化输出，并添加颜色
    printf "%s%-*s%s %s+%s %s%*d%s %s-%s %s%*d%s\\n", 
        COLOR_AUTHOR, $3, $6, COLOR_RESET,
        COLOR_LABEL, COLOR_RESET,
        COLOR_ADD, $4, $1, COLOR_RESET,
        COLOR_LABEL, COLOR_RESET,
        COLOR_DEL, $5, $2, COLOR_RESET
}'`

      // 使用 spawn 的 shell 模式执行
      await startSpawn('sh', ['-c', shellCommand], { silent: true })
    } catch (_) {}
  },
}
handles.s = handles.submit
if (!cmdType) {
  startSpawn('git', [])
  process.exit(0)
}
handles[cmdType] ? handles[cmdType]() : startSpawn('git', [cmdType, ...args]).catch(() => {})
