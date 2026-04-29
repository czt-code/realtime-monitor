<template>
  <div class="process-card card">
    <div class="card-title">进程 TOP 10</div>
    <div v-if="!processes?.length" class="card-subtitle">无进程数据</div>
    <table v-else>
      <thead><tr><th>名称</th><th>CPU%</th><th>内存%</th></tr></thead>
      <tbody>
        <tr v-for="p in processes.slice(0, 10)" :key="p.pid">
          <td>{{ p.name }}</td><td>{{ p.cpu?.toFixed(1) }}</td><td>{{ p.mem?.toFixed(1) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ processes: { type: Array, default: () => [] } });
</script>
