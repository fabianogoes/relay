import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type HarnessState = 'installed' | 'unauthenticated' | 'absent'

export interface Harness {
  id: string
  name: string
  version: string
  state: HarnessState
}

export type RelaySkill = 'relay-spec' | 'relay-session'

export interface LaunchPlan {
  bin: string
  args: string[]
  prompt: string
  cwd: string
}

interface HarnessSpec {
  id: string
  name: string
  bin: string
  versionFlags: string[]
  authFiles: string[]
  launchArgs: string[]
  promptPrefix: (skill: string) => string
}

const HARNESS_SPECS: HarnessSpec[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    bin: 'claude',
    versionFlags: ['--version'],
    authFiles: ['.claude', '.claude.json'],
    launchArgs: ['-p'],
    promptPrefix: (skill) => `/${skill}`,
  },
  {
    id: 'codex',
    name: 'Codex',
    bin: 'codex',
    versionFlags: ['--version'],
    authFiles: ['.codex/auth.json'],
    launchArgs: ['exec'],
    promptPrefix: (skill) => `⟨${skill}⟩`,
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    bin: 'opencode',
    versionFlags: ['--version'],
    authFiles: ['.local/share/opencode/auth.json'],
    launchArgs: ['run'],
    promptPrefix: (skill) => `Use ${skill}`,
  },
]

function specById(id: string): HarnessSpec | null {
  return HARNESS_SPECS.find((spec) => spec.id === id) ?? null
}

function detectOne(spec: HarnessSpec): Harness {
  let version = ''
  let state: HarnessState = 'absent'
  try {
    const out = execFileSync(spec.bin, spec.versionFlags, { stdio: 'pipe', timeout: 5000 })
    version = out.toString().trim().split('\n')[0] ?? ''
    state = spec.authFiles.some((f) => existsSync(join(homedir(), f))) ? 'installed' : 'unauthenticated'
  } catch {
    state = 'absent'
  }
  return { id: spec.id, name: spec.name, version, state }
}

export function detectHarnesses(): Harness[] {
  return HARNESS_SPECS.map(detectOne)
}

export function composePrompt(harnessId: string, skill: RelaySkill, intent: string): string {
  const spec = specById(harnessId)
  if (!spec) throw new Error(`harness desconhecido: ${harnessId}`)
  const prompt = `${spec.promptPrefix(skill)} ${intent}`.trim()
  return prompt
}

export function buildLaunchArgv(
  harnessId: string,
  skill: RelaySkill,
  intent: string,
  cwd: string,
): LaunchPlan {
  const spec = specById(harnessId)
  if (!spec) throw new Error(`harness desconhecido: ${harnessId}`)
  return {
    bin: spec.bin,
    args: [...spec.launchArgs],
    prompt: composePrompt(harnessId, skill, intent),
    cwd,
  }
}
