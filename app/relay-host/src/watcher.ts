import { watch, type FSWatcher } from 'node:fs'
import { join } from 'node:path'

export interface Watcher {
  close(): void
}

export interface WatchCallbacks {
  onDirty(): void
  onSettled(): void
}

export const QUIESCENCE_MS = 150

export function watchWorkspace(
  workspace: string,
  callbacks: WatchCallbacks,
  quiescenceMs = QUIESCENCE_MS,
): Watcher {
  const dirs = [join(workspace, '.orchestration'), join(workspace, '.specs')]
  let timer: NodeJS.Timeout | null = null
  const watchers: Array<FSWatcher | null> = dirs.map((dir) => {
    try {
      return watch(dir, () => {
        if (timer) {
          clearTimeout(timer)
        } else {
          callbacks.onDirty()
        }
        timer = setTimeout(() => {
          timer = null
          callbacks.onSettled()
        }, quiescenceMs)
      })
    } catch {
      return null
    }
  })
  return {
    close() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      for (const w of watchers) w?.close()
    },
  }
}
