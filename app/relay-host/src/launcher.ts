import { spawn } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { buildLaunchArgv, type LaunchPlan, type RelaySkill } from './harness.ts'

export interface LaunchRequest {
  harness: string
  skill: RelaySkill
  intent: string
}

export interface LaunchResult {
  runId: string
  scratchDir: string
  plan: LaunchPlan
}

export interface LaunchOptions {
  openExternal?: (scriptPath: string) => void
}

const TERMINAL_CANDIDATES = ['Terminal', 'iTerm', 'Ghostty', 'Warp']

export function shellQuote(arg: string): string {
  return `'${arg.replace(/'/g, `'\\''`)}'`
}

export function detectTerminal(): string | null {
  if (process.platform !== 'darwin') return null
  return TERMINAL_CANDIDATES.find((name) => existsSync(join('/Applications', `${name}.app`))) ?? null
}

export function buildWrapperScript(argv: string[], pidPath: string, exitPath: string): string {
  return [
    '#!/bin/sh',
    `echo $$ > ${shellQuote(pidPath)}`,
    argv.map(shellQuote).join(' '),
    `echo $? > ${shellQuote(exitPath)}`,
    '',
  ].join('\n')
}

export function scratchDir(runId: string): string {
  return join(tmpdir(), 'relay-run', runId)
}

export function preview(request: LaunchRequest, cwd: string): LaunchPlan {
  return buildLaunchArgv(request.harness, request.skill, request.intent, cwd)
}

function defaultOpenExternal(scriptPath: string): void {
  const terminal = detectTerminal()
  if (terminal) {
    spawn('open', ['-a', terminal, scriptPath], { detached: true, stdio: 'ignore' }).unref()
  }
}

export function launch(request: LaunchRequest, cwd: string, options: LaunchOptions = {}): LaunchResult {
  const plan = buildLaunchArgv(request.harness, request.skill, request.intent, cwd)
  const runId = randomUUID()
  const dir = scratchDir(runId)
  mkdirSync(dir, { recursive: true })

  const argv = [plan.bin, ...plan.args, plan.prompt]
  const pidPath = join(dir, 'pid')
  const exitPath = join(dir, 'exit')
  const scriptPath = join(dir, 'launch.sh')
  writeFileSync(scriptPath, buildWrapperScript(argv, pidPath, exitPath))
  chmodSync(scriptPath, 0o755)

  const openExternal = options.openExternal ?? defaultOpenExternal
  openExternal(scriptPath)

  return { runId, scratchDir: dir, plan }
}
