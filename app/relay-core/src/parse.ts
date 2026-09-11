export interface RawEntry {
  id: string
  text: string
  marker: string
  needs: string[]
  spec?: string
}

export interface RawHandoff {
  status: 'in_progress' | 'blocked'
  backlogId: string
  todoId: string
  spec: string
  harness: string
  updated: string
  objective: string
  nextStep: string
  context: string
}

export interface ChangelogRecord {
  date: string
  todoId: string
  title: string
  backlogId: string
  spec: string
  evidence: string
  criteria: string[]
}

export interface ParsedTodo {
  activeBacklogId: string | null
  entries: RawEntry[]
}

export interface ParsedHandoff {
  count: number
  handoff: RawHandoff | null
}

const CHECKLIST_LINE = /^\s*[-*]\s*\[([^\]])\]\s+(\S+)\s*-\s*(.*)$/
const SPEC_ANNOT = /\(spec:\s*([^)]*)\)/
const NEEDS_ANNOT = /\(needs:\s*([^)]*)\)/

function takeAnnot(text: string, re: RegExp): { value: string; rest: string } {
  const m = text.match(re)
  if (!m) return { value: '', rest: text }
  return { value: m[1].trim(), rest: text.replace(re, ' ').trim() }
}

function parseChecklistLines(text: string): RawEntry[] {
  const entries: RawEntry[] = []
  for (const line of text.split('\n')) {
    const m = line.match(CHECKLIST_LINE)
    if (!m) continue
    const id = m[2]
    let rest = m[3]
    const spec = takeAnnot(rest, SPEC_ANNOT)
    rest = spec.rest
    const needs = takeAnnot(rest, NEEDS_ANNOT)
    rest = needs.rest
    const entry: RawEntry = {
      id,
      text: rest.trim(),
      marker: m[1],
      needs: needs.value
        ? needs.value.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }
    if (spec.value) entry.spec = spec.value.replace(/`/g, '')
    entries.push(entry)
  }
  return entries
}

export function parseBacklog(text: string): RawEntry[] {
  return parseChecklistLines(text)
}

export function parseTodo(text: string): ParsedTodo {
  const header = text.match(/^#\s*Active task(?:\s*:\s*(\S+))?\s*$/m)
  const activeBacklogId = header && header[1] ? header[1] : null
  return { activeBacklogId, entries: parseChecklistLines(text) }
}

export function parseHandoff(text: string): ParsedHandoff {
  const trimmed = text.trim()
  if (trimmed === '' || /No active handoff\.?/.test(text)) {
    return { count: 0, handoff: null }
  }

  const kv: Record<string, string> = {}
  const sections: Record<string, string> = {}
  let count = 0
  let currentSection: string | null = null

  for (const line of text.split('\n')) {
    const kvMatch = line.match(/^-\s*([A-Za-z]+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase()
      if (key === 'status') count++
      kv[key] = kvMatch[2].trim()
      currentSection = null
      continue
    }
    const secMatch = line.match(/^##\s+(.+)$/)
    if (secMatch) {
      currentSection = secMatch[1].trim().toLowerCase()
      sections[currentSection] = ''
      continue
    }
    if (currentSection) {
      sections[currentSection] += (sections[currentSection] ? '\n' : '') + line
    }
  }

  const handoff: RawHandoff = {
    status: kv.status === 'blocked' ? 'blocked' : 'in_progress',
    backlogId: kv.backlog ?? '',
    todoId: kv.todo ?? '',
    spec: kv.spec ?? '',
    harness: kv.harness ?? '',
    updated: kv.updated ?? '',
    objective: (sections.objective ?? '').trim(),
    nextStep: (sections['next step'] ?? '').trim(),
    context: (sections.context ?? '').trim(),
  }

  return { count, handoff }
}

export function parseChangelog(text: string): ChangelogRecord[] {
  const records: ChangelogRecord[] = []
  let current: ChangelogRecord | null = null
  let activeField: 'evidence' | null = null
  for (const line of text.split('\n')) {
    const header = line.match(/^##\s+(\S+)\s+-\s+(\S+)\s+-\s+(.*)$/)
    if (header) {
      if (current) records.push(current)
      current = {
        date: header[1],
        todoId: header[2],
        title: header[3].trim(),
        backlogId: '',
        spec: '',
        evidence: '',
        criteria: [],
      }
      activeField = null
      continue
    }
    if (!current) continue
    const kv = line.match(/^-\s*([A-Za-z]+):\s*(.*)$/)
    if (kv) {
      const key = kv[1].toLowerCase()
      const value = kv[2].trim()
      activeField = null
      if (key === 'backlog') current.backlogId = value
      else if (key === 'spec') current.spec = value
      else if (key === 'evidence') {
        current.evidence = value
        activeField = 'evidence'
      } else if (key === 'criteria') {
        current.criteria = value.split(',').map((s) => s.trim()).filter(Boolean)
      }
      continue
    }
    const continuation = line.trim()
    if (activeField && continuation) {
      current[activeField] = current[activeField] ? `${current[activeField]} ${continuation}` : continuation
    }
  }
  if (current) records.push(current)
  return records
}

export function parseSpecCriteria(text: string): string[] {
  const criteria: string[] = []
  let inSection = false
  for (const line of text.split('\n')) {
    if (/^##\s+Acceptance criteria\s*$/i.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^##\s+/.test(line)) break
    if (!inSection) continue
    const m = line.match(/^\s*-\s*(A-\d+)\b/)
    if (m) criteria.push(m[1])
  }
  return criteria
}
