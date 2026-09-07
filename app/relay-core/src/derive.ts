import { parseBacklog, parseTodo, parseHandoff, parseChangelog } from './parse.ts'
import type { RawEntry, RawHandoff } from './parse.ts'
import { runIntegrityChecks } from './integrity.ts'
import type { ChecklistEntry, Handoff, RelayFiles, RelayState, WorkStatus } from './types.ts'

function withAvailability(entries: RawEntry[]): ChecklistEntry[] {
  const done = new Set(entries.filter((e) => e.marker === 'x').map((e) => e.id))
  return entries.map((e) => {
    const entry: ChecklistEntry = {
      id: e.id,
      text: e.text,
      marker: e.marker as ChecklistEntry['marker'],
      needs: e.needs,
      available: e.marker === ' ' && e.needs.every((n) => done.has(n)),
    }
    if (e.spec !== undefined) entry.spec = e.spec
    return entry
  })
}

function toPublicHandoff(handoff: RawHandoff | null): Handoff | null {
  if (!handoff) return null
  return {
    backlogId: handoff.backlogId,
    todoId: handoff.todoId,
    spec: handoff.spec,
    harness: handoff.harness,
    updated: handoff.updated,
    objective: handoff.objective,
    nextStep: handoff.nextStep,
    context: handoff.context,
  }
}

function deriveStatus(
  handoff: RawHandoff | null,
  todo: ChecklistEntry[],
  backlog: ChecklistEntry[],
): WorkStatus {
  if (handoff) {
    return handoff.status === 'blocked' ? 'blocked' : 'in_progress'
  }
  if (todo.length > 0) {
    if (todo.every((e) => e.marker === 'x')) return 'done'
    if (todo.some((e) => e.available)) return 'ready'
    return 'blocked'
  }
  if (backlog.length > 0) {
    return backlog.every((e) => e.marker === 'x') ? 'done' : 'backlog'
  }
  return 'idle'
}

export function deriveState(files: RelayFiles): RelayState {
  const todoParsed = parseTodo(files.todo)
  const backlogRaw = parseBacklog(files.backlog)
  const handoffParsed = parseHandoff(files.handoff)
  const changelog = parseChangelog(files.changelog)

  const todoEntries = withAvailability(todoParsed.entries)
  const backlogEntries = withAvailability(backlogRaw)

  const violations = runIntegrityChecks({
    handoff: handoffParsed.handoff,
    handoffCount: handoffParsed.count,
    activeBacklogId: todoParsed.activeBacklogId,
    todo: todoParsed.entries,
    backlog: backlogRaw,
    changelog,
    specs: files.specs,
  })

  if (violations.length > 0) {
    return { kind: 'inconsistent', violations }
  }

  return {
    kind: 'ok',
    status: deriveStatus(handoffParsed.handoff, todoEntries, backlogEntries),
    handoff: toPublicHandoff(handoffParsed.handoff),
    activeBacklogId: todoParsed.activeBacklogId,
    todo: todoEntries,
    backlog: backlogEntries,
    completed: todoEntries.filter((e) => e.marker === 'x').length,
    total: todoEntries.length,
  }
}
