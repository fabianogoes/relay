import { test } from 'node:test'
import assert from 'node:assert/strict'

import { freshnessLabel, reduceRelayViewState, type RelayViewState } from '../src/lib/observer.ts'
import type { UiPayload } from '../src/types.ts'

const payload: UiPayload = {
  state: {
    kind: 'ok',
    status: 'idle',
    handoff: null,
    activeBacklogId: null,
    todo: [],
    backlog: [],
    completed: 0,
    total: 0,
  },
  environment: { workspace: '/work/app', execEnabled: false },
}

test('refreshing preserva o ultimo snapshot ate o proximo snapshot estavel', () => {
  const initial: RelayViewState = { payload, freshness: 'current' }

  const refreshing = reduceRelayViewState(initial, { kind: 'refreshing' })
  assert.deepEqual(refreshing, { payload, freshness: 'refreshing' })

  const nextPayload = { ...payload, environment: { ...payload.environment, workspace: '/work/next' } }
  const current = reduceRelayViewState(refreshing, { kind: 'snapshot', payload: nextPayload })
  assert.deepEqual(current, { payload: nextPayload, freshness: 'current' })
})

test('desconexao preserva dados existentes como stale e sem snapshot continua connecting', () => {
  assert.deepEqual(reduceRelayViewState({ payload, freshness: 'current' }, { kind: 'disconnected' }), {
    payload,
    freshness: 'stale',
  })
  assert.deepEqual(
    reduceRelayViewState({ payload: null, freshness: 'connecting' }, { kind: 'disconnected' }),
    { payload: null, freshness: 'connecting' },
  )
})

test('cada estado de frescor tem um rotulo humano explicito', () => {
  assert.deepEqual(
    ['connecting', 'current', 'refreshing', 'stale'].map((value) =>
      freshnessLabel(value as RelayViewState['freshness']),
    ),
    ['Conectando', 'Atualizado', 'Atualizando', 'Desatualizado'],
  )
})
