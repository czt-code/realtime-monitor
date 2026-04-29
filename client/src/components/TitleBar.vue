<template>
  <div class="title-bar">
    <div class="title-left">
      <span class="status-dot" :class="online ? 'online' : 'offline'"></span>
      <span class="title-text">系统实时监控大屏</span>
      <span class="title-platform">{{ platform }}</span>
    </div>
    <div class="title-right">
      <span class="title-host">{{ hostname }}</span>
      <span class="title-sep">|</span>
      <span class="title-time">{{ timeDisplay }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  hostname: { type: String, default: '--' },
  online: { type: Boolean, default: false },
  platform: { type: String, default: '' }
});

const now = ref(new Date());
let timer = null;

const timeDisplay = computed(() => {
  return now.value.toLocaleTimeString('zh-CN', { hour12: false });
});

onMounted(() => {
  timer = setInterval(() => { now.value = new Date(); }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.title-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 60px;
  background: var(--card-bg); border-bottom: 1px solid var(--card-border);
  backdrop-filter: blur(10px);
}
.title-left, .title-right { display: flex; align-items: center; gap: 12px; }
.title-text {
  font-size: 18px; font-weight: 700; letter-spacing: 0.06em;
  background: linear-gradient(90deg, var(--text-primary) 0%, var(--accent) 50%, var(--purple-light) 100%);
  background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; animation: shimmer 3s ease infinite;
}
.title-platform {
  font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.05);
  padding: 2px 8px; border-radius: 10px; text-transform: uppercase;
}
.title-host { color: var(--text-secondary); font-size: 13px; font-family: var(--font-mono); }
.title-sep { color: var(--text-dim); font-size: 12px; }
.title-time {
  color: var(--accent); font-size: 15px; font-family: var(--font-mono);
  font-weight: 600; font-variant-numeric: tabular-nums;
}
</style>
