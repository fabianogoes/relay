<script setup lang="ts">
import { computed } from 'vue'
import type { InconsistentState, OkState, UiPayload } from '../types'
import Header from './Header.vue'
import HandoffCard from './HandoffCard.vue'
import ChecklistList from './ChecklistList.vue'
import EmptyState from './EmptyState.vue'
import RepairScreen from './RepairScreen.vue'

const props = defineProps<{ payload: UiPayload }>()

const ok = computed<OkState | null>(() =>
  props.payload.state.kind === 'ok' ? props.payload.state : null,
)

const inconsistent = computed<InconsistentState | null>(() =>
  props.payload.state.kind === 'inconsistent' ? props.payload.state : null,
)

const handoff = computed(() => ok.value?.handoff ?? null)
const status = computed(() => ok.value?.status)
</script>

<template>
  <Header :payload="payload" />

  <RepairScreen v-if="inconsistent" :violations="inconsistent.violations" />

  <template v-else-if="ok">
    <HandoffCard
      v-if="handoff"
      :handoff="handoff"
      :completed="ok.completed"
      :total="ok.total"
      :blocked="status === 'blocked'"
    />

    <ChecklistList
      v-if="handoff && ok.todo.length > 0"
      title="Subtarefas"
      :entries="ok.todo"
    />

    <template v-if="!handoff">
      <ChecklistList v-if="status === 'ready'" title="Subtarefas" :entries="ok.todo" />
      <ChecklistList v-else-if="status === 'backlog'" title="Backlog" :entries="ok.backlog" />
      <EmptyState v-else-if="status === 'idle'" message="Sem trabalho ativo." />
      <EmptyState v-else-if="status === 'done'" message="Todo o trabalho concluído." />
    </template>
  </template>
</template>
