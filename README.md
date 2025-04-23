# 🚀 Gitcut

Gitcut is a streamlined CLI tool that simplifies common Git operations with intuitive commands, making your Git workflow faster and more efficient.

## ✨ Features

- 📥 **Query** - Cherry-pick files from specific branches and repositories
- 📤 **Submit** - Quickly commit and push changes with enhanced commit messages
- 🔀 **Branch Handling** - Create and manage branches with ease
- 🍒 **Cherry Pick** - Interactive cherry-picking from remote branches
- 🔄 **Merge** - Interactive branch merging
- 📊 **Stats** - View contribution statistics by author

## 🛠️ Installation

```bash
npm install -g gitcut
```

## ⚙️ Configuration

Initialize the configuration:

```bash
gt --init
```

This creates a `gtconfig.json` file in your current directory with default settings:

```json
{
  "query": {
    "main": {
      "remoteUrl": "",
      "branch": "",
      "paths": ["src"]
    }
  },
  "submit": {
    "emoji": false
  }
}
```

You can customize this file to add your own presets and preferences.

## 📚 Commands

### query

Pull specific files from a remote branch:

```bash
gt query <remote> <branch> <paths...>
```

You can exclude specific paths by prefixing them with `!`:

```bash
gt query origin main src/components !src/components/deprecated
```

Running without arguments launches interactive mode.

You can also use presets defined in your `gtconfig.json`:

```bash
gt query main
```

### submit

Commit and push changes in one step:

```bash
gt submit "feat: add new feature"
```

Emoji support for commit types can be enabled in the configuration file (`gtconfig.json`) by setting `submit.emoji` to `true`.


When enabled, these emoji prefixes are supported:
- feat: ✨
- fix: 🐛
- docs: 📝
- style: 🎨
- refactor: 🔨
- perf: ⚡️
- test: ✅
- chore: 🔧
- ci: 💚
- revert: ⏪
- build: 📦

And you can use `gt s` as a shorthand for `gt submit`.

### bh (branch handling)

Create and push a new branch:

```bash
gt bh feature/new-feature
```

List remote branches:

```bash
gt bh -l
```

Create branch with interactive prompt:

```bash
gt bh
```

Create branch with emoji:

```bash
gt bh -e
```

### cp (cherry pick)

Interactive cherry-picking:

```bash
gt cp
```

### mg (merge)

Interactive branch merging:

```bash
gt mg
```

### rc (rebase continue)

Simplifies the rebase continue process:

```bash
gt rc
```

### stats

View contribution statistics:

```bash
gt stats [time-range]
```

Default time range is 1 week. Examples:
```bash
gt stats 2.weeks
gt stats 1.month
```


## 📄 License

MIT