<script setup lang="ts">
import { reattachRun, useExecution } from '../lib/execution'

const exec = useExecution()

function onReattach(): void {
  reattachRun()
}
</script>

<template>
  <div class="bg-strip">
    <span class="bg-strip__dot" aria-hidden="true"></span>
    <span class="bg-strip__text">Rodando em segundo plano</span>
    <span class="bg-strip__name">{{ exec.processName }}</span>
    <span class="bg-strip__count mono">{{ exec.writtenFiles }} arquivos escritos</span>
    <span class="bg-strip__spacer"></span>
    <button class="button button--secondary bg-strip__action" @click="onReattach">
      Reconectar ao terminal
    </button>
  </div>
</template>
