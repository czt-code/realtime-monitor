<template>
  <div class="memory-card card card-enter" style="animation-delay: 0.2s">
    <div class="card-title">内存</div>
    <div ref="chartRef" class="chart-box"></div>
    <div class="card-subtitle">{{ formatGB(memory?.used) }} / {{ formatGB(memory?.total) }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({ memory: Object });
const chartRef = ref(null);
let chart = null;

function formatGB(bytes) {
  if (bytes == null) return '-- GB';
  return (bytes / (1024 ** 3)).toFixed(1) + ' GB';
}

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
}

function updateChart() {
  if (!chart) return;
  const used = props.memory?.usagePercent ?? 0;
  const total = 100;
  chart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      center: ['50%', '55%'],
      radius: '85%',
      min: 0,
      max: 100,
      clockwise: true,
      axisLine: {
        show: true,
        lineStyle: {
          width: 22,
          color: [
            [used / 100, {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
              colorStops: [
                { offset: 0, color: '#7c3aed' },
                { offset: 1, color: '#a855f7' }
              ]
            }],
            [1, 'rgba(255,255,255,0.06)']
          ]
        }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 36,
        fontWeight: 'bold',
        color: '#a855f7',
        offsetCenter: [0, '0%'],
        fontFamily: "'Cascadia Code', monospace",
        formatter: '{value}%'
      },
      data: [{ value: +used.toFixed(1) }]
    }]
  });
}

onMounted(() => { initChart(); updateChart(); });
watch(() => props.memory, updateChart, { deep: true });
onUnmounted(() => { chart?.dispose(); });
</script>

<style scoped>
.chart-box { width: 100%; height: 140px; }
</style>
