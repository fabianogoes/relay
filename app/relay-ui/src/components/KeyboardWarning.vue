<script setup lang="ts">
import { useExecution, markRunConsumed, closeRun } from '../lib/execution'

const exec = useExecution()

function onExternal(): void {
  closeRun()
  markRunConsumed()
}

function onEmbedded(): void {
  markRunConsumed()
}
</script>

<template>
  <div
    v-if="exec.firstRunThisSession && exec.activeRunId !== null"
    class="selector-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Conflito de teclado"
  >
    <div class="selector">
      <header class="selector__header">
        <h2 class="selector__title">Atalhos do terminal</h2>
      </header>
      <p class="kb-warning__text">
        A primeira execução usa atalhos como <code class="mono">Cmd+W</code> e
        <code class="mono">Cmd+T</code>, que o terminal também captura. Se quiser
        evitar o conflito, lance no modo externo.
      </p>
      <div class="preflight__actions">
        <button class="button button--secondary" @click="onExternal">Lançar no modo externo</button>
        <button class="button button--primary" @click="onEmbedded">Continuar embutido</button>
      </div>
    </div>
  </div>
</template>
