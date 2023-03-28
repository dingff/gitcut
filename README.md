# gitcut

It allows you to simplify multiple git commands into one. And there is no need to worry about errors as it will immediately terminate if any command throws an error.

## Install
```
npm install -g gitcut
```

## Usage
### --init
Generate configuration file.
```
gt --init
```
### query
Pull from a specified repository. It could be helpful when you want to sync updates from a template repository. You can directly use it like this.
```
gt query <remoteUrl> <branch> [paths]
```
Or use alias, which needs to be configured in the configuration file.
```
gt query <alias>
```
### submit
Submit all changes in the workspace. Following the [commitlint-config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum) types, emoji will be automatically added to the commit message. All you need to do is enable it in the configuration file, as it is turned off by default.
```
gt submit <msg>
```
In addition, gt is compatible with all git commands 🎉🎉🎉.