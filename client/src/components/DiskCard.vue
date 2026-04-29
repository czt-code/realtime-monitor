<template>
  <div class="disk-card card">
    <div class="card-title">磁盘</div>
    <div v-if="!disk?.length" class="card-value">--</div>
    <div v-for="d in disk" :key="d.fs" class="card-subtitle">
      {{ d.fs }} {{ d.usagePercent?.toFixed(1) }}%
    </div>
  </div>
</template>

<script setup>
defineProps({ disk: { type: Array, default: () => [] } });
</script>
