<script setup lang="ts">
defineProps<{ status: string }>()
</script>

<template>
  <span class="status-pill" :class="`status-pill--${status}`">
    <span class="status-pill__dot" aria-hidden="true"></span>
    <span class="status-pill__label">{{ status }}</span>
  </span>
</template>
