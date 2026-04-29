<template>
  <div class="disk-card card card-enter" style="animation-delay: 0.3s">
    <div class="card-title">磁盘</div>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({ disk: { type: Array, default: () => [] } });
const chartRef = ref(null);
let chart = null;

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
}

function updateChart() {
  if (!chart || !props.disk?.length) return;
  const names = props.disk.map(d => d.fs);
  const usedVals = props.disk.map(d => d.usagePercent);
  const colors = usedVals.map(v => {
    if (v > 90) return '#ef4444';
    if (v > 70) return '#f59e0b';
    return '#22c55e';
  });
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '12%', right: '8%', top: 10, bottom: 20 },
    xAxis: {
      type: 'value', max: 100,
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.15)' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)' } },
      axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' }
    },
    yAxis: {
      type: 'category', data: names,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#e2e8f0', fontSize: 11, fontFamily: "'Cascadia Code', monospace" }
    },
    series: [{
      type: 'bar',
      data: usedVals.map((v, i) => ({
        value: v,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colors[i] },
            { offset: 1, color: colors[i] + '80' }
          ]),
          borderRadius: [0, 4, 4, 0],
          borderWidth: 0
        }
      })),
      barWidth: 16,
      label: { show: true, position: 'right', color: '#94a3b8', fontSize: 10,
        fontFamily: "'Cascadia Code', monospace", formatter: '{c}%' }
    }]
  });
}

onMounted(() => { initChart(); updateChart(); });
watch(() => props.disk, updateChart, { deep: true });
onUnmounted(() => { chart?.dispose(); });
</script>

<style scoped>
.chart-box { width: 100%; height: 140px; }
</style>
