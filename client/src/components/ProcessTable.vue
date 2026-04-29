<template>
  <div class="process-card card card-enter" style="animation-delay: 0.6s">
    <div class="card-title">进程 TOP 10</div>
    <div v-if="!processes?.length" class="card-subtitle empty">无进程数据</div>
    <div v-else class="process-list">
      <div class="process-header">
        <span class="col-name">名称</span>
        <span class="col-cpu">CPU</span>
        <span class="col-mem">内存</span>
      </div>
      <div v-for="(p, i) in processes.slice(0, 10)" :key="p.pid" class="process-row" :style="{ animationDelay: (0.6 + i * 0.05) + 's' }">
        <span class="col-name">{{ p.name }}</span>
        <span class="col-cpu">
          <span class="bar-bg"><span class="bar-fill cpu-fill" :style="{ width: Math.min(p.cpu, 100) + '%' }"></span></span>
          <span class="bar-num">{{ p.cpu?.toFixed(1) }}%</span>
        </span>
        <span class="col-mem">
          <span class="bar-bg"><span class="bar-fill mem-fill" :style="{ width: Math.min(p.mem, 100) + '%' }"></span></span>
          <span class="bar-num">{{ p.mem?.toFixed(1) }}%</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ processes: { type: Array, default: () => [] } });
</script>

<style scoped>
.process-list { display: flex; flex-direction: column; gap: 2px; }
.process-header {
  display: flex; padding: 2px 6px; font-size: 10px; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(0,212,255,0.1);
  margin-bottom: 2px;
}
.process-row {
  display: flex; align-items: center; padding: 3px 6px; font-size: 12px;
  font-family: var(--font-mono); border-radius: 4px;
  transition: background 0.2s; animation: fadeInUp 0.3s ease both;
}
.process-row:hover { background: rgba(0,212,255,0.05); }
.col-name { flex: 2; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-cpu { flex: 1; display: flex; align-items: center; gap: 4px; color: var(--text-secondary); text-align: right; justify-content: flex-end; }
.col-mem { flex: 1; display: flex; align-items: center; gap: 4px; color: var(--text-secondary); text-align: right; justify-content: flex-end; }
.bar-bg { width: 56px; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
.bar-fill { display: inline-block; height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.bar-num { display: inline-block; min-width: 42px; text-align: right; }
.cpu-fill { background: linear-gradient(90deg, #00d4ff, #22c55e); }
.mem-fill { background: linear-gradient(90deg, #7c3aed, #a855f7); }
.empty { text-align: center; padding: 20px; }
</style>
