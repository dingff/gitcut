const { spawn, spawnSync } = require('child_process')
const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const [error, warning, success, info, gray] = [chalk.bold.red, chalk.bold.yellow, chalk.bold.green, chalk.bold.blue, chalk.gray]
const getHintPre = (t) => `${gray('[')}${t}${gray(']')} `
const WARN = getHintPre(warning('WARN'))
const ERROR = getHintPre(error('ERROR'))
const OK = getHintPre(success('OK'))

const startSpawn = (c, p) => {
  return new Promise((resolve, reject) => {
    ora(`${c} ${p.join(' ')}`).succeed()
    const subprocess = spawnSync(c, p, { stdio: 'inherit' })
    subprocess.status !== 0 ? reject() : resolve()
  })
}
const startSpawnPipe = (c, p) => {
  return new Promise((resolve, reject) => {
    const spinner = ora(`${c} ${p.join(' ')}`).start()
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
        spinner.fail()
        console.log(`${WARN}Uh, something went wrong.`)
        reject(stderrData)
      } else {
        spinner.succeed()
        resolve(stdoutData)
      }
      if (stderrData) process.stdout.write(stderrData)
      if (stdoutData) process.stdout.write(stdoutData)
    })
  })
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
        console.log(`${ERROR}Usage: gt query <remoteUrl> <branch> [paths]`)
        return
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
          excludePaths.push(path)
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
      console.log(`${OK}Success!`)
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
      console.log(`${OK}Success!`)
    } catch (err) {}
  },
  rc: async () => {
    try {
      await startSpawn('git', ['add', '.'])
      await startSpawn('git', ['rebase', '--continue'])
      await startSpawn('git', ['push'])
      console.log(`${OK}Success!`)
    } catch (err) {}
  },
}
handles[cmdType] ? handles[cmdType]() : startSpawn('git', [cmdType, ...args]).catch(() => {})
