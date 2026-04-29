<template>
  <div class="gpu-card card card-enter" style="animation-delay: 0.5s">
    <div class="card-title">GPU</div>
    <div v-if="!controllers?.length" class="card-subtitle empty">无独立显卡</div>
    <div v-else class="gpu-list">
      <div v-for="g in controllers" :key="g.model" class="gpu-item">
        <div class="gpu-model">{{ g.vendor }} {{ g.model }}</div>
        <div class="gpu-vram">{{ g.vram }} GB VRAM</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ controllers: { type: Array, default: () => [] } });
</script>

<style scoped>
.gpu-list { display: flex; flex-direction: column; gap: 8px; }
.gpu-item { padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid var(--accent); }
.gpu-model { font-size: 13px; color: var(--text-primary); font-weight: 600; }
.gpu-vram { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px; }
.empty { text-align: center; padding: 20px; }
</style>
