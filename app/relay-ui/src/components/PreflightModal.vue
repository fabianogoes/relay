<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  CONSENT_OPTIONS,
  allHarnesses,
  harnessInitials,
  harnessTone,
  selectConsent,
  selectHarness,
  selection,
  type Harness,
} from '../lib/harness'
import { apiPostJson, useRelayClient } from '../lib/relay-client'
import { closePreflight, localPreview, usePreflight, type LaunchPlan } from '../lib/launch'

const props = defineProps<{ workspace: string }>()

const client = useRelayClient()
const sel = selection()
const preflight = usePreflight()

const intent = ref('')
const harnessId = ref<string | null>(null)
const plan = ref<LaunchPlan | null>(null)
const launching = ref(false)
const error = ref('')

const harnesses = computed<Harness[]>(() => allHarnesses())

const activeHarness = computed<Harness | null>(() => {
  const chosen = harnesses.value.find((h) => h.id === harnessId.value && h.state !== 'absent')
  if (chosen) return chosen
  return harnesses.value.find((h) => h.state !== 'absent') ?? harnesses.value[0] ?? null
})

const consentScope = computed(
  () => CONSENT_OPTIONS.find((o) => o.id === sel.consent)?.description ?? '',
)

let previewTimer: number | null = null

function loadPlan(): void {
  if (previewTimer !== null) window.clearTimeout(previewTimer)
  const harness = activeHarness.value
  if (!harness) return
  if (!client.hostMode) {
    plan.value = localPreview(harness.id, preflight.skill, intent.value, props.workspace)
    return
  }
  previewTimer = window.setTimeout(async () => {
    try {
      plan.value = await apiPostJson<LaunchPlan>('/api/launch/preview', {
        harness: harness.id,
        skill: preflight.skill,
        intent: intent.value,
      })
      error.value = ''
    } catch {
      error.value = 'Não foi possível compor o lançamento.'
    }
  }, 120)
}

watch(
  () => preflight.open,
  async (open) => {
    if (!open) return
    intent.value = preflight.intent
    harnessId.value = sel.harnessId ?? harnesses.value.find((h) => h.state !== 'absent')?.id ?? null
    launching.value = false
    error.value = ''
    plan.value = null
    await nextTick()
    loadPlan()
  },
)

watch(harnessId, () => loadPlan())
watch(intent, () => loadPlan())
watch(() => preflight.skill, () => loadPlan())

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closePreflight()
}

function onHarnessClick(id: string): void {
  selectHarness(props.workspace, id)
  harnessId.value = id
}

function onConsentChange(level: string): void {
  selectConsent(props.workspace, level as typeof sel.consent)
}

function stateLabel(state: string): string {
  if (state === 'installed') return 'Instalado'
  if (state === 'unauthenticated') return 'Não autenticado'
  return 'Ausente'
}

async function confirm(): Promise<void> {
  const harness = activeHarness.value
  if (!harness || launching.value) return
  if (!client.hostMode) {
    closePreflight()
    return
  }
  launching.value = true
  error.value = ''
  try {
    await apiPostJson('/api/launch', {
      harness: harness.id,
      skill: preflight.skill,
      intent: intent.value,
    })
    closePreflight()
  } catch {
    error.value = 'Falha ao lançar o processo.'
    launching.value = false
  }
}

const rows = computed(() => {
  if (!plan.value) return []
  return [
    { label: 'bin', value: plan.value.bin },
    ...plan.value.args.map((arg) => ({ label: 'arg', value: arg })),
    { label: 'prompt', value: plan.value.prompt },
    { label: 'cwd', value: plan.value.cwd },
  ]
})
</script>

<template>
  <div
    v-if="preflight.open"
    class="selector-overlay"
    role="dialog"
    aria-modal="true"
    :aria-label="preflight.title"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <div class="selector preflight">
      <header class="selector__header">
        <h2 class="selector__title">{{ preflight.title }}</h2>
        <button class="selector__close" aria-label="Fechar" @click="closePreflight()">×</button>
      </header>

      <section class="selector__section">
        <h3 class="selector__section-title">Processo a lançar</h3>
        <table class="preflight__table">
          <tbody>
            <tr v-for="row in rows" :key="row.label">
              <th class="preflight__cell-label mono">{{ row.label }}</th>
              <td class="preflight__cell mono">{{ row.value }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="selector__section">
        <h3 class="selector__section-title">Prompt</h3>
        <input
          v-model="intent"
          class="preflight__prompt mono"
          aria-label="Prompt da intenção"
        />
      </section>

      <section class="selector__section">
        <h3 class="selector__section-title">Harness</h3>
        <ul class="selector__harnesses">
          <li v-for="harness in harnesses" :key="harness.id">
            <button
              class="harness-option"
              :class="{
                'is-selected': harnessId === harness.id,
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
              name="preflight-consent"
              :value="option.id"
              :checked="sel.consent === option.id"
              @change="onConsentChange(option.id)"
            />
            <span class="consent-option__label">{{ option.label }}</span>
          </label>
        </div>
      </section>

      <p class="preflight__warning">
        Ao executar, esta janela fecha e o harness assume a partir de agora.
      </p>

      <p v-if="error" class="preflight__error">{{ error }}</p>

      <footer class="selector__footer mono">{{ consentScope }}</footer>

      <div class="preflight__actions">
        <button class="button button--secondary" @click="closePreflight()">Cancelar (Esc)</button>
        <button
          class="button button--primary"
          :disabled="!activeHarness || launching"
          @click="confirm"
        >
          ▶ Executar no {{ activeHarness?.name ?? '…' }}
        </button>
      </div>
    </div>
  </div>
</template>
