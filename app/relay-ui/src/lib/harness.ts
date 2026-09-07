import { reactive } from 'vue'

export type HarnessState = 'installed' | 'unauthenticated' | 'absent'

export interface Harness {
  id: string
  name: string
  version: string
  state: HarnessState
}

export type ConsentLevel = 'none' | 'session' | 'local'

export interface ConsentOption {
  id: ConsentLevel
  label: string
  description: string
  scopeShort: string
}

export interface HarnessSelection {
  harnessId: string | null
  consent: ConsentLevel
}

export const HARNESS_FIXTURE: Harness[] = [
  { id: 'claude-code', name: 'Claude Code', version: '2.0.24', state: 'installed' },
  { id: 'codex', name: 'Codex', version: '0.48.2', state: 'installed' },
  { id: 'opencode', name: 'OpenCode', version: '', state: 'absent' },
]

export const CONSENT_OPTIONS: ConsentOption[] = [
  {
    id: 'none',
    label: 'Só esta execução',
    description: 'Vale só para esta execução; nada é gravado.',
    scopeShort: 'não grava',
  },
  {
    id: 'session',
    label: 'Enquanto a app estiver aberta',
    description: 'Gravado na sessão desta aba, por workspace.',
    scopeShort: 'sessão',
  },
  {
    id: 'local',
    label: 'Sempre neste workspace',
    description: 'Gravado neste navegador, por workspace.',
    scopeShort: 'workspace',
  },
]

const IDENTITY_TONES: Record<string, 'purple' | 'orange'> = {
  codex: 'purple',
  'claude-code': 'orange',
}

export function harnessTone(id: string): 'purple' | 'orange' | null {
  return IDENTITY_TONES[id] ?? null
}

export function harnessInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function harnessById(id: string | null): Harness | null {
  if (!id) return null
  return HARNESS_FIXTURE.find((h) => h.id === id) ?? null
}

function localStorageKey(workspace: string): string {
  return `relay.harness:${workspace}`
}

const sessionChoices = new Map<string, HarnessSelection>()

const store = reactive<HarnessSelection & { open: boolean }>({
  harnessId: null,
  consent: 'none',
  open: false,
})

export function initHarnessSelection(workspace: string): void {
  const saved = localStorage.getItem(localStorageKey(workspace))
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as HarnessSelection
      store.harnessId = parsed.harnessId
      store.consent = parsed.consent
      return
    } catch {
      // valor corrompido: cai no default abaixo
    }
  }
  const session = sessionChoices.get(workspace)
  if (session) {
    store.harnessId = session.harnessId
    store.consent = session.consent
    return
  }
  store.harnessId = null
  store.consent = 'none'
}

function persist(workspace: string): void {
  const choice: HarnessSelection = { harnessId: store.harnessId, consent: store.consent }
  if (store.consent === 'local') {
    localStorage.setItem(localStorageKey(workspace), JSON.stringify(choice))
    sessionChoices.set(workspace, choice)
  } else if (store.consent === 'session') {
    sessionChoices.set(workspace, choice)
  }
}

export function selectHarness(workspace: string, id: string): void {
  store.harnessId = id
  persist(workspace)
}

export function selectConsent(workspace: string, level: ConsentLevel): void {
  store.consent = level
  persist(workspace)
}

export function openSelector(): void {
  store.open = true
}

export function closeSelector(): void {
  store.open = false
}

export function selection(): Readonly<HarnessSelection & { open: boolean }> {
  return store
}