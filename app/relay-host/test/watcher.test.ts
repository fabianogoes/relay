import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createRelayServer } from '../src/server.ts'
import { makeDeps } from '../src/index.ts'
import { watchWorkspace } from '../src/watcher.ts'
import { makeWorkspace } from '../support/workspace.ts'
import { WebSocket } from 'ws'
import type { UiPayload } from 'relay-core'

const TOKEN = 'watch-token'

function connectWs(url: string): Promise<{ ws: WebSocket; messages: UiPayload[] }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, `relay.${TOKEN}`, { origin: `http://127.0.0.1:${new URL(url).port}` })
    const messages: UiPayload[] = []
    ws.on('message', (data) => messages.push(JSON.parse(data.toString()) as UiPayload))
    ws.once('open', () => resolve({ ws, messages }))
    ws.once('error', reject)
    ws.once('unexpected-response', (_req, res) => {
      res.resume()
      ws.terminate()
      reject(new Error(`unexpected-response: ${res.statusCode}`))
    })
  })
}

async function waitFor(messages: UiPayload[], predicate: (p: UiPayload) => boolean): Promise<UiPayload> {
  const found = messages.find(predicate)
  if (found) return found
  return new Promise((resolve) => {
    const iv = setInterval(() => {
      const hit = messages.find(predicate)
      if (hit) {
        clearInterval(iv)
        resolve(hit)
      }
    }, 5)
  })
}

test('mudança em .orchestration/ empurra novo UiPayload via WebSocket', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({
    workspace: ws.dir,
    execEnabled: true,
    token: TOKEN,
    deps: makeDeps(ws.dir, { workspace: ws.dir, execEnabled: true }),
  })
  const watcher = watchWorkspace(ws.dir, () => server.broadcast())
  try {
    const client = await connectWs(`ws://127.0.0.1:${server.port}/ws`)
    const initial = await waitFor(client.messages, () => true)
    assert.equal(initial.state.kind, 'ok')
    if (initial.state.kind === 'ok') assert.equal(initial.state.status, 'backlog')

    const todo = '# Active task: B-001\n\n- [ ] T-001 - Subtarefa\n'
    ws.write('.orchestration/TODO.md', todo)
    const updated = await waitFor(client.messages, (p) => p.state.kind === 'ok' && p.state.activeBacklogId === 'B-001')
    assert.equal(updated.state.kind, 'ok')
    if (updated.state.kind === 'ok') {
      assert.equal(updated.state.activeBacklogId, 'B-001')
      assert.equal(updated.state.todo[0].id, 'T-001')
    }
    client.ws.close()
  } finally {
    watcher.close()
    await server.close()
    ws.cleanup()
  }
})