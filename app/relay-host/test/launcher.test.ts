import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { buildWrapperScript, launch, preview, shellQuote } from '../src/launcher.ts'
import { composePrompt, buildLaunchArgv } from '../src/harness.ts'

test('shellQuote cerca argumento e preserva aspas e $', () => {
  assert.equal(shellQuote('plain'), `'plain'`)
  assert.equal(shellQuote("it's"), `'it'\\''s'`)
  assert.equal(shellQuote('$HOME; rm -rf'), `'$HOME; rm -rf'`)
})

test('composePrompt por harness: mesmo intento, prefixo próprio, nenhum --skill', () => {
  assert.equal(composePrompt('claude-code', 'relay-session', 'Retomar sessão'), '/relay-session Retomar sessão')
  assert.equal(composePrompt('codex', 'relay-session', 'Retomar sessão'), '⟨relay-session⟩ Retomar sessão')
  assert.equal(composePrompt('opencode', 'relay-session', 'Retomar sessão'), 'Use relay-session Retomar sessão')
  for (const id of ['claude-code', 'codex', 'opencode']) {
    assert.ok(!composePrompt(id, 'relay-spec', 'x').includes('--skill'))
  }
})

test('buildLaunchArgv devolve bin/args/prompt/cwd com o prompt como elemento único', () => {
  const plan = buildLaunchArgv('codex', 'relay-spec', 'Especificar uma ideia', '/ws')
  assert.deepEqual(plan, {
    bin: 'codex',
    args: ['exec'],
    prompt: '⟨relay-spec⟩ Especificar uma ideia',
    cwd: '/ws',
  })
})

test('preview devolve o mesmo plano que o launch usará', () => {
  assert.deepEqual(
    preview({ harness: 'claude-code', skill: 'relay-session', intent: 'x' }, '/ws'),
    { bin: 'claude', args: ['-p'], prompt: '/relay-session x', cwd: '/ws' },
  )
})

test('launch grava script wrapper com argv entre aspas e PID/exit pelo próprio script', () => {
  let opened: string | null = null
  const result = launch(
    { harness: 'claude-code', skill: 'relay-session', intent: "it's $HOME" },
    '/ws',
    { openExternal: (p) => (opened = p) },
  )
  assert.ok(result.runId.length > 0)
  assert.ok(opened !== null)
  const script = readFileSync(opened as string, 'utf8')
  assert.ok(script.includes(`echo $$ > '${result.scratchDir}/pid'`))
  assert.ok(script.includes(`echo $? > '${result.scratchDir}/exit'`))
  assert.ok(script.includes(`'claude' '-p' '/relay-session it'\\''s $HOME'`))
  assert.equal(result.plan.prompt, "/relay-session it's $HOME")
})

test('buildWrapperScript cita cada elemento de argv separadamente', () => {
  const script = buildWrapperScript(['bin', 'a b', "c'd"], '/r/pid', '/r/exit')
  assert.equal(script, [
    '#!/bin/sh',
    `echo $$ > '/r/pid'`,
    `'bin' 'a b' 'c'\\''d'`,
    `echo $? > '/r/exit'`,
    '',
  ].join('\n'))
})
