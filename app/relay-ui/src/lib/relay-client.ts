import { ref, type Ref } from 'vue'
import type { UiPayload } from '../types'

export interface RelayClient {
  hostMode: boolean
  payload: Ref<UiPayload | null>
  connected: Ref<boolean>
  reconnectBackoff: number
  connect(): void
  disconnect(): void
}

export const RECONNECT_BASE = 500
export const RECONNECT_MAX = 10_000

function meta(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null
}

function wsUrl(token: string): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws`
}

const token = ref(meta('relay-token') ?? '')
const hostMode = token.value !== ''

const payload = ref<UiPayload | null>(null)
const connected = ref(false)

let socket: WebSocket | null = null
let retries = 0
let retryTimer: number | null = null
let closed = false

async function refreshToken(): Promise<string> {
  try {
    const res = await fetch('/', { headers: { accept: 'text/html' } })
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const fresh = doc.querySelector('meta[name="relay-token"]')?.getAttribute('content') ?? ''
    if (fresh) token.value = fresh
  } catch {
    // host fora do ar; mantém o token atual até a próxima tentativa
  }
  return token.value
}

function scheduleReconnect(): void {
  if (closed) return
  const delay = Math.min(RECONNECT_BASE * 2 ** retries, RECONNECT_MAX)
  retries += 1
  retryTimer = window.setTimeout(async () => {
    await refreshToken()
    connect()
  }, delay)
}

function connect(): void {
  if (closed) return
  if (!hostMode) return
  const current = token.value
  socket = new WebSocket(wsUrl(current), `relay.${current}`)
  socket.addEventListener('open', () => {
    connected.value = true
    retries = 0
  })
  socket.addEventListener('message', (event) => {
    payload.value = JSON.parse(String(event.data)) as UiPayload
  })
  socket.addEventListener('close', () => {
    connected.value = false
    scheduleReconnect()
  })
  socket.addEventListener('error', () => {
    socket?.close()
  })
}

function disconnect(): void {
  closed = true
  if (retryTimer !== null) window.clearTimeout(retryTimer)
  socket?.close()
  socket = null
  connected.value = false
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { 'X-Relay-Token': token.value } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

async function apiGetText(path: string): Promise<string> {
  const res = await fetch(path, { headers: { 'X-Relay-Token': token.value } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

export const relayClient: RelayClient = {
  hostMode,
  payload,
  connected,
  reconnectBackoff: RECONNECT_BASE,
  connect,
  disconnect,
}

export function useRelayClient(): RelayClient {
  return relayClient
}

export function apiGetJson<T>(path: string): Promise<T> {
  return apiGet<T>(path)
}

export function apiGetRaw(path: string): Promise<string> {
  return apiGetText(path)
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'X-Relay-Token': token.value, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}