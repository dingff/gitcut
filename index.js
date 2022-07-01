const { spawn } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');

const version = '1.2.8';
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

const cmdType = process.argv[2];
const args = process.argv.slice(3);
const startSpawn = (command, params) => {
  return new Promise((resolve, reject) => {
    const cmd = `${command} ${params.join(' ')}`; // 当前执行的命令
    const spinner = ora(cmd).start();
    let stdoutData = '';
    let stderrData = '';
    const process = spawn(command, params);
    process.stdout.on('data', (data) => {
      stdoutData = `${stdoutData}${data}`;
    });
    process.stderr.on('data', (data) => {
      stderrData = `${stderrData}${data}`;
    });
    process.on('close', (data) => {
      if (data) {
        spinner.fail();
        console.log(`${WARN}Uh, something blocked.`);
        reject(stderrData);
      } else {
        spinner.succeed();
        resolve(stdoutData);
      }
      if (stderrData) console.log(`\n${stderrData}`);
      if (stdoutData) console.log(`\n${stdoutData}`);
    });
  });
};

const handles = {
  '-v': () => {
    return console.log(version);
  },
  query: async () => {
    try {
      const remoteAlias = 'gitcut';
      const [remoteUrl, branch, ...paths] = args;
      if(!remoteUrl || !branch) {
        console.log(`${ERROR}Usage: gt query <remoteUrl> <branch> [paths]`);
        return;
      }
      const r = await startSpawn('git', ['remote']);
      if (r.includes(remoteAlias)) await startSpawn('git', ['remote', 'rm', remoteAlias]);
      await startSpawn('git', ['remote', 'add', remoteAlias, remoteUrl]);
      await startSpawn('git', ['fetch', remoteAlias, branch]);
      if (paths[0]) {
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
      chore: ':construction_worker:',
      delete: ':fire:',
    }
    try {
      const [msg] = args;
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
