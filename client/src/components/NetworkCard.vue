<template>
  <div class="network-card card">
    <div class="card-title">网络流量</div>
    <div v-if="!network?.length" class="card-value">--</div>
    <div v-for="n in network" :key="n.iface" class="card-subtitle">
      {{ n.iface }} ↓{{ formatSpeed(n.rx_sec) }} ↑{{ formatSpeed(n.tx_sec) }}
    </div>
  </div>
</template>

<script setup>
defineProps({ network: { type: Array, default: () => [] } });
function formatSpeed(bytesPerSec) {
  if (bytesPerSec == null || bytesPerSec < 0) return '--';
  if (bytesPerSec >= 1e6) return (bytesPerSec / 1e6).toFixed(1) + ' MB/s';
  if (bytesPerSec >= 1e3) return (bytesPerSec / 1e3).toFixed(1) + ' KB/s';
  return bytesPerSec.toFixed(0) + ' B/s';
}
</script>
