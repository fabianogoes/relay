import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createRelayServer } from '../src/server.ts'
import { makeDeps } from '../src/index.ts'
import { watchWorkspace } from '../src/watcher.ts'
import { makeWorkspace } from '../support/workspace.ts'
import { WebSocket } from 'ws'
import type { RelayMessage } from '../src/server.ts'

const TOKEN = 'watch-token'

function connectWs(url: string): Promise<{ ws: WebSocket; messages: RelayMessage[] }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, `relay.${TOKEN}`, { origin: `http://127.0.0.1:${new URL(url).port}` })
    const messages: RelayMessage[] = []
    ws.on('message', (data) => messages.push(JSON.parse(data.toString()) as RelayMessage))
    ws.once('open', () => resolve({ ws, messages }))
    ws.once('error', reject)
    ws.once('unexpected-response', (_req, res) => {
      res.resume()
      ws.terminate()
      reject(new Error(`unexpected-response: ${res.statusCode}`))
    })
  })
}

async function waitFor(
  messages: RelayMessage[],
  predicate: (message: RelayMessage) => boolean,
  label: string,
): Promise<RelayMessage> {
  const found = messages.find(predicate)
  if (found) return found
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearInterval(iv)
      reject(new Error(`mensagem esperada nao chegou: ${label}; recebidas=${JSON.stringify(messages)}`))
    }, 2_000)
    const iv = setInterval(() => {
      const hit = messages.find(predicate)
      if (hit) {
        clearTimeout(timeout)
        clearInterval(iv)
        resolve(hit)
      }
    }, 5)
  })
}

test('mudancas agrupadas sinalizam refreshing e publicam um snapshot apos 150 ms de quiescencia', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({
    workspace: ws.dir,
    execEnabled: true,
    token: TOKEN,
    deps: makeDeps(ws.dir, { workspace: ws.dir, execEnabled: true }),
  })
  const watcher = watchWorkspace(ws.dir, {
    onDirty: () => server.broadcastRefreshing(),
    onSettled: () => server.broadcast(),
  })
  try {
    const client = await connectWs(`ws://127.0.0.1:${server.port}/ws`)
    const initial = await waitFor(client.messages, (message) => message.kind === 'snapshot', 'snapshot inicial')
    assert.equal(initial.kind, 'snapshot')
    if (initial.kind === 'snapshot') {
      assert.equal(initial.payload.state.kind, 'ok')
      if (initial.payload.state.kind === 'ok') assert.equal(initial.payload.state.status, 'backlog')
    }

    const todo = '# Active task: B-001\n\n- [ ] T-001 - Subtarefa\n'
    ws.write('.orchestration/TODO.md', todo)

    await waitFor(client.messages, (message) => message.kind === 'refreshing', 'refreshing')
    await new Promise((resolve) => setTimeout(resolve, 100))
    ws.write('.orchestration/TODO.md', `${todo}- [ ] T-002 - Outra subtarefa\n`)
    await new Promise((resolve) => setTimeout(resolve, 100))

    const premature = client.messages.find(
      (message) =>
        message.kind === 'snapshot' &&
        message.payload.state.kind === 'ok' &&
        message.payload.state.todo.length === 2,
    )
    assert.equal(premature, undefined)

    const updated = await waitFor(
      client.messages,
      (message) =>
        message.kind === 'snapshot' &&
        message.payload.state.kind === 'ok' &&
        message.payload.state.todo.length === 2,
      'snapshot com duas subtarefas',
    )
    assert.equal(updated.kind, 'snapshot')
    if (updated.kind === 'snapshot' && updated.payload.state.kind === 'ok') {
      assert.equal(updated.payload.state.activeBacklogId, 'B-001')
      assert.equal(updated.payload.state.todo[1].id, 'T-002')
    }
    client.ws.close()
  } finally {
    watcher.close()
    await server.close()
    ws.cleanup()
  }
})
