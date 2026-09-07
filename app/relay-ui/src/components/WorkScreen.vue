<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { UiPayload } from '../types'
import ChecklistList from './ChecklistList.vue'
import EmptyState from './EmptyState.vue'
import { apiGetJson, apiGetRaw, useRelayClient } from '../lib/relay-client'
import { openPreflight } from '../lib/launch'

interface SpecSummary {
  id: string
  title: string
  taskCount: number
}

const props = defineProps<{ payload: UiPayload }>()

const client = useRelayClient()
const specs = ref<SpecSummary[]>([])
const changelog = ref('')
const selectedSpecId = ref<string | null>(null)

const execEnabled = computed(() => props.payload.environment.execEnabled)

async function reload(): Promise<void> {
  if (!client.hostMode) return
  try {
    specs.value = await apiGetJson<SpecSummary[]>('/api/specs')
    if (selectedSpecId.value === null && specs.value.length > 0) {
      selectedSpecId.value = specs.value[0].id
    }
  } catch {
    specs.value = []
  }
  try {
    changelog.value = await apiGetRaw('/api/changelog')
  } catch {
    changelog.value = ''
  }
}

onMounted(reload)
watch(() => props.payload, reload)

const selectedSpec = computed(
  () => specs.value.find((s) => s.id === selectedSpecId.value) ?? null,
)

const backlog = computed(() => {
  if (props.payload.state.kind !== 'ok') return []
  const specPath = selectedSpec.value ? `.specs/${selectedSpec.value.id}` : ''
  return props.payload.state.backlog.filter((e) => e.spec === specPath)
})

function selectSpec(id: string): void {
  selectedSpecId.value = id
}

function onNewSpec(): void {
  openPreflight({ title: 'Especificar uma ideia', skill: 'relay-spec', intent: 'Especificar uma ideia' })
}
</script>

<template>
  <section class="work" aria-label="Segunda visão">
    <div class="work__column">
      <header class="work__column-header">
        <h2 class="work__column-title">Specs</h2>
        <button
          v-if="execEnabled"
          class="button button--secondary work__new-spec"
          @click="onNewSpec"
        >
          + nova spec
        </button>
      </header>
      <ul class="work__specs">
        <li v-for="spec in specs" :key="spec.id">
          <button
            class="work__spec"
            :class="{ 'is-selected': spec.id === selectedSpecId }"
            @click="selectSpec(spec.id)"
          >
            <span class="work__spec-title">{{ spec.title }}</span>
            <span class="work__spec-id mono">{{ spec.id }}</span>
            <span class="work__spec-count mono">{{ spec.taskCount }}</span>
          </button>
        </li>
      </ul>
      <EmptyState v-if="specs.length === 0" message="Nenhuma spec encontrada." />
    </div>

    <div class="work__column">
      <header class="work__column-header">
        <h2 class="work__column-title">Backlog</h2>
      </header>
      <ChecklistList
        v-if="backlog.length > 0"
        :title="selectedSpec?.title ?? 'Backlog'"
        :entries="backlog"
      />
      <EmptyState
        v-else
        message="Selecione uma spec na coluna Specs para ver seu backlog."
      />
    </div>

    <div class="work__column">
      <header class="work__column-header">
        <h2 class="work__column-title">Changelog</h2>
      </header>
      <pre class="work__changelog mono">{{ changelog }}</pre>
      <EmptyState v-if="!changelog" message="Changelog vazio." />
    </div>
  </section>
</template>