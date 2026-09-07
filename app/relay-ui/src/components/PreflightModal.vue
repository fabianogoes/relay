<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CONSENT_OPTIONS, selection } from '../lib/harness'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const sel = selection()
const prompt = ref('Especificar uma ideia')
const promptInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    if (open) {
      prompt.value = 'Especificar uma ideia'
      await nextTick()
      promptInput.value?.focus()
    }
  },
)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

const consentScope = CONSENT_OPTIONS.find((o) => o.id === sel.consent)?.description ?? ''
</script>

<template>
  <div
    v-if="open"
    class="selector-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Especificar uma ideia"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <div class="selector preflight">
      <header class="selector__header">
        <h2 class="selector__title">Especificar uma ideia</h2>
        <button class="selector__close" aria-label="Fechar" @click="emit('close')">
          ×
        </button>
      </header>

      <section class="selector__section">
        <h3 class="selector__section-title">Prompt</h3>
        <input
          ref="promptInput"
          v-model="prompt"
          class="preflight__prompt mono"
          aria-label="Prompt da ideia"
        />
      </section>

      <footer class="selector__footer mono">{{ consentScope }}</footer>

      <div class="preflight__actions">
        <button class="button button--secondary" @click="emit('close')">Cancelar (Esc)</button>
      </div>
    </div>
  </div>
</template>