<script setup lang="ts">
import type { ChecklistEntry } from '../types'

defineProps<{
  title: string
  entries: ChecklistEntry[]
}>()

function glyph(marker: string): string {
  return marker === ' ' ? '○' : marker
}
</script>

<template>
  <section class="panel">
    <h2 class="panel__title">{{ title }}</h2>
    <ul class="checklist">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="checklist__item"
        :class="{ 'is-available': entry.available }"
      >
        <span class="checklist__marker mono" aria-hidden="true">{{ glyph(entry.marker) }}</span>
        <span class="checklist__id mono">{{ entry.id }}</span>
        <span class="checklist__text">{{ entry.text }}</span>
      </li>
    </ul>
  </section>
</template>
