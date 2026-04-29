<template>
  <div class="cpu-card card">
    <div class="card-title">CPU</div>
    <div class="card-value">{{ cpu?.usage ?? '--' }}<span class="card-unit">%</span></div>
    <div class="card-subtitle">{{ cpu?.brand }}</div>
    <div class="card-subtitle">{{ cpu?.cores }} 核心 {{ cpu?.speed?.toFixed(1) }} GHz</div>
  </div>
</template>

<script setup>
defineProps({ cpu: Object });
</script>
