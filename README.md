# gitcut

Shortcuts for git

## Install
```
npm install -g gitcut
```

## Usage
生成配置文件
```
gt --init
```
从远程源拉取代码
```
// 直接使用
gt query <remoteUrl> <branch> [paths]

// 使用别名（需在配置文件中配置）
gt query <alias>
```

提交工作区所有内容。遵循提交规范，提交信息会自动加上 emoji 😈（需在配置文件中配置）
```
gt submit <msg>
```
此外，gt 兼容 git 的所有命令 🎉🎉🎉