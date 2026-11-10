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

## boxd VMs: wake on handoff, sleep when quiet

For a [boxd](https://boxd.sh) target (an alias `<vm>.boxd`, with the `boxd` CLI installed locally), handoff also:

- **wakes the VM** first (resume, wake or start, whatever state it is in);
- installs **`handoff-sleep`** there, a systemd user service that hibernates the VM once no agent is working and
  no terminal has had input or output for `SLEEP_MIN` minutes (default 10; set in `~/.config/handoff/sleep.env`
  on the VM, or with `HANDOFF_SLEEP_MIN` on a handoff; `0` turns it off). Hibernating keeps memory, so terminals
  and agents are where they were when it wakes;
- connects Herdr to it through **`handoff-boxd via`**, which only lets Herdr in while the VM is awake. Herdr can
  stay connected without keeping the VM awake, and its reconnects never wake it. The VM shows as unreachable in
  Herdr while it sleeps; the next handoff, or `handoff-boxd wake <vm>.boxd`, wakes it and Herdr reconnects.

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
| `HANDOFF_SLEEP_MIN` | boxd VMs: minutes of quiet before it hibernates (`0` = never) |

## License

MIT
