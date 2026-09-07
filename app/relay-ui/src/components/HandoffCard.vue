<script setup lang="ts">
import { computed } from 'vue'
import type { Handoff } from '../types'
import { formatAbsolute, formatRelative } from '../lib/relative-time'
import {
  HARNESS_FIXTURE,
  harnessById,
  harnessInitials,
  harnessTone,
  selection,
  openSelector,
} from '../lib/harness'

const props = defineProps<{
  handoff: Handoff
  blocked: boolean
}>()

const sel = selection()

const writer = computed(() => harnessById(props.handoff.harness))
const writerInitials = computed(() =>
  harnessInitials(writer.value?.name ?? props.handoff.harness),
)
const writerTone = computed(() => harnessTone(props.handoff.harness))

const activeHarness = computed(() => {
  const chosen = harnessById(sel.harnessId)
  if (chosen && chosen.state !== 'absent') return chosen
  if (writer.value && writer.value.state !== 'absent') return writer.value
  return HARNESS_FIXTURE.find((h) => h.state !== 'absent') ?? writer.value ?? { id: props.handoff.harness, name: props.handoff.harness }
})
</script>

<template>
  <article class="handoff-card">
    <div class="handoff-card__provenance">
      <span
        class="harness-avatar"
        :class="writerTone ? `harness-avatar--${writerTone}` : 'harness-avatar--neutral'"
        aria-hidden="true"
      >
        {{ writerInitials }}
      </span>
      <span class="mono">
        escrito no {{ writer?.name ?? handoff.harness }} ·
        {{ formatRelative(handoff.updated) }}
      </span>
    </div>
    <div class="handoff-card__meta mono">
      {{ handoff.backlogId }} / {{ handoff.todoId }} ·
      {{ formatAbsolute(handoff.updated) }}
    </div>
    <h2 class="handoff-card__objective">
      <span class="handoff-card__objective-label mono">
        OBJETIVO · {{ handoff.backlogId }} / {{ handoff.todoId }}
      </span>
      {{ handoff.objective }}
    </h2>
    <div class="handoff-card__columns">
      <section class="handoff-card__column">
        <h3 class="handoff-card__column-title">Próximo passo</h3>
        <p class="handoff-card__next-step">{{ handoff.nextStep }}</p>
      </section>
      <section class="handoff-card__column" :class="{ 'is-blocked': blocked }">
        <h3 class="handoff-card__column-title">Contexto deixado</h3>
        <p class="handoff-card__context">{{ handoff.context }}</p>
      </section>
    </div>
    <footer class="handoff-card__footer">
      <button class="button button--primary">
        ▶ Retomar {{ handoff.todoId }} no {{ activeHarness.name }}
      </button>
      <button class="button button--secondary" @click="openSelector()">
        Trocar harness
      </button>
      <span class="handoff-card__spec mono">{{ handoff.spec }}</span>
    </footer>
  </article>
</template>