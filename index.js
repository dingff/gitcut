const { spawn } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const version = '1.4.1';
const [error, warning, success, info, gray] = [
  chalk.bold.red,
  chalk.bold.yellow,
  chalk.bold.green,
  chalk.bold.blue,
  chalk.gray
]
const getHintPre = (t) => `${gray('[')}${t}${gray(']')} `;
const WARN = getHintPre(warning('WARN'));
const ERROR = getHintPre(error('ERROR'));
const OK = getHintPre(success('OK'));

const startSpawn = (c, p) => {
  return new Promise((resolve, reject) => {
    const spinner = ora(`${c} ${p.join(' ')}`).start();
    let stdoutData = '';
    let stderrData = '';
    const subprocess = spawn(c, p);
    subprocess.stdout.on('data', (data) => {
      stdoutData = `${stdoutData}${data}`;
    });
    subprocess.stderr.on('data', (data) => {
      stderrData = `${stderrData}${data}`;
    });
    subprocess.on('close', (code) => {
      if (code !== 0) {
        spinner.fail();
        console.log(`${WARN}Uh, something blocked.`);
        reject(stderrData);
      } else {
        spinner.succeed();
        resolve(stdoutData);
      }
      if (stderrData) process.stdout.write(stderrData);
      if (stdoutData) process.stdout.write(stdoutData);
    });
  });
};
const cmdType = process.argv[2];
const args = process.argv.slice(3);
const configPath = path.join(process.cwd(), 'gtconfig.json');
// 获取不同命令的本地配置
const getConfig = () => {
  if (!fs.existsSync(configPath)) return
  const config = fs.readFileSync(configPath, 'utf8');
  if (config) return JSON.parse(config)[cmdType];
}
const handles = {
  '-v': () => {
    return console.log(version);
  },
  '--init': () => {
    if (fs.existsSync(configPath)) return;
    const defaultConfig = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
    fs.writeFileSync(configPath, defaultConfig);
  },
  query: async () => {
    try {
      const remoteAlias = 'gitcut';
      let [remoteUrl, branch, ...paths] = args;
      const alias = getConfig();
      if (alias?.[remoteUrl]) ({ remoteUrl, branch, paths } = alias[remoteUrl]);
      if(!remoteUrl || !branch) {
        console.log(`${ERROR}Usage: gt query <remoteUrl> <branch> [paths]`);
        return;
      }
      const r = await startSpawn('git', ['remote']);
      if (r.includes(remoteAlias)) await startSpawn('git', ['remote', 'rm', remoteAlias]);
      await startSpawn('git', ['remote', 'add', remoteAlias, remoteUrl]);
      await startSpawn('git', ['fetch', remoteAlias, branch]);
      if (paths?.[0]) {
        await startSpawn('git', ['checkout', `${remoteAlias}/${branch}`, ...paths]);
      } else {
        await startSpawn('git', ['merge', `${remoteAlias}/${branch}`, '--allow-unrelated-histories']);
      }
      await startSpawn('git', ['remote', 'rm', remoteAlias]);
      console.log(`${OK}Success!`);
    } catch (err) {}
  },
  submit: async () => {
    const emojis = {
      feat: ':sparkles:',
      fix: ':bug:',
      docs: ':memo:',
      style: ':lipstick:',
      refactor: ':hammer:',
      perf: ':zap:',
      test: ':white_check_mark:',
      chore: ':wrench:',
      delete: ':fire:',
    }
    try {
      const msg = args.join(' ');
      const commitType = msg.split(':')[0];
      const commitEmoji = emojis[commitType] || '';
      if (!msg) {
        console.log(`${ERROR}Usage: gt submit <msg>`);
        return;
      }
      await startSpawn('git', ['add', '.']);
      await startSpawn('git', ['commit', '-m', `${commitEmoji}${msg}`]);
      await startSpawn('git', ['pull']);
      await startSpawn('git', ['push']);
      console.log(`${OK}Success!`);
    } catch (err) {}
  },
};
handles[cmdType] ? handles[cmdType]() : startSpawn('git', [cmdType, ...args]).catch(() => {});
