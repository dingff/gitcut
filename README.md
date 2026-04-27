# Gitcut

A modern, interactive Git CLI to simplify your daily workflows

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

| Command                                      | Description                                                                      | Example                                |
| -------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| `gt query <remote> <branch> <paths...>`      | Pull specific files/directories (merges branch when no include path is provided) | `gt query origin main src/components`  |
| `gt submit "<message>"` / `gt s "<message>"` | Commit, pull, and push in one step                                               | `gt submit "fix: resolve login issue"` |
| `gt submit` / `gt s`                         | Auto-generate commit message with a local LLM                                    | `gt submit`                            |
| `gt bh [name]`                               | Create and push a branch (interactive supported)                                 | `gt bh feature/new-checkout`           |
| `gt bh -l`                                   | List remote branches                                                             | `gt bh -l`                             |
| `gt cp`                                      | Interactive cherry-pick                                                          | `gt cp`                                |
| `gt mg`                                      | Interactive branch merge                                                         | `gt mg`                                |
| `gt rc`                                      | Continue rebase quickly                                                          | `gt rc`                                |
| `gt stats [time-range]`                      | Show contribution stats by author                                                | `gt stats 2.weeks`                     |

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

If no include path is provided, Gitcut will merge `<remote>/<branch>` into the current branch.

### Submit: Standardized Commit and Push

```bash
gt submit "feat: add new feature"
```

When run without a message, Gitcut will use an available local LLM provider (for example, Ollama) to generate commit messages:

1. Detect available local LLM providers and models
2. Stage changes and send the staged diff to the selected local model
3. Generate both English and Simplified Chinese Conventional Commit messages
4. Let you pick one message interactively, then commit/pull/push

## License

MIT
