# Gitcut

A modern, interactive Git CLI to simplify your daily workflows.

## Why

- **Reduce repetitive commands**: encapsulate common Git flows into reusable commands
- **Lower operational risk**: interactive workflows help reduce mistakes
- **Improve workflow consistency**: standardize commit styles and branch operations

## Install

```bash
npm install -g gitcut
```

After installation, use the `gt` command as a streamlined alternative to `git`.

## Command Overview

| Command                                      | Description                                          | Example                                |
| -------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `gt query <remote> <branch> <paths...>`      | Pull specific files/directories from a remote branch | `gt query origin main src/components`  |
| `gt submit "<message>"` / `gt s "<message>"` | Commit and push in one step                          | `gt submit "fix: resolve login issue"` |
| `gt submit` / `gt s`                         | Auto-generate commit message with local Ollama       | `gt submit`                            |
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

Run without arguments to enter interactive mode.

### Submit: Standardized Commit and Push

```bash
gt submit "feat: add new feature"
```

When run without a message, Gitcut will use Ollama to generate commit messages:

1. Detect models from local Ollama (`http://127.0.0.1:11434`)
2. Stage changes and send the staged diff to Ollama
3. Generate both English and Simplified Chinese Conventional Commit messages
4. Let you pick one message interactively, then commit/pull/push

## License

MIT
