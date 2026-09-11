<script setup lang="ts">
import { computed } from 'vue'
import { freshnessLabel, type Freshness } from '../lib/observer'

const props = defineProps<{ freshness: Freshness }>()
const label = computed(() => freshnessLabel(props.freshness))
</script>

<template>
  <span
    class="freshness-status mono"
    :class="`freshness-status--${freshness}`"
    role="status"
    aria-live="polite"
  >
    <span class="freshness-status__dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>
