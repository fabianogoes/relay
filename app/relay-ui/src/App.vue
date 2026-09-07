<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Header from './components/Header.vue'
import MainScreen from './components/MainScreen.vue'
import WorkScreen from './components/WorkScreen.vue'
import HarnessSelector from './components/HarnessSelector.vue'
import { useRelayClient } from './lib/relay-client'
import { fixtures, fixtureNames } from './fixtures'
import { initHarnessSelection } from './lib/harness'

const client = useRelayClient()
const hasFixturesParam = new URLSearchParams(window.location.search).has('fixtures')
const fixtureMode = ref(!client.hostMode || hasFixturesParam)

const active = ref('in_progress')
const view = ref<'agora' | 'trabalho'>('agora')

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
})
</script>

<template>
  <div class="app">
    <nav v-if="fixtureMode" class="fixture-switcher" aria-label="Fixtures">
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

    <div v-if="!payload" class="empty-state">Conectando ao relay-host…</div>

    <template v-else>
      <Header :payload="payload" :view="view" @update:view="view = $event" />
      <MainScreen v-if="view === 'agora'" :payload="payload" />
      <WorkScreen v-else :payload="payload" />
      <HarnessSelector :workspace="payload.environment.workspace" />
    </template>
  </div>
</template>