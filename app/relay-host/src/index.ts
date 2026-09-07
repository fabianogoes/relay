import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { readWorkspace } from './reader.ts'
import { buildPayload } from './state.ts'
import { listSpecs } from './specs.ts'
import { detectHarnesses } from './harness.ts'
import { watchWorkspace } from './watcher.ts'
import { createRelayServer, type RelayServer, type ServerDeps } from './server.ts'
import type { Environment } from 'relay-core'

export interface StartOptions {
  workspace: string
  execEnabled: boolean
  port?: number
  onListen?: (port: number) => void
}

export function makeDeps(workspace: string, environment: Environment): ServerDeps {
  const read = () => readWorkspace(workspace)
  const backlogSpecs = (): Array<string | undefined> => {
    const state = buildPayload(read(), environment).state
    return state.kind === 'ok' ? state.backlog.map((e) => e.spec) : []
  }
  return {
    payload() {
      return buildPayload(read(), environment)
    },
    specs() {
      return listSpecs(read(), backlogSpecs())
    },
    changelog() {
      return read().changelog
    },
    spec(id: string) {
      return read().specs[`.specs/${id}`] ?? null
    },
    harnesses() {
      return detectHarnesses()
    },
  }
}

export async function start(options: StartOptions): Promise<RelayServer> {
  const token = randomBytes(32).toString('base64url')
  const environment: Environment = { workspace: options.workspace, execEnabled: options.execEnabled }
  const server = await createRelayServer({
    workspace: options.workspace,
    execEnabled: options.execEnabled,
    token,
    port: options.port,
    deps: makeDeps(options.workspace, environment),
  })
  const watcher = watchWorkspace(options.workspace, () => server.broadcast())
  const originalClose = server.close.bind(server)
  server.close = () => {
    watcher.close()
    return originalClose()
  }
  return server
}

function isMain(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url)
}

if (isMain()) {
  const args = process.argv.slice(2)
  const execEnabled = !args.includes('--no-exec')
  const portArg = args.find((a) => a.startsWith('--port='))
  const port = portArg ? Number(portArg.split('=')[1]) : 0
  const server = await start({ workspace: process.cwd(), execEnabled, port })
  console.log(`relay-host em http://127.0.0.1:${server.port} (exec ${execEnabled ? 'ligado' : 'desligado'})`)
}