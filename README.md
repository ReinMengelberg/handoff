# handoff

Copy a coding-agent session — Claude Code, Codex or OpenCode — together with its project to another
machine over ssh, and resume it there in a [Herdr](https://herdr.dev) terminal. It copies, never moves:
the local session stays as it is. Any ssh alias works: a VPS, a box at home, a cloud VM.

## Install

### Claude Code plugin (adds `/handoff`)

At the prompt of a Claude Code terminal session:

```
/plugin install handoff --marketplace ReinMengelberg/handoff
```

Answer `y` to add the marketplace, then pick a scope (Enter for the user scope).

From a shell:

```
claude plugin install handoff --marketplace ReinMengelberg/handoff
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace
with `ReinMengelberg/handoff`, then Add plugin.

### Shell command only

```
curl -fsSL https://raw.githubusercontent.com/ReinMengelberg/handoff/main/bin/handoff -o ~/.local/bin/handoff
chmod +x ~/.local/bin/handoff
```

## Usage

In Claude Code (Claude sessions):

```
/handoff <ssh-alias>                     # this Claude session
/handoff <ssh-alias> <session-id>        # another Claude session of this folder
/handoff --list                          # this folder's Claude sessions
/handoff --hosts                         # aliases in ~/.ssh/config
```

From a shell, run inside the project folder (Claude Code, Codex and OpenCode):

```
handoff <claude|codex|opencode> <ssh-alias> [session-id]
handoff <agent> --list
handoff --hosts
```

## What it does

1. **Copies the project** to `~/<folder>` on the target: git-tracked and untracked files, `.gitignore`
   respected, history and uncommitted work included. Cloud-only iCloud files are downloaded first.
   A git worktree becomes a standalone repo on the same branch, with its staged and unstaged changes.
2. **Makes git remotes work there.** An ssh remote the target can't log in to is switched to https,
   and an https remote without a login there is switched to ssh when the target has an ssh login to
   that host. This is set in the target's copy only (`url.*.insteadOf`); your local repo is untouched.
3. **Copies the session** with local paths rewritten to the target's (Claude/Codex: the session file;
   OpenCode: `opencode export` → `opencode import`).
4. **Resumes it** with `claude --resume` / `codex resume` / `opencode -s` as a Herdr terminal on that machine,
   adding the machine to Herdr on first use. Without Herdr (`hc`), it prints the command to resume by hand.

## Requirements

- ssh access to the target (an alias in `~/.ssh/config` or `user@host`), with `tar` and `git` there
- the agent installed and signed in on the target
- optional: [Herdr](https://herdr.dev) (`hc`) locally, to open the resumed session

## Options

| Variable | Effect |
| --- | --- |
| `HANDOFF_HOST` | default ssh alias when none is given |
| `HANDOFF_DEST` | parent folder for the project there (default: the remote home) |
| `HANDOFF_ENV=1` | also copy gitignored `.env*` files |
| `HANDOFF_AGENT_ARGS` | extra flags for the agent there |
| `HANDOFF_NO_HERDR=1` | copy only; print the resume command |

## License

MIT
