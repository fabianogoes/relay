<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Header from './components/Header.vue'
import MainScreen from './components/MainScreen.vue'
import WorkScreen from './components/WorkScreen.vue'
import HarnessSelector from './components/HarnessSelector.vue'
import PreflightModal from './components/PreflightModal.vue'
import ExecutionMode from './components/ExecutionMode.vue'
import BackgroundStrip from './components/BackgroundStrip.vue'
import KeyboardWarning from './components/KeyboardWarning.vue'
import { useRelayClient, apiGetJson } from './lib/relay-client'
import { useExecution } from './lib/execution'
import { fixtures, fixtureNames } from './fixtures'
import { initHarnessSelection, setHarnesses, type Harness } from './lib/harness'

const client = useRelayClient()
const execution = useExecution()
const hasFixturesParam = new URLSearchParams(window.location.search).has('fixtures')
const fixtureMode = ref(!client.hostMode || hasFixturesParam)

const active = ref('in_progress')
const view = ref<'agora' | 'trabalho'>('agora')

const inExecution = computed(() => execution.activeRunId !== null && !execution.detached)
const detached = computed(() => execution.activeRunId !== null && execution.detached)

const payload = computed(() => {
  if (fixtureMode.value) return fixtures[active.value]
  return client.payload.value
})

const workspace = computed(() => payload.value?.environment.workspace ?? '')

watch(
  workspace,
  (w) => {
    if (w) initHarnessSelection(w)
  },
  { immediate: true },
)

onMounted(() => {
  if (client.hostMode && !hasFixturesParam) client.connect()
  if (client.hostMode) {
    apiGetJson<Harness[]>('/api/harnesses')
      .then((list) => setHarnesses(list))
      .catch(() => {})
  }
})
</script>

<template>
  <div class="app">
    <nav v-if="fixtureMode && !inExecution" class="fixture-switcher" aria-label="Fixtures">
      <button
        v-for="name in fixtureNames"
        :key="name"
        class="fixture-switcher__button"
        :class="{ 'is-active': name === active }"
        @click="active = name"
      >
        {{ name }}
      </button>
    </nav>

    <ExecutionMode v-if="inExecution" />

    <template v-else>
      <div v-if="!payload" class="empty-state">Conectando ao relay-host…</div>

      <template v-else>
        <Header :payload="payload" :view="view" @update:view="view = $event" />
        <BackgroundStrip v-if="detached" />
        <MainScreen v-if="view === 'agora'" :payload="payload" />
        <WorkScreen v-else :payload="payload" />
        <HarnessSelector :workspace="payload.environment.workspace" />
        <PreflightModal :workspace="payload.environment.workspace" />
      </template>
    </template>

    <KeyboardWarning />
  </div>
</template>