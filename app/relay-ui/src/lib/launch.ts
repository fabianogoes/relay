import { reactive } from 'vue'

export type RelaySkill = 'relay-spec' | 'relay-session'

export interface LaunchPlan {
  bin: string
  args: string[]
  prompt: string
  cwd: string
}

export interface PreflightParams {
  title: string
  skill: RelaySkill
  intent: string
}

export interface PreflightState extends PreflightParams {
  open: boolean
}

const preflight = reactive<PreflightState>({
  open: false,
  title: '',
  skill: 'relay-spec',
  intent: '',
})

export function openPreflight(params: PreflightParams): void {
  preflight.open = true
  preflight.title = params.title
  preflight.skill = params.skill
  preflight.intent = params.intent
}

export function closePreflight(): void {
  preflight.open = false
}

export function usePreflight(): Readonly<PreflightState> {
  return preflight
}

const LOCAL_LAUNCH: Record<string, { bin: string; args: string[]; promptPrefix: (skill: string) => string }> = {
  'claude-code': { bin: 'claude', args: ['-p'], promptPrefix: (skill) => `/${skill}` },
  codex: { bin: 'codex', args: ['exec'], promptPrefix: (skill) => `⟨${skill}⟩` },
  opencode: { bin: 'opencode', args: ['run'], promptPrefix: (skill) => `Use ${skill}` },
}

export function localPreview(
  harness: string,
  skill: RelaySkill,
  intent: string,
  cwd: string,
): LaunchPlan | null {
  const spec = LOCAL_LAUNCH[harness]
  if (!spec) return null
  return {
    bin: spec.bin,
    args: [...spec.args],
    prompt: `${spec.promptPrefix(skill)} ${intent}`.trim(),
    cwd,
  }
}
