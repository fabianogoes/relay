<script setup lang="ts">
import { computed } from 'vue'
import type { ChecklistEntry, InconsistentState, OkState, UiPayload } from '../types'
import HandoffCard from './HandoffCard.vue'
import ChecklistList from './ChecklistList.vue'
import EmptyState from './EmptyState.vue'
import RepairScreen from './RepairScreen.vue'
import { allHarnesses, harnessById, selection } from '../lib/harness'
import { openPreflight } from '../lib/launch'

const props = defineProps<{ payload: UiPayload }>()

const ok = computed<OkState | null>(() =>
  props.payload.state.kind === 'ok' ? props.payload.state : null,
)

const inconsistent = computed<InconsistentState | null>(() =>
  props.payload.state.kind === 'inconsistent' ? props.payload.state : null,
)

const handoff = computed(() => ok.value?.handoff ?? null)
const status = computed(() => ok.value?.status)
const execEnabled = computed(() => props.payload.environment.execEnabled)

const sel = selection()

const activeHarnessName = computed(() => {
  const chosen = harnessById(sel.harnessId)
  if (chosen && chosen.state !== 'absent') return chosen.name
  const writer = handoff.value ? harnessById(handoff.value.harness) : null
  if (writer && writer.state !== 'absent') return writer.name
  return allHarnesses().find((h) => h.state !== 'absent')?.name ?? '…'
})

function available(entries: ChecklistEntry[]): ChecklistEntry[] {
  return entries.filter((e) => e.available)
}

function comecar(backlogId: string): void {
  openPreflight({
    title: `Iniciar sessão em ${backlogId}`,
    skill: 'relay-session',
    intent: `Iniciar sessão em ${backlogId}`,
  })
}

function entrevista(): void {
  openPreflight({ title: 'Especificar uma ideia', skill: 'relay-spec', intent: 'Especificar uma ideia' })
}
</script>

<template>
  <RepairScreen v-if="inconsistent" :violations="inconsistent.violations" />

  <template v-else-if="ok">
    <HandoffCard
      v-if="handoff"
      :handoff="handoff"
      :blocked="status === 'blocked'"
      :exec-enabled="execEnabled"
    />

    <ChecklistList
      v-if="handoff && ok.todo.length > 0"
      title="Subtarefas"
      :entries="ok.todo"
      :completed="ok.completed"
      :total="ok.total"
    />

    <template v-if="!handoff && status !== 'done'">
      <ChecklistList
        v-if="status === 'ready' && ok.todo.length > 0"
        title="Subtarefas"
        :entries="ok.todo"
        :completed="ok.completed"
        :total="ok.total"
      />
      <EmptyState v-else-if="status === 'idle'" message="Sem trabalho ativo." />

      <section v-if="execEnabled" class="choose">
        <ul class="choose__list">
          <li
            v-for="entry in available(status === 'backlog' ? ok.backlog : ok.todo)"
            :key="entry.id"
            class="choose__item"
          >
            <span class="choose__id mono">{{ entry.id }}</span>
            <span class="choose__text">{{ entry.text }}</span>
            <span v-if="entry.spec" class="choose__spec mono">{{ entry.spec }}</span>
            <button class="button button--primary choose__action" @click="comecar(ok.activeBacklogId ?? entry.id)">
              ▶ Começar no {{ activeHarnessName }}
            </button>
          </li>
        </ul>

        <section class="choose__interview">
          <h2 class="choose__interview-title">Iniciar entrevista</h2>
          <p class="choose__interview-text">
            Nenhuma tarefa cobre o que você precisa? Especifique uma ideia nova.
          </p>
          <button class="button button--secondary" @click="entrevista()">Iniciar entrevista</button>
        </section>
      </section>

      <EmptyState v-else-if="status === 'backlog'" message="Selecione uma tarefa no backlog." />
    </template>

    <EmptyState v-if="!handoff && status === 'done'" message="Todo o trabalho concluído." />
  </template>
</template>
