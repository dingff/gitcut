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
const WARN = `${gray('[')}${warning('WARN')}${gray(']')} `;
const ERROR = `${gray('[')}${error('ERROR')}${gray(']')} `;
const OK = `${gray('[')}${success('OK')}${gray(']')} `;

const cmdType = process.argv[2];
const args = process.argv.slice(3);
const startChildProcess = (command, params) => {
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
        console.log(`${WARN}Uh, something blocked. Run ‘${info(cmd)}’ to view specific logs.`);
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
    return console.log('0.1.1');
  },
  query: async () => {
    try {
      const remoteAlias = 'gitcut';
      const [remoteUrl, branch, ...paths] = args;
      if(!remoteUrl || !branch) {
        console.log(`${ERROR}Usage: gt query <remoteUrl> <branch> [paths]`);
        return;
      }
      const r = await startChildProcess('git', ['remote']);
      if (r.includes(remoteAlias)) await startChildProcess('git', ['remote', 'rm', remoteAlias]);
      await startChildProcess('git', ['remote', 'add', remoteAlias, remoteUrl]);
      await startChildProcess('git', ['fetch', remoteAlias, branch]);
      if (paths[0]) {
        await startChildProcess('git', ['checkout', `${remoteAlias}/${branch}`, ...paths]);
      } else {
        await startChildProcess('git', ['merge', `${remoteAlias}/${branch}`, '--allow-unrelated-histories']);
      }
      await startChildProcess('git', ['remote', 'rm', remoteAlias]);
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
      await startChildProcess('git', ['add', '.']);
      await startChildProcess('git', ['commit', '-m', msg]);
      await startChildProcess('git', ['pull']);
      await startChildProcess('git', ['push']);
      console.log(`${OK}Success!`);
    } catch (err) {}
  },
};
handles[cmdType] ? handles[cmdType]() : startChildProcess('git', [cmdType, ...args]).catch(() => {});
