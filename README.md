# gitcut

Shortcuts for git

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
Pull from a specified repository. It is helpful when you want to sync updates from a template repository. You can directly use it like this.
```
gt query <remoteUrl> <branch> [paths]
```
Or use alias, which needs to be configured in the configuration file.
```
gt query <alias>
```
### submit
Submit all changes in the workspace. Following [commitlint-config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum) types, the commit message will automatically include emoji 😈. All you need to do is enable it in the configuration file, as it is turned off by default.
```
gt submit <msg>
```
In addition, gt is compatible with all git commands 🎉🎉🎉.