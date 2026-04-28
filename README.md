# Gitcut

A modern, interactive Git CLI to simplify your daily workflows

## Why

- **Ship faster with fewer manual steps**: turn multi-command Git flows into single `gt` commands.
- **Avoid costly mistakes**: interactive confirmations make risky operations like cherry-pick and merge safer.
- **Keep team history cleaner**: standardized commit and branch workflows improve consistency across contributors.

## Install

```bash
npm install -g gitcut
```

After installation, use the `gt` command as a streamlined alternative to `git`.

## Command Overview

| Command                                      | Description                                                                     | Example                               |
| -------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| `gt query <remote> <branch> <paths...>`      | Pull specific files/directories; merges branch when no include path is provided | `gt query origin main src/components` |
| `gt submit "<message>"` / `gt s "<message>"` | Commit, pull, and push in one step                                              | `gt s "fix: resolve login issue"`     |
| `gt submit` / `gt s`                         | Auto-generate commit message with a local LLM (Ollama or LM Studio)             | `gt s`                                |
| `gt bh [name]`                               | Create and push a branch (interactive supported)                                | `gt bh feature/new-checkout`          |
| `gt bh -l`                                   | List remote branches                                                            | `gt bh -l`                            |
| `gt cp`                                      | Interactive cherry-pick                                                         | `gt cp`                               |
| `gt mg`                                      | Interactive branch merge                                                        | `gt mg`                               |
| `gt rc`                                      | Continue rebase quickly                                                         | `gt rc`                               |
| `gt stats [time-range]`                      | Show contribution stats by author                                               | `gt stats 2.weeks`                    |

## License

MIT
