import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { readWorkspace } from './reader.ts'
import { buildPayload } from './state.ts'
import { listSpecs } from './specs.ts'
import { detectHarnesses } from './harness.ts'
import { launch, preview } from './launcher.ts'
import { watchWorkspace } from './watcher.ts'
import { getRun, startExec, listActiveRuns, executorEvents } from './executor.ts'
import { createRelayServer, type RelayServer, type ServerDeps } from './server.ts'
import type { Environment } from 'relay-core'
import type { RunInfo } from './pty.ts'

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
    launchPreview(request) {
      try {
        return preview(request, workspace)
      } catch {
        return null
      }
    },
    launch(request) {
      return launch(request, workspace)
    },
    launchEmbedded(request) {
      try {
        const plan = preview(request, workspace)
        const run = startExec(plan)
        if (!run) return null
        return { runId: run.runId, scrollback: run.handle.scrollback() }
      } catch {
        return null
      }
    },
    runInfo(runId) {
      const run = getRun(runId)
      if (!run) return null
      return {
        runId: run.runId,
        status: run.handle.status(),
        exitCode: run.handle.exitCode(),
        startedAt: run.handle.startedAt(),
      }
    },
    runWrite(runId, data) {
      getRun(runId)?.handle.write(data)
    },
    runTerminate(runId) {
      getRun(runId)?.handle.terminate()
    },
    runScrollback(runId) {
      return getRun(runId)?.handle.scrollback() ?? null
    },
    runDiskEntries(runId) {
      return getRun(runId)?.disk.entries() ?? []
    },
    runs() {
      const info: RunInfo[] = []
      for (const run of listActiveRuns()) {
        info.push({
          runId: run.runId,
          status: run.handle.status(),
          exitCode: run.handle.exitCode(),
          startedAt: run.handle.startedAt(),
        })
      }
      return info
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
  const watcher = watchWorkspace(options.workspace, () => {
    server.broadcast()
    for (const run of listActiveRuns()) {
      const fresh = run.disk.diff()
      if (fresh.length > 0) server.termDisk(run.runId, fresh)
    }
  })
  executorEvents.runStarted = (run) => {
    run.handle.onData((chunk) =>
      server.termBroadcast(run.runId, JSON.stringify({ kind: 'data', runId: run.runId, data: chunk })),
    )
    run.handle.onExit((code) => server.termExit(run.runId, code))
  }
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