# gitcut

Shortcuts for git

## 安装
```
npm install -g gitcut
```

## 使用
##### 生成配置文件
```
gt --init
```
##### 拉取远程源代码（通常用于从模版项目拉取更新）
直接使用
```
gt query <remoteUrl> <branch> [paths]
```
使用别名（需在配置文件中配置）
```
gt query <alias>
```
##### 提交工作区所有内容
遵循提交规范，提交信息会自动加上 emoji 😈（需在配置文件中配置）
```
gt submit <msg>
```
此外，gt 兼容 git 的所有命令 🎉🎉🎉