import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const RECORDS = ['BACKLOG.md', 'TODO.md', 'HANDOFF.md', 'CHANGELOG.md']

export interface DiskEntry {
  id: number
  type: 'updated' | 'cleared'
  path: string
  at: string
  meaning: string
  before: string
  after: string
}

export interface DiskTracker {
  entries(): DiskEntry[]
  diff(): DiskEntry[]
}

function readRecord(workspace: string, name: string): string {
  try {
    return readFileSync(join(workspace, '.orchestration', name), 'utf8')
  } catch {
    return ''
  }
}

const MEANING: Record<string, string> = {
  'BACKLOG.md': 'Uma tarefa de backlog mudou de estado.',
  'TODO.md': 'As subtarefas ativas foram reescritas.',
  'HANDOFF.md': 'O handoff corrente mudou.',
  'CHANGELOG.md': 'Um registro de trabalho foi acrescentado.',
}

let counter = 0

export function startDiskTracker(workspace: string): DiskTracker {
  let snapshot = new Map<string, string>()
  for (const name of RECORDS) snapshot.set(name, readRecord(workspace, name))
  const entries: DiskEntry[] = []

  return {
    entries: () => entries,
    diff(): DiskEntry[] {
      const fresh: DiskEntry[] = []
      for (const name of RECORDS) {
        const before = snapshot.get(name) ?? ''
        const after = readRecord(workspace, name)
        if (before === after) continue
        snapshot.set(name, after)
        counter += 1
        const entry: DiskEntry = {
          id: counter,
          type: after === '' ? 'cleared' : 'updated',
          path: `.orchestration/${name}`,
          at: new Date().toISOString(),
          meaning: MEANING[name] ?? 'Registro mudou em disco.',
          before,
          after,
        }
        entries.push(entry)
        fresh.push(entry)
      }
      return fresh
    },
  }
}
