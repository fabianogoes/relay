<script setup lang="ts">
import { computed, ref } from 'vue'
import MainScreen from './components/MainScreen.vue'
import { fixtures, fixtureNames } from './fixtures'

const active = ref('in_progress')
const payload = computed(() => fixtures[active.value])
</script>

<template>
  <div class="app">
    <nav class="fixture-switcher" aria-label="Fixtures">
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

    <MainScreen :payload="payload" />
  </div>
</template>
