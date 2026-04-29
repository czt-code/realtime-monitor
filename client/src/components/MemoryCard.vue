<template>
  <div class="memory-card card">
    <div class="card-title">内存</div>
    <div class="card-value">{{ memory?.usagePercent?.toFixed(1) ?? '--' }}<span class="card-unit">%</span></div>
    <div class="card-subtitle">{{ formatGB(memory?.used) }} / {{ formatGB(memory?.total) }}</div>
  </div>
</template>

<script setup>
defineProps({ memory: Object });
function formatGB(bytes) {
  if (bytes == null) return '-- GB';
  return (bytes / (1024 ** 3)).toFixed(1) + ' GB';
}
</script>
