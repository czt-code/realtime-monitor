<template>
  <div class="info-bar">
    <span>CPU温度: {{ tempDisplay }}</span>
    <span v-if="battery?.hasBattery">电池: {{ battery?.percent ?? '--' }}% {{ battery?.isCharging ? '⚡' : '' }}</span>
    <span>运行时间: {{ uptimeDisplay }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  temperature: Object,
  battery: Object,
  uptime: Number
});

const tempDisplay = computed(() => {
  const t = props.temperature?.main;
  return t != null ? t + '°C' : 'N/A';
});

const uptimeDisplay = computed(() => {
  const u = props.uptime;
  if (u == null) return 'N/A';
  const days = Math.floor(u / 86400);
  const hours = Math.floor((u % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((u % 3600) / 60);
  return `${hours}h ${mins}m`;
});
</script>
