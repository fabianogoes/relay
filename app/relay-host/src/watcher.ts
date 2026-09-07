import { watch, type FSWatcher } from 'node:fs'
import { join } from 'node:path'

export interface Watcher {
  close(): void
}

export function watchWorkspace(workspace: string, onChange: () => void): Watcher {
  const dirs = [join(workspace, '.orchestration'), join(workspace, '.specs')]
  let timer: NodeJS.Timeout | null = null
  const watchers: Array<FSWatcher | null> = dirs.map((dir) => {
    try {
      return watch(dir, () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(onChange, 40)
      })
    } catch {
      return null
    }
  })
  return {
    close() {
      if (timer) clearTimeout(timer)
      for (const w of watchers) w?.close()
    },
  }
}