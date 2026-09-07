import { test } from 'node:test'
import assert from 'node:assert/strict'

import { createRelayServer, type ServerDeps } from '../src/server.ts'
import { readWorkspace } from '../src/reader.ts'
import { buildPayload } from '../src/state.ts'
import { listSpecs } from '../src/specs.ts'
import { preview } from '../src/launcher.ts'
import { makeWorkspace } from '../support/workspace.ts'
import { WebSocket } from 'ws'
import type { UiPayload } from 'relay-core'

const TOKEN = 'test-token'

function makeDeps(workspace: string): ServerDeps {
  const read = () => readWorkspace(workspace)
  const backlogSpecs = () => {
    const state = buildPayload(read(), { workspace, execEnabled: true }).state
    return state.kind === 'ok' ? state.backlog.map((e) => e.spec) : []
  }
  return {
    payload: () => buildPayload(read(), { workspace, execEnabled: true }),
    specs: () => listSpecs(read(), backlogSpecs()),
    changelog: () => read().changelog,
    spec: (id) => read().specs[`.specs/${id}`] ?? null,
    harnesses: () => [{ id: 'test', name: 'Test', version: '1.0.0', state: 'installed' }],
    launchPreview: (req) => {
      try {
        return preview(req, workspace)
      } catch {
        return null
      }
    },
    launch: (req) => ({
      runId: 'run-1',
      scratchDir: workspace,
      plan: preview(req, workspace),
    }),
  }
}

async function request(
  base: string,
  path: string,
  opts: { method?: string; token?: string; fetchSite?: string; body?: unknown } = {},
): Promise<Response> {
  const headers: Record<string, string> = {}
  if (opts.token !== undefined) headers['x-relay-token'] = opts.token
  if (opts.fetchSite !== undefined) headers['sec-fetch-site'] = opts.fetchSite
  if (opts.body !== undefined) headers['content-type'] = 'application/json'
  return fetch(`${base}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  })
}

test('server: bind em 127.0.0.1, porta efêmera', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({
    workspace: ws.dir,
    execEnabled: true,
    token: TOKEN,
    deps: makeDeps(ws.dir),
  })
  try {
    assert.equal(server.address, '127.0.0.1')
    assert.ok(server.port > 0)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('GET / é o bootstrap: sem token, entrega HTML com token e workspace', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  try {
    const res = await fetch(`http://127.0.0.1:${server.port}/`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes(`content="${TOKEN}"`))
    assert.ok(html.includes(ws.dir))
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('servir a UI construída: metas injetadas e assets estáticos resolvem', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    const res = await fetch(`${base}/`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes('relay-token'))
    assert.ok(html.includes('relay-workspace'))
    assert.ok(html.includes('relay-exec-enabled'))
    const assetMatches = [...html.matchAll(/src="(\/assets\/[^"]+)"/g)].map((m) => m[1])
    for (const asset of assetMatches) {
      const assetRes = await fetch(`${base}${asset}`)
      assert.equal(assetRes.status, 200)
    }
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('API sem token ou sem same-origin é 403', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    assert.equal((await request(base, '/api/state')).status, 403)
    assert.equal((await request(base, '/api/state', { token: 'errado', fetchSite: 'same-origin' })).status, 403)
    assert.equal((await request(base, '/api/state', { token: TOKEN })).status, 403)
    assert.equal((await request(base, '/api/state', { token: TOKEN, fetchSite: 'cross-site' })).status, 403)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('API com token e same-origin devolve dado', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    const state = await request(base, '/api/state', { token: TOKEN, fetchSite: 'same-origin' })
    assert.equal(state.status, 200)
    const payload = (await state.json()) as UiPayload
    assert.equal(payload.state.kind, 'ok')
    if (payload.state.kind === 'ok') assert.equal(payload.state.status, 'backlog')

    const specs = await request(base, '/api/specs', { token: TOKEN, fetchSite: 'same-origin' })
    const list = (await specs.json()) as Array<{ id: string; title: string; taskCount: number }>
    assert.deepEqual(list, [{ id: '20260907-001-teste.md', title: '20260907-001 - Teste', taskCount: 1 }])

    const changelog = await request(base, '/api/changelog', { token: TOKEN, fetchSite: 'same-origin' })
    assert.equal(await changelog.text(), '# Change log\n')

    const specRaw = await request(base, '/api/specs/20260907-001-teste.md', { token: TOKEN, fetchSite: 'same-origin' })
    assert.ok((await specRaw.text()).includes('## Acceptance criteria'))

    assert.equal((await request(base, '/api/specs/nao-existe.md', { token: TOKEN, fetchSite: 'same-origin' })).status, 404)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('rota de lançamento: POST /api/launch/preview compõe o plano, sem shell', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    const res = await request(base, '/api/launch/preview', {
      method: 'POST',
      token: TOKEN,
      fetchSite: 'same-origin',
      body: { harness: 'claude-code', skill: 'relay-session', intent: 'Retomar sessão' },
    })
    assert.equal(res.status, 200)
    const plan = (await res.json()) as { bin: string; args: string[]; prompt: string; cwd: string }
    assert.equal(plan.bin, 'claude')
    assert.deepEqual(plan.args, ['-p'])
    assert.equal(plan.prompt, '/relay-session Retomar sessão')
    assert.equal(plan.cwd, ws.dir)

    const launch = await request(base, '/api/launch', {
      method: 'POST',
      token: TOKEN,
      fetchSite: 'same-origin',
      body: { harness: 'codex', skill: 'relay-spec', intent: 'Especificar uma ideia' },
    })
    assert.equal(launch.status, 200)
    const result = (await launch.json()) as { runId: string }
    assert.equal(result.runId, 'run-1')

    const bad = await request(base, '/api/launch/preview', {
      method: 'POST',
      token: TOKEN,
      fetchSite: 'same-origin',
      body: { harness: 'nao-existe', skill: 'relay-session', intent: 'x' },
    })
    assert.equal(bad.status, 400)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('sob --no-exec a rota de lançamento também é 404, não 403 (A-004)', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: false, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    const res = await request(base, '/api/launch', { method: 'POST', token: TOKEN, fetchSite: 'same-origin' })
    assert.equal(res.status, 404)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

test('rota embutida exige exec ligado e launchEmbedded; sem ela, 404', async () => {
  const ws = makeWorkspace()
  // com exec ligado mas sem launchEmbedded no deps, devolve 404 (superfície reservada)
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const base = `http://127.0.0.1:${server.port}`
  try {
    const res = await request(base, '/api/launch/embedded', {
      method: 'POST',
      token: TOKEN,
      fetchSite: 'same-origin',
      body: { harness: 'claude-code', skill: 'relay-session', intent: 'x' },
    })
    assert.equal(res.status, 404)
  } finally {
    await server.close()
    ws.cleanup()
  }
})

function connectWs(url: string, token: string): Promise<{ ws: WebSocket; messages: UiPayload[] }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, `relay.${token}`, { origin: `http://127.0.0.1:${new URL(url).port}` })
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

async function firstMessage(messages: UiPayload[]): Promise<UiPayload> {
  if (messages.length > 0) return messages[0]
  return new Promise((resolve) => {
    const iv = setInterval(() => {
      if (messages.length > 0) {
        clearInterval(iv)
        resolve(messages[0])
      }
    }, 5)
  })
}

test('WebSocket entrega UiPayload na conexão e recusa token errado', async () => {
  const ws = makeWorkspace()
  const server = await createRelayServer({ workspace: ws.dir, execEnabled: true, token: TOKEN, deps: makeDeps(ws.dir) })
  const url = `ws://127.0.0.1:${server.port}/ws`
  try {
    const client = await connectWs(url, TOKEN)
    const first = await firstMessage(client.messages)
    assert.equal(first.state.kind, 'ok')
    client.ws.close()

    await assert.rejects(connectWs(url, 'token-errado'), /unexpected-response: 403/)
  } finally {
    await server.close()
    ws.cleanup()
  }
})