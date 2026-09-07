import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { RelayFiles } from 'relay-core'

function safeRead(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

export function readWorkspace(workspace: string): RelayFiles {
  const orchestration = join(workspace, '.orchestration')
  const specsDir = join(workspace, '.specs')
  const specs: Record<string, string> = {}
  let specNames: string[] = []
  try {
    specNames = readdirSync(specsDir).filter((f) => f.endsWith('.md'))
  } catch {
    specNames = []
  }
  for (const name of specNames) {
    specs[`.specs/${name}`] = safeRead(join(specsDir, name))
  }
  return {
    backlog: safeRead(join(orchestration, 'BACKLOG.md')),
    todo: safeRead(join(orchestration, 'TODO.md')),
    handoff: safeRead(join(orchestration, 'HANDOFF.md')),
    changelog: safeRead(join(orchestration, 'CHANGELOG.md')),
    specs,
  }
}