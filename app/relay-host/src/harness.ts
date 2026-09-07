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

interface HarnessSpec {
  id: string
  name: string
  bin: string
  versionFlags: string[]
  authFiles: string[]
}

const HARNESS_SPECS: HarnessSpec[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    bin: 'claude',
    versionFlags: ['--version'],
    authFiles: ['.claude', '.claude.json'],
  },
  {
    id: 'codex',
    name: 'Codex',
    bin: 'codex',
    versionFlags: ['--version'],
    authFiles: ['.codex/auth.json'],
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    bin: 'opencode',
    versionFlags: ['--version'],
    authFiles: ['.local/share/opencode/auth.json'],
  },
]

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