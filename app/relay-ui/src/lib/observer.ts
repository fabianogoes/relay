import type { RelayMessage, UiPayload } from '../types.ts'

export type Freshness = 'connecting' | 'current' | 'refreshing' | 'stale'

export interface RelayViewState {
  payload: UiPayload | null
  freshness: Freshness
}

export type RelayViewEvent = RelayMessage | { kind: 'disconnected' }

const FRESHNESS_LABELS: Record<Freshness, string> = {
  connecting: 'Conectando',
  current: 'Atualizado',
  refreshing: 'Atualizando',
  stale: 'Desatualizado',
}

export function freshnessLabel(freshness: Freshness): string {
  return FRESHNESS_LABELS[freshness]
}

export function reduceRelayViewState(state: RelayViewState, event: RelayViewEvent): RelayViewState {
  if (event.kind === 'snapshot') {
    return { payload: event.payload, freshness: 'current' }
  }
  if (event.kind === 'refreshing') {
    return { payload: state.payload, freshness: 'refreshing' }
  }
  return {
    payload: state.payload,
    freshness: state.payload === null ? 'connecting' : 'stale',
  }
}
