#!/usr/bin/env node
import { spawn } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

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
    const spinner = ora(cmd).start(); // 开始状态 => 加载状态
    let output; // 输出
    const process = spawn(command, params);
    process.stdout.on('data', (data) => {
      output = data && data.toString();
    });
    process.on('close', (data) => {
      if (data) {
        spinner.fail();
        console.log(`${WARN}Uh, something blocked. Run "${info(cmd)}" to see a complete log.`);
        reject();
      } else {
        spinner.succeed();
        resolve(output);
      }
    });
  });
};

const handles = {
  '-v': () => {
    return console.log('1.0.0');
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
    try {
      const [msg] = args;
      if (!msg) {
        console.log(`${ERROR}Usage: gt submit <msg>`);
        return;
      }
      await startSpawn('git', ['add', '.']);
      await startSpawn('git', ['commit', '-m', msg]);
      await startSpawn('git', ['pull']);
      await startSpawn('git', ['push']);
      console.log(`${OK}Success!`);
    } catch (err) {}
  },
};
handles[cmdType] ? handles[cmdType]() : startSpawn('git', [cmdType, ...args]).catch(() => {});
