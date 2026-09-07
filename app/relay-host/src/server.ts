import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocket, WebSocketServer } from 'ws'
import type { UiPayload } from 'relay-core'
import type { Harness } from './harness.ts'
import type { SpecSummary } from './specs.ts'

const UI_DIST = fileURLToPath(new URL('../../relay-ui/dist', import.meta.url))

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.map': 'application/json',
}

export interface ServerDeps {
  payload(): UiPayload
  specs(): SpecSummary[]
  changelog(): string
  spec(id: string): string | null
  harnesses(): Harness[]
}

export interface RelayServerOptions {
  workspace: string
  execEnabled: boolean
  token: string
  port?: number
  deps: ServerDeps
}

export interface RelayServer {
  port: number
  address: string
  close(): Promise<void>
  broadcast(): void
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function text(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body)
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function bootstrapHtml(options: Pick<RelayServerOptions, 'workspace' | 'execEnabled' | 'token'>): string {
  return [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta name="relay-token" content="${escapeHtml(options.token)}">`,
    `<meta name="relay-workspace" content="${escapeHtml(options.workspace)}">`,
    `<meta name="relay-exec-enabled" content="${options.execEnabled ? 'true' : 'false'}">`,
    '<title>Relay</title>',
    '</head>',
    '<body>',
    `<p>Relay host — workspace: ${escapeHtml(options.workspace)}</p>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

function relayMetas(options: Pick<RelayServerOptions, 'workspace' | 'execEnabled' | 'token'>): string {
  return [
    `<meta name="relay-token" content="${escapeHtml(options.token)}">`,
    `<meta name="relay-workspace" content="${escapeHtml(options.workspace)}">`,
    `<meta name="relay-exec-enabled" content="${options.execEnabled ? 'true' : 'false'}">`,
  ].join('\n    ')
}

function uiIndex(options: Pick<RelayServerOptions, 'workspace' | 'execEnabled' | 'token'>): string | null {
  const file = join(UI_DIST, 'index.html')
  if (!existsSync(file)) return null
  const html = readFileSync(file, 'utf8')
  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>\n    ${relayMetas(options)}`)
  }
  return html
}

function serveStatic(res: ServerResponse, pathname: string): boolean {
  const file = join(UI_DIST, pathname)
  if (!file.startsWith(UI_DIST)) return false
  try {
    if (!existsSync(file) || statSync(file).isDirectory()) return false
    const type = MIME[extname(file)] ?? 'application/octet-stream'
    res.writeHead(200, { 'content-type': type })
    res.end(readFileSync(file))
    return true
  } catch {
    return false
  }
}

export function createRelayServer(options: RelayServerOptions): Promise<RelayServer> {
  const { token, workspace, execEnabled, deps, port = 0 } = options
  const clients = new Set<WebSocket>()
  let serverOrigin = ''

  function broadcast(): void {
    const payload = deps.payload()
    const data = JSON.stringify(payload)
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data)
    }
  }

  function authed(req: IncomingMessage): boolean {
    if (req.headers['sec-fetch-site'] !== 'same-origin') return false
    return req.headers['x-relay-token'] === token
  }

  function handle(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    if (url.pathname === '/' && req.method === 'GET') {
      const ui = uiIndex({ workspace, execEnabled, token })
      if (ui !== null) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        res.end(ui)
      } else {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        res.end(bootstrapHtml({ workspace, execEnabled, token }))
      }
      return
    }
    if (url.pathname.startsWith('/assets/') && req.method === 'GET') {
      if (serveStatic(res, url.pathname)) return
      res.writeHead(404)
      res.end()
      return
    }
    if (!url.pathname.startsWith('/api/')) {
      res.writeHead(404)
      res.end()
      return
    }
    if (!authed(req)) {
      res.writeHead(403)
      res.end()
      return
    }
    if (req.method !== 'GET') {
      res.writeHead(404)
      res.end()
      return
    }
    const parts = url.pathname.split('/').filter(Boolean) // ['api', route, ...]
    const route = parts[1] ?? ''
    if (route === 'state') {
      json(res, 200, deps.payload())
      return
    }
    if (route === 'specs') {
      if (parts.length === 2) {
        json(res, 200, deps.specs())
        return
      }
      const id = decodeURIComponent(parts[2] ?? '')
      const content = deps.spec(id)
      if (content === null) {
        res.writeHead(404)
        res.end()
        return
      }
      text(res, 200, content)
      return
    }
    if (route === 'changelog') {
      text(res, 200, deps.changelog())
      return
    }
    if (route === 'harnesses') {
      json(res, 200, deps.harnesses())
      return
    }
    res.writeHead(404)
    res.end()
  }

  const server: Server = createServer(handle)
  const wss = new WebSocketServer({
    noServer: true,
    handleProtocols(protocols) {
      return protocols.has(`relay.${token}`) ? `relay.${token}` : false
    },
  })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const requestOrigin = req.headers.origin
    const proto = req.headers['sec-websocket-protocol']
    const originOk = requestOrigin === serverOrigin
    const tokenOk = typeof proto === 'string' && proto === `relay.${token}`
    if (url.pathname !== '/ws' || !originOk || !tokenOk) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n')
      socket.destroy()
      return
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      clients.add(ws)
      ws.on('close', () => clients.delete(ws))
      ws.on('error', () => clients.delete(ws))
      ws.send(JSON.stringify(deps.payload()))
    })
  })

  return new Promise((resolve) => {
    server.on('listening', () => {
      const address = server.address() as AddressInfo
      serverOrigin = `http://${address.address}:${address.port}`
      resolve({
        port: address.port,
        address: address.address,
        broadcast,
        close: () =>
          new Promise<void>((done) => {
            for (const client of clients) client.close()
            wss.close()
            server.closeAllConnections()
            server.close(() => done())
          }),
      })
    })
    server.listen(port, '127.0.0.1')
  })
}