<script setup lang="ts">
import { computed } from 'vue'
import type { UiPayload } from '../types'
import StatusPill from './StatusPill.vue'

const props = defineProps<{ payload: UiPayload }>()

const status = computed(() =>
  props.payload.state.kind === 'ok' ? props.payload.state.status : 'inconsistent',
)

const harness = computed(() =>
  props.payload.state.kind === 'ok' ? props.payload.state.handoff?.harness : undefined,
)
</script>

<template>
  <header class="header">
    <span class="header__logo">Relay</span>
    <span class="header__workspace mono">{{ payload.environment.workspace }}</span>
    <span v-if="harness" class="header__harness mono">{{ harness }}</span>
    <span class="header__spacer"></span>
    <StatusPill :status="status" />
  </header>
</template>
