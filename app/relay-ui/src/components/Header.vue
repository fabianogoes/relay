<script setup lang="ts">
import { computed } from 'vue'
import type { UiPayload } from '../types'
import StatusPill from './StatusPill.vue'
import {
  CONSENT_OPTIONS,
  HARNESS_FIXTURE,
  allHarnesses,
  harnessById,
  harnessInitials,
  harnessTone,
  openSelector,
  selection,
} from '../lib/harness'

const props = defineProps<{ payload: UiPayload; view: 'agora' | 'trabalho' }>()
const emit = defineEmits<{ (e: 'update:view', view: 'agora' | 'trabalho'): void }>()

const status = computed(() =>
  props.payload.state.kind === 'ok' ? props.payload.state.status : 'inconsistent',
)

const sel = selection()

const activeHarness = computed(() => {
  const chosen = harnessById(sel.harnessId)
  if (chosen) return chosen
  const handoff = props.payload.state.kind === 'ok' ? props.payload.state.handoff : null
  const writer = handoff ? harnessById(handoff.harness) : null
  if (writer && writer.state !== 'absent') return writer
  return allHarnesses()[0] ?? HARNESS_FIXTURE[0]
})

const activeInitials = computed(() => harnessInitials(activeHarness.value.name))
const activeTone = computed(() => harnessTone(activeHarness.value.id))

const consentScope = computed(
  () => CONSENT_OPTIONS.find((o) => o.id === sel.consent)?.scopeShort ?? 'não grava',
)

const workspaceName = computed(() => {
  const path = props.payload.environment.workspace
  const base = path.split('/').filter(Boolean).pop()
  return base ?? path
})
</script>

<template>
  <header class="header">
    <div class="header__brand">
      <span class="header__logo">Relay</span>
      <span class="header__workspace mono">
        {{ workspaceName }}<span class="header__workspace-path">{{ payload.environment.workspace }}</span>
      </span>
    </div>
    <nav class="header__tabs" aria-label="Visões">
      <button
        class="header__tab"
        :class="{ 'is-active': view === 'agora' }"
        @click="emit('update:view', 'agora')"
      >
        Agora
      </button>
      <button
        class="header__tab"
        :class="{ 'is-active': view === 'trabalho' }"
        @click="emit('update:view', 'trabalho')"
      >
        Trabalho
      </button>
    </nav>
    <span class="header__spacer"></span>
    <button class="harness-badge" @click="openSelector()">
      <span
        class="harness-avatar"
        :class="activeTone ? `harness-avatar--${activeTone}` : 'harness-avatar--neutral'"
        aria-hidden="true"
      >
        {{ activeInitials }}
      </span>
      <span class="harness-badge__text">
        <span class="harness-badge__name">{{ activeHarness.name }}</span>
        <span class="harness-badge__scope mono">{{ consentScope }}</span>
      </span>
    </button>
    <StatusPill :status="status" />
  </header>
</template>