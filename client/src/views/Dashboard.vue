<template>
  <div class="dashboard">
    <TitleBar :hostname="osInfo?.hostname" :online="online" :platform="platformLabel" />
    <div class="dashboard-grid">
      <CpuCard :cpu="cpu" />
      <MemoryCard :memory="memory" />
      <DiskCard :disk="disk" />
      <NetworkCard :network="network" />
      <GpuCard :controllers="graphics?.controllers" />
      <ProcessTable :processes="processes" />
    </div>
    <InfoBar :temperature="temperature" :battery="battery" :uptime="osInfo?.uptime" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { fetchSystemData } from '../api/system.js';
import TitleBar from '../components/TitleBar.vue';
import CpuCard from '../components/CpuCard.vue';
import MemoryCard from '../components/MemoryCard.vue';
import DiskCard from '../components/DiskCard.vue';
import NetworkCard from '../components/NetworkCard.vue';
import GpuCard from '../components/GpuCard.vue';
import ProcessTable from '../components/ProcessTable.vue';
import InfoBar from '../components/InfoBar.vue';

const cpu = ref(null);
const memory = ref(null);
const disk = ref([]);
const network = ref([]);
const processes = ref([]);
const graphics = ref({ controllers: [] });
const battery = ref(null);
const temperature = ref(null);
const osInfo = ref(null);
const online = ref(false);

const platformLabel = computed(() => {
  if (!osInfo.value) return '';
  return osInfo.value.distro || '';
});

let timer = null;

async function refresh() {
  const data = await fetchSystemData();
  if (data) {
    cpu.value = data.cpu;
    memory.value = data.memory;
    disk.value = data.disk;
    network.value = data.network;
    processes.value = data.processes;
    graphics.value = data.graphics;
    battery.value = data.battery;
    temperature.value = data.temperature;
    osInfo.value = data.osInfo;
    online.value = true;
  } else {
    online.value = false;
  }
}

onMounted(() => {
  refresh();
  timer = setInterval(refresh, 1500);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  padding: 0;
  min-height: 0;
}

.cpu-card    { grid-column: 1; grid-row: 1; }
.memory-card { grid-column: 2; grid-row: 1; }
.disk-card   { grid-column: 3; grid-row: 1; }
.network-card{ grid-column: 4; grid-row: 1 / 3; }
.gpu-card    { grid-column: 1 / 3; grid-row: 2; }
.process-card{ grid-column: 3 / 4; grid-row: 2; }
</style>
