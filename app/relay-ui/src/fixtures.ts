import type { UiPayload } from './types'

import idle from '@fixtures/idle.json'
import backlog from '@fixtures/backlog.json'
import ready from '@fixtures/ready.json'
import inProgress from '@fixtures/in_progress.json'
import blocked from '@fixtures/blocked.json'
import done from '@fixtures/done.json'
import inconsistent from '@fixtures/inconsistent.json'

export const fixtures: Record<string, UiPayload> = {
  idle: idle as unknown as UiPayload,
  backlog: backlog as unknown as UiPayload,
  ready: ready as unknown as UiPayload,
  in_progress: inProgress as unknown as UiPayload,
  blocked: blocked as unknown as UiPayload,
  done: done as unknown as UiPayload,
  inconsistent: inconsistent as unknown as UiPayload,
}

export const fixtureNames = Object.keys(fixtures)
