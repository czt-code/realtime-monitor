<template>
  <div class="gpu-card card">
    <div class="card-title">GPU</div>
    <div v-if="!controllers?.length" class="card-subtitle">无独立显卡</div>
    <div v-for="g in controllers" :key="g.model" class="card-subtitle">
      {{ g.model }} {{ g.vram }}GB
    </div>
  </div>
</template>

<script setup>
defineProps({ controllers: { type: Array, default: () => [] } });
</script>
