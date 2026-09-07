<script setup lang="ts">
import { computed } from 'vue'
import {
  CONSENT_OPTIONS,
  allHarnesses,
  closeSelector,
  harnessInitials,
  harnessTone,
  selectConsent,
  selectHarness,
  selection,
} from '../lib/harness'

const props = defineProps<{ workspace: string }>()

const sel = selection()

const harnesses = computed(() => allHarnesses())

const selectedConsent = computed(
  () => CONSENT_OPTIONS.find((o) => o.id === sel.consent) ?? CONSENT_OPTIONS[0],
)

function stateLabel(state: string): string {
  if (state === 'installed') return 'Instalado'
  if (state === 'unauthenticated') return 'Não autenticado'
  return 'Ausente'
}

function onHarnessClick(id: string): void {
  selectHarness(props.workspace, id)
}

function onConsentChange(id: string): void {
  selectConsent(props.workspace, id as typeof sel.consent)
}

function onBackdropClick(): void {
  closeSelector()
}
</script>

<template>
  <div
    v-if="sel.open"
    class="selector-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Seletor de harness e consentimento"
    @click.self="onBackdropClick"
  >
    <div class="selector">
      <header class="selector__header">
        <h2 class="selector__title">Harness e consentimento</h2>
        <button class="selector__close" aria-label="Fechar" @click="closeSelector()">
          ×
        </button>
      </header>

      <section class="selector__section">
        <h3 class="selector__section-title">Harness</h3>
        <ul class="selector__harnesses">
          <li v-for="harness in harnesses" :key="harness.id">
            <button
              class="harness-option"
              :class="{
                'is-selected': sel.harnessId === harness.id,
                'is-disabled': harness.state === 'absent',
              }"
              :disabled="harness.state === 'absent'"
              @click="onHarnessClick(harness.id)"
            >
              <span
                class="harness-avatar"
                :class="
                  harness.state !== 'absent'
                    ? `harness-avatar--${harnessTone(harness.id) ?? 'neutral'}`
                    : 'harness-avatar--neutral'
                "
                aria-hidden="true"
              >
                {{ harnessInitials(harness.name) }}
              </span>
              <span class="harness-option__name">{{ harness.name }}</span>
              <span class="harness-option__version mono">{{ harness.version }}</span>
              <span class="harness-option__state">{{ stateLabel(harness.state) }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section class="selector__section">
        <h3 class="selector__section-title">Consentimento</h3>
        <div class="selector__consents" role="radiogroup" aria-label="Nível de consentimento">
          <label
            v-for="option in CONSENT_OPTIONS"
            :key="option.id"
            class="consent-option"
            :class="{ 'is-selected': sel.consent === option.id }"
          >
            <input
              class="consent-option__input"
              type="radio"
              name="consent"
              :value="option.id"
              :checked="sel.consent === option.id"
              @change="onConsentChange(option.id)"
            />
            <span class="consent-option__label">{{ option.label }}</span>
          </label>
        </div>
      </section>

      <footer class="selector__footer mono">
        {{ selectedConsent.description }}
      </footer>
    </div>
  </div>
</template>