<template>
  <div class="info-bar">
    <div class="info-item">
      <span class="info-icon">🌡</span>
      <span class="info-label">CPU温度</span>
      <span class="info-value" :class="{ 'value-danger': tempDanger }" :title="tempTooltip">{{ tempDisplay }}</span>
    </div>
    <div v-if="battery?.hasBattery" class="info-item">
      <span class="info-icon">{{ battery.isCharging ? '⚡' : '🔋' }}</span>
      <span class="info-label">电池</span>
      <span class="info-value">{{ battery?.percent ?? '--' }}%</span>
      <span class="battery-bar"><span class="battery-fill" :style="{ width: (battery?.percent ?? 0) + '%' }"></span></span>
    </div>
    <div class="info-item">
      <span class="info-icon">⏱</span>
      <span class="info-label">运行时间</span>
      <span class="info-value">{{ uptimeDisplay }}</span>
    </div>
    <div class="info-item info-right">
      <span class="status-dot online"></span>
      <span class="info-label">系统运行中</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  temperature: Object,
  battery: Object,
  uptime: Number,
  platform: String
});

const tempDisplay = computed(() => {
  const t = props.temperature?.main;
  return t != null ? t + '°C' : 'N/A';
});

const tempDanger = computed(() => (props.temperature?.main ?? 0) > 80);

const tempTooltip = computed(() => {
  if (props.temperature?.main != null) return '';
  if (props.platform === 'win32') {
    return '无法获取CPU温度。请运行 LibreHardwareMonitor，点击 Options → Remote Web Server → 勾选 Enable 并确认端口为 8085 → 点击 Start Server';
  }
  return '无法获取CPU温度。请安装 lm-sensors 并运行传感器检测：sudo apt install lm-sensors && sudo sensors-detect';
});

const uptimeDisplay = computed(() => {
  const u = props.uptime;
  if (u == null) return 'N/A';
  const days = Math.floor(u / 86400);
  const hours = Math.floor((u % 86400) / 3600);
  const mins = Math.floor((u % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m`;
});
</script>

<style scoped>
.info-bar {
  display: flex; align-items: center; gap: 24px; padding: 0 16px;
  background: var(--card-bg); border-top: 1px solid var(--card-border);
  backdrop-filter: blur(10px); font-size: 12px;
}
.info-item { display: flex; align-items: center; gap: 6px; }
.info-icon { font-size: 14px; }
.info-label { color: var(--text-dim); }
.info-value { color: var(--text-primary); font-family: var(--font-mono); font-weight: 600; }
.value-danger { color: var(--danger); animation: pulse 1s ease infinite; }
.info-right { margin-left: auto; }
.battery-bar { display: inline-block; position: relative; width: 40px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; vertical-align: middle; }
.battery-fill { display: block; position: absolute; left: 0; top: 0; height: 100%; border-radius: 2px; background: #22c55e; transition: width 1s ease; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>
