<script setup lang="ts">
import type { Violation } from '../types'

defineProps<{ violations: Violation[] }>()
</script>

<template>
  <section class="repair">
    <h2 class="repair__title">Estado inconsistente</h2>
    <div
      v-for="(violation, index) in violations"
      :key="index"
      class="repair__violation"
    >
      <span class="repair__check mono">{{ violation.check }}</span>
      <p class="repair__detail">{{ violation.detail }}</p>
      <span class="repair__records mono">{{ violation.records.join(', ') }}</span>
    </div>
  </section>
</template>
