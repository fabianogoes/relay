<script setup lang="ts">
import type { ChecklistEntry } from '../types'

const props = defineProps<{
  title: string
  entries: ChecklistEntry[]
  completed?: number
  total?: number
}>()

const MARKER_LABELS: Record<string, string> = {
  ' ': 'Pendente',
  '•': 'Em execução',
  '!': 'Bloqueado',
  x: 'Feito',
}

function glyph(marker: string): string {
  return marker === ' ' ? '○' : marker
}

function markerLabel(marker: string): string {
  return MARKER_LABELS[marker] ?? 'Pendente'
}

function itemClass(entry: ChecklistEntry): string {
  if (entry.marker === 'x') return 'is-done'
  if (entry.marker === '•') return 'is-current'
  if (entry.marker === '!') return 'is-blocked'
  return entry.available ? 'is-available' : ''
}

const showCount = () =>
  typeof props.total === 'number' && props.total > 0 && typeof props.completed === 'number'
</script>

<template>
  <section class="panel">
    <header class="checklist__header">
      <h2 class="panel__title">{{ title }}</h2>
      <span v-if="showCount()" class="checklist__count mono">
        {{ completed }} de {{ total }} concluídas
      </span>
    </header>
    <ul class="checklist">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="checklist__item"
        :class="itemClass(entry)"
      >
        <span class="checklist__marker mono" aria-hidden="true">{{ glyph(entry.marker) }}</span>
        <span class="checklist__label">{{ markerLabel(entry.marker) }}</span>
        <span class="checklist__id mono">{{ entry.id }}</span>
        <span class="checklist__text">{{ entry.text }}</span>
      </li>
    </ul>
  </section>
</template>