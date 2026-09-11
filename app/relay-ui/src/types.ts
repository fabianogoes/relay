export type WorkStatus =
  | 'backlog'
  | 'ready'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'idle'

export interface Handoff {
  backlogId: string
  todoId: string
  spec: string
  harness: string
  updated: string
  objective: string
  nextStep: string
  context: string
}

export interface ChecklistEntry {
  id: string
  text: string
  marker: ' ' | '•' | '!' | 'x'
  needs: string[]
  available: boolean
  spec?: string
}

export interface OkState {
  kind: 'ok'
  status: WorkStatus
  handoff: Handoff | null
  activeBacklogId: string | null
  todo: ChecklistEntry[]
  backlog: ChecklistEntry[]
  completed: number
  total: number
}

export interface Violation {
  check: string
  detail: string
  records: string[]
}

export interface InconsistentState {
  kind: 'inconsistent'
  violations: Violation[]
}

export type RelayState = OkState | InconsistentState

export interface Environment {
  workspace: string
  execEnabled: boolean
}

export interface UiPayload {
  state: RelayState
  environment: Environment
}

export type RelayMessage =
  | { kind: 'snapshot'; payload: UiPayload }
  | { kind: 'refreshing' }
