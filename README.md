# Gitcut

A modern, interactive Git CLI to simplify your daily workflows.

## Why

- **Reduce repetitive commands**: encapsulate common Git flows into reusable commands
- **Lower operational risk**: interactive workflows help reduce mistakes
- **Improve workflow consistency**: standardize commit styles and branch operations
- **Ready out of the box**: initialize once and execute via presets

## Install

```bash
npm install -g gitcut
```

After installation, use the `gt` command as a streamlined alternative to `git`.

## Quick Start

### Run Common Workflows

```bash
gt submit "feat: support xxx"
gt bh feature/awesome-feature
```

### Initialize Configuration (Optional)

```bash
gt --init
```

This generates a `gtconfig.json` file in your current directory with the default structure:

```json
{
  "query": {
    "src": {
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

Fill in `remoteUrl` and `branch` before using a preset such as `gt query src`.

## Command Overview

| Command                                      | Description                                          | Example                                |
| -------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `gt query <remote> <branch> <paths...>`      | Pull specific files/directories from a remote branch | `gt query origin main src/components`  |
| `gt query <preset-name>`                     | Run a saved query preset from `gtconfig.json`        | `gt query src`                         |
| `gt submit "<message>"` / `gt s "<message>"` | Commit and push in one step                          | `gt submit "fix: resolve login issue"` |
| `gt bh [name]`                               | Create and push a branch (interactive supported)     | `gt bh feature/new-checkout`           |
| `gt bh -l`                                   | List remote branches                                 | `gt bh -l`                             |
| `gt bh -e`                                   | Create branch with emoji template                    | `gt bh -e`                             |
| `gt cp`                                      | Interactive cherry-pick                              | `gt cp`                                |
| `gt mg`                                      | Interactive branch merge                             | `gt mg`                                |
| `gt rc`                                      | Continue rebase quickly                              | `gt rc`                                |
| `gt stats [time-range]`                      | Show contribution stats by author                    | `gt stats 2.weeks`                     |

## Key Features

### Query: Precise Path-Based Retrieval

```bash
gt query <remote> <branch> <paths...>
```

Exclude paths with the `!` prefix:

```bash
gt query origin main src/components '!src/components/deprecated'
```

Run without arguments to enter interactive mode, or use a preset name from `gtconfig.json`:

```bash
gt query src
```

### Submit: Standardized Commit and Push

```bash
gt submit "feat: add new feature"
```

Set `submit.emoji` to `true` in `gtconfig.json` to enable emoji mapping for commit types:

- `feat` → ✨
- `fix` → 🐛
- `docs` → 📝
- `style` → 🎨
- `refactor` → 🔨
- `perf` → ⚡️
- `test` → ✅
- `chore` → 🔧
- `ci` → 💚
- `revert` → ⏪
- `build` → 📦

## License

MIT
