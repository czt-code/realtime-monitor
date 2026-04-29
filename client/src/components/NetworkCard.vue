<template>
  <div class="network-card card card-enter" style="animation-delay: 0.4s">
    <div class="card-title">网络流量</div>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({ network: { type: Array, default: () => [] } });
const chartRef = ref(null);
let chart = null;

const MAX_POINTS = 60;
const history = ref({});

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    grid: { left: '8%', right: '8%', top: 10, bottom: 30 },
    xAxis: {
      type: 'category', data: [],
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.15)' } },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.15)' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.06)' } },
      axisLabel: { color: '#64748b', fontSize: 10, fontFamily: "'Cascadia Code', monospace",
        formatter: v => v >= 1e6 ? (v/1e6).toFixed(1)+'MB' : v >= 1e3 ? (v/1e3).toFixed(0)+'KB' : v+'B' }
    },
    series: []
  });
}

function formatSpeedLabel(bytesPerSec) {
  if (bytesPerSec == null || bytesPerSec < 0) return '--';
  if (bytesPerSec >= 1e6) return (bytesPerSec / 1e6).toFixed(1) + ' MB/s';
  if (bytesPerSec >= 1e3) return (bytesPerSec / 1e3).toFixed(1) + ' KB/s';
  return bytesPerSec.toFixed(0) + ' B/s';
}

function updateChart() {
  if (!chart) return;
  const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const netList = props.network || [];
  const series = [];

  // Clean up stale interfaces not seen recently
  const activeIfaces = new Set(netList.map(n => n.iface));

  for (const net of netList) {
    if (!history.value[net.iface]) {
      history.value[net.iface] = { rx: new Array(MAX_POINTS).fill(null), tx: new Array(MAX_POINTS).fill(null) };
    }
    const h = history.value[net.iface];
    h.rx.push(net.rx_sec);
    h.tx.push(net.tx_sec);
    if (h.rx.length > MAX_POINTS) h.rx.shift();
    if (h.tx.length > MAX_POINTS) h.tx.shift();

    const rxLine = { smooth: true, symbol: 'none', lineStyle: { width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
        [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0.02)' }]) } };
    const txLine = { smooth: true, symbol: 'none', lineStyle: { width: 2, type: 'dashed' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
        [{ offset: 0, color: 'rgba(168,85,247,0.3)' }, { offset: 1, color: 'rgba(168,85,247,0.02)' }]) } };

    series.push({
      name: net.iface + ' ↓' + formatSpeedLabel(net.rx_sec),
      type: 'line', data: h.rx, ...rxLine,
      itemStyle: { color: '#00d4ff' }
    });
    series.push({
      name: net.iface + ' ↑' + formatSpeedLabel(net.tx_sec),
      type: 'line', data: h.tx, ...txLine,
      itemStyle: { color: '#a855f7' }
    });
  }

  const timeLabels = history.value[Object.keys(history.value)[0]]?.rx?.map(() => '') || [];
  if (timeLabels.length > 0) {
    timeLabels[timeLabels.length - 1] = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }

  chart.setOption({
    xAxis: { data: Array.from({ length: MAX_POINTS }, (_, i) => i === MAX_POINTS - 1 ? now : (i % 15 === 0 ? '-' : '')) },
    series,
    legend: { data: series.map(s => s.name) }
  });

  // Clean up stale series
  for (const iface of Object.keys(history.value)) {
    if (!activeIfaces.has(iface)) {
      delete history.value[iface];
    }
  }
}

onMounted(() => { initChart(); });
watch(() => props.network, updateChart, { deep: true });
onUnmounted(() => { chart?.dispose(); });
</script>

<style scoped>
.chart-box { width: 100%; height: 140px; }
</style>
