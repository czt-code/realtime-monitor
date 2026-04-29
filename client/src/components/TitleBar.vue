<template>
  <div class="title-bar">
    <div class="title-left">
      <span class="status-dot" :class="online ? 'online' : 'offline'"></span>
      <span class="title-text">系统实时监控大屏</span>
    </div>
    <div class="title-right">
      <span class="title-host">{{ hostname }}</span>
      <span class="title-time">{{ timeDisplay }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  hostname: { type: String, default: '--' },
  online: { type: Boolean, default: false }
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
