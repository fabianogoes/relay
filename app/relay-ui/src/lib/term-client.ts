export type RunSocketStatus = 'connecting' | 'open' | 'closed'

export interface RunSocket {
  connect(runId: string): void
  close(): void
  send(text: string): void
  onData(cb: (data: string) => void): void
  onExit(cb: (code: number | null) => void): void
  onDisk(cb: (entries: unknown[]) => void): void
}

function meta(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null
}

function wsUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws/term`
}

export function createRunSocket(): RunSocket {
  const token = meta('relay-token') ?? ''
  let socket: WebSocket | null = null
  let runId = ''
  const dataCbs = new Set<(data: string) => void>()
  const exitCbs = new Set<(code: number | null) => void>()
  const diskCbs = new Set<(entries: unknown[]) => void>()

  return {
    connect(id: string): void {
      runId = id
      socket = new WebSocket(wsUrl(), `relay.${token}`)
      socket.addEventListener('open', () => {
        socket?.send(JSON.stringify({ kind: 'attach', runId }))
      })
      socket.addEventListener('message', (event) => {
        let msg: { kind?: string; data?: string; exitCode?: number | null; entries?: unknown[] }
        try {
          msg = JSON.parse(String(event.data))
        } catch {
          return
        }
        if (msg.kind === 'data' && msg.data !== undefined) {
          for (const cb of dataCbs) cb(msg.data)
        } else if (msg.kind === 'exit') {
          for (const cb of exitCbs) cb(msg.exitCode ?? null)
        } else if (msg.kind === 'disk' && msg.entries !== undefined) {
          for (const cb of diskCbs) cb(msg.entries)
        }
      })
    },
    close(): void {
      socket?.close()
      socket = null
    },
    send(text: string): void {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ kind: 'input', runId, data: text }))
      }
    },
    onData(cb): void {
      dataCbs.add(cb)
    },
    onExit(cb): void {
      exitCbs.add(cb)
    },
    onDisk(cb): void {
      diskCbs.add(cb)
    },
  }
}
