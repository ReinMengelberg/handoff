import type { Register } from 'claude-code'

const HELP = [
  'Usage: /handoff <ssh-alias> [session-id]',
  '  /handoff my-vm.boxd              copy THIS session + project to that machine, resume it in Herdr',
  '  /handoff myvps <session-id>       another Claude session of this folder',
  '  /handoff --list                   this folder\'s Claude sessions',
  '  /handoff --hosts                  aliases in ~/.ssh/config',
  'It copies (never moves): the local session stays as it is.',
].join('\n')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'handoff',
      description: 'Copy this Claude session + project to an ssh host and resume it there in Herdr',
    })
    return next(e)
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    const words = e.args.trim().split(/\s+/).filter(Boolean)
    const first = words[0]
    if (first === undefined || first === '-h' || first === '--help') {
      return { text: HELP, isTextDisplayOnly: true }
    }

    const script = `${$.plugin.root}/bin/handoff`
    let argv: string[]
    if (first === '--hosts') argv = [script, '--hosts']
    else if (first === '--list') argv = [script, 'claude', '--list']
    else argv = [script, 'claude', first, words[1] ?? (await $.session.id())]

    $.ui.status('handoff: copying…')
    try {
      const run = await $.process.run(argv, { cwd: await $.session.cwd(), timeoutMs: 600_000 })
      const out = [run.stdout.trim(), run.stderr.trim()].filter(Boolean).join('\n')
      return { text: out || `handoff exited with ${run.exitCode}`, isTextDisplayOnly: true }
    } catch (err) {
      return { text: `handoff failed: ${String(err)}`, isTextDisplayOnly: true }
    } finally {
      $.ui.status(undefined)
    }
  })
}
