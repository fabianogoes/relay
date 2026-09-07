import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface TempWorkspace {
  dir: string
  write(file: string, content: string): void
  cleanup(): void
}

export function makeWorkspace(initial: Array<[string, string]> = []): TempWorkspace {
  const dir = mkdtempSync(join(tmpdir(), 'relay-host-'))
  mkdirSync(join(dir, '.orchestration'), { recursive: true })
  mkdirSync(join(dir, '.specs'), { recursive: true })
  const defaults: Array<[string, string]> = [
    ['.orchestration/BACKLOG.md', '# Backlog\n\n- [ ] B-001 - Tarefa (spec: .specs/20260907-001-teste.md)\n'],
    ['.orchestration/TODO.md', '# Active task\n\nNo active task.\n'],
    ['.orchestration/HANDOFF.md', '# Handoff\n\nNo active handoff.\n'],
    ['.orchestration/CHANGELOG.md', '# Change log\n'],
    ['.specs/20260907-001-teste.md', '# 20260907-001 - Teste\n\n## Acceptance criteria\n- A-001 - um\n'],
  ]
  for (const [file, content] of [...defaults, ...initial]) {
    writeFileSync(join(dir, file), content)
  }
  return {
    dir,
    write(file, content) {
      writeFileSync(join(dir, file), content)
    },
    cleanup() {
      rmSync(dir, { recursive: true, force: true })
    },
  }
}