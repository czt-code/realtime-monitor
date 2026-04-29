<template>
  <div class="cpu-card card card-enter" style="animation-delay: 0.1s">
    <div class="card-title">CPU 使用率</div>
    <div ref="chartRef" class="chart-box"></div>
    <div class="cpu-info">
      <div class="cpu-brand">{{ cpu?.brand }}</div>
      <div class="cpu-detail">{{ cpu?.cores }} 核心 · {{ cpu?.physicalCores }} 物理核 · {{ cpu?.speed?.toFixed(2) ?? '--' }} GHz</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({ cpu: Object });
const chartRef = ref(null);
let chart = null;

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
}

function updateChart() {
  if (!chart) return;
  const usage = props.cpu?.usage ?? 0;
  chart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '58%'],
      radius: '90%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        show: true,
        lineStyle: {
          width: 18,
          color: [
            [0.3, '#22c55e'],
            [0.7, '#f59e0b'],
            [1, '#ef4444']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8 0.7l12 40.1H0.7L12.8 0.7z',
        length: '70%',
        width: 8,
        offsetCenter: [0, '-8%'],
        itemStyle: { color: '#00d4ff' }
      },
      axisTick: { distance: -18, length: 8, lineStyle: { width: 1, color: '#64748b' } },
      splitLine: { distance: -22, length: 18, lineStyle: { width: 2, color: '#64748b' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, distance: 30, fontFamily: "'Cascadia Code', monospace" },
      anchor: { show: true, showAbove: true, size: 16, itemStyle: { borderWidth: 2, borderColor: '#00d4ff' } },
      title: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 36,
        fontWeight: 'bold',
        color: '#00d4ff',
        offsetCenter: [0, '72%'],
        fontFamily: "'Cascadia Code', monospace",
        formatter: function (value) {
          return value.toFixed(2) + '%';
        }
      },
      data: [{ value: usage }]
    }]
  });
}

onMounted(() => { initChart(); updateChart(); });
watch(() => props.cpu, updateChart, { deep: true });
onUnmounted(() => { chart?.dispose(); });
</script>

<style scoped>
.chart-box { width: 100%; height: 130px; }
.cpu-info { text-align: center; margin-top: 2px; }
.cpu-brand { font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }
.cpu-detail { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); margin-top: 2px; }
</style>
