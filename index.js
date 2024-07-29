const { spawn, spawnSync } = require('child_process')
const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')

const [error, warning, success, info, gray] = [
  chalk.bold.red,
  chalk.bold.yellow,
  chalk.bold.green,
  chalk.cyan,
  chalk.gray,
]
const getHintPre = (t) => `${gray('[')}${t}${gray(']')} `
const WARN = getHintPre(warning('WARN'))
const ERROR = getHintPre(error('ERROR'))
const OK = getHintPre(success('OK'))
const inquirerPageSize = 15

const startSpawn = (c, p) => {
  return new Promise((resolve, reject) => {
    ora(`${c} ${p.join(' ')}`).succeed()
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
      ['for-each-ref', '--sort=-committerdate', '--format=%(refname:short)', '--count=30', `refs/remotes/${remote}/`],
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
    const version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version
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
        const remotes = (await startSpawnPipe('git', ['remote'], { silent: true })).split('\n').filter(Boolean)
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
                } else {
                  return 'Please enter a valid path'
                }
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
        await startSpawn('git', ['merge', `${remoteAlias}/${branch}`, '--allow-unrelated-histories'])
      }
      if (excludePaths[0]) {
        await startSpawn('git', ['reset', ...excludePaths])
        await startSpawn('git', ['checkout', '--', ...excludePaths])
      }
      if (remoteAlias === 'gitcut') await startSpawn('git', ['remote', 'rm', remoteAlias])
      handleSuccess()
    } catch (err) {}
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
        const commitEmoji = emojis[Object.keys(emojis).filter((item) => commitType.includes(item))[0]] || ''
        const space = commitEmoji ? ' ' : ''
        msg = `${commitType}: ${commitEmoji}${space}${commitInfo}`
      }
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['commit', '-m', msg])
      await startSpawn('git', ['pull'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch (err) {}
  },
  rc: async () => {
    try {
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['rebase', '--continue'])
      await startSpawn('git', ['push'])
      handleSuccess()
    } catch (err) {}
  },
  bh: async () => {
    try {
      let branch = args[0]
      if (branch === '-l') {
        await startSpawnPipe('git', ['fetch'])
        const branches = (
          await startSpawnPipe(
            'git',
            ['for-each-ref', '--sort=-committerdate', '--format=%(refname:short)', '--count=15', 'refs/remotes'],
            { silent: true },
          )
        )
          .split('\n')
          .filter(Boolean)
          .join('\n')
        console.log(info(branches))
        return
      }
      if (!branch) {
        const emojis = {
          feature: ':tada:',
          hotfix: ':bug:',
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
              } else {
                return 'Please enter a valid name'
              }
            },
            filter: (v) => {
              return v.trim()
            },
          },
        ])
        branch = `${answer.type}/${answer.name} ${emojis[answer.type]}`
      }
      await startSpawn('git', ['checkout', '-b', branch])
      await startSpawn('git', ['push', '-u', 'origin', branch])
      handleSuccess()
    } catch (err) {}
  },
  cp: async () => {
    try {
      const remote = 'origin'
      const branch = await inquireBranch(remote)
      const commits = (
        await startSpawnPipe('git', ['log', '--format=%h %s', '-n', 50, `${remote}/${branch}`], { silent: true })
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
      await startSpawn('git', ['cherry-pick', ...hashes])
      handleSuccess()
    } catch (err) {}
  },
  mg: async () => {
    try {
      const remote = 'origin'
      await startSpawnPipe('git', ['fetch'])
      const branch = await inquireBranch(remote)
      await startSpawn('git', ['merge', `${remote}/${branch}`])
    } catch (err) {}
  },
}
handles.s = handles.submit
handles[cmdType] ? handles[cmdType]() : startSpawn('git', [cmdType, ...args]).catch(() => {})
