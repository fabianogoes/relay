import type { RelayFiles } from 'relay-core'

export interface SpecSummary {
  id: string
  title: string
  taskCount: number
}

function firstTitle(content: string): string {
  const m = content.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

export function listSpecs(files: RelayFiles, backlogSpecs: Array<string | undefined>): SpecSummary[] {
  const counts = new Map<string, number>()
  for (const spec of backlogSpecs) {
    if (!spec) continue
    counts.set(spec, (counts.get(spec) ?? 0) + 1)
  }
  return Object.entries(files.specs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, content]) => ({
      id: path.replace(/^\.specs\//, ''),
      title: firstTitle(content),
      taskCount: counts.get(path) ?? 0,
    }))
}