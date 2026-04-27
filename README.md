# clogex

TUI for exploring [Claude Code](https://claude.ai/code) session logs.

Visualizes token usage, context window, skills, hooks, rules, plugins, agents, and more — directly from your Claude Code JSONL session files.

## Install

```sh
npm install -g clogex
```

Or with bun:

```sh
bun add -g clogex
```

## Usage

```sh
# auto-detect latest session in current project
clogex

# specify a session file directly
clogex ~/.claude/projects/<project-hash>/<session>.jsonl
```

## Tabs

| Key | Tab | Description |
|-----|-----|-------------|
| `1` | timeline | All events in chronological order |
| `2` | skills | Skill invocations |
| `3` | hooks | Hook executions |
| `4` | rules | Active rules |
| `5` | plugins | Loaded plugins |
| `6` | agents | Subagent dispatches |
| `7` | tokens | Token usage per turn with cache hit rate |
| `8` | context | Context window usage visualization |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`8` | Switch tab |
| `←` / `→` | Navigate tabs |
| `↑` / `↓` | Scroll |
| Mouse wheel | Scroll |
| `q` | Quit |

## Build from source

Requires [Bun](https://bun.sh).

```sh
git clone https://github.com/bd-makers/claude-log-ex.git
cd claude-log-ex
bun install
bun run build  # compiles native binary to ~/.local/bin/clogex
```

## License

MIT
