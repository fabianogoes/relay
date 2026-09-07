<script setup lang="ts">
import type { Handoff } from '../types'
import { formatRelative } from '../lib/relative-time'

defineProps<{
  handoff: Handoff
  completed: number
  total: number
  blocked: boolean
}>()
</script>

<template>
  <article class="handoff-card">
    <div class="handoff-card__provenance mono">
      escrito no {{ handoff.harness }} · {{ formatRelative(handoff.updated) }}
    </div>
    <h2 class="handoff-card__objective">{{ handoff.objective }}</h2>
    <p class="handoff-card__next-step">{{ handoff.nextStep }}</p>
    <div v-if="blocked" class="handoff-card__context">{{ handoff.context }}</div>
    <div class="handoff-card__footer">
      <button class="button button--primary">
        {{ blocked ? 'Revisar bloqueio' : `Retomar ${handoff.todoId}` }}
      </button>
      <span v-if="total > 0" class="handoff-card__counter mono">
        {{ completed }} de {{ total }}
      </span>
    </div>
  </article>
</template>
