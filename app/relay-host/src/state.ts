import { deriveState } from 'relay-core'
import type { Environment, RelayFiles, UiPayload } from 'relay-core'

export function buildPayload(files: RelayFiles, environment: Environment): UiPayload {
  return { state: deriveState(files), environment }
}