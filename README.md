# Gitcut

[![npm version](https://img.shields.io/npm/v/gitcut.svg)](https://www.npmjs.com/package/gitcut)
[![license](https://img.shields.io/npm/l/gitcut.svg)](./LICENSE)

Gitcut is a Git CLI for modern workflows.  
It makes everyday workflows faster, safer, and more consistent.

## Why Gitcut

- **Reduce repetitive commands**: encapsulate common Git flows into reusable commands
- **Lower operational risk**: interactive workflows help reduce mistakes
- **Improve workflow consistency**: standardize commit styles and branch operations
- **Ready out of the box**: initialize once and execute via presets

## Installation

```bash
npm install -g gitcut
```

After installation, use the `gt` command as a streamlined alternative to `git`.

## Quick Start

### 1) Initialize Configuration

```bash
gt --init
```

This generates a `gtconfig.json` file in your current directory with the default structure:

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

### 2) Run Common Workflows

```bash
gt query main
gt submit "feat: support xxx"
gt bh feature/awesome-feature
```

## Command Overview

| Command                                      | Description                                          | Example                                |
| -------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `gt query <remote> <branch> <paths...>`      | Pull specific files/directories from a remote branch | `gt query origin main src/components`  |
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
gt query origin main src/components !src/components/deprecated
```

Run without arguments to enter interactive mode, or use presets from `gtconfig.json`:

```bash
gt query main
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
