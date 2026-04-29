const express = require('express');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 生产模式：托管前端静态文件
const publicDir = path.join(__dirname, 'public');
if (require('fs').existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

const VIRTUAL_IFACE_KEYWORDS = [
  'Loopback', 'loopback', 'lo',
  'vEthernet', 'Virtual', 'VirtualBox',
  'VMware', 'vbox', 'vmnet',
  'docker', 'br-', 'veth',
  'Hyper-V', 'hyperv',
  'Pseudo', 'pseudo',
  'Teredo', 'teredo',
  'isatap', 'ISATAP',
  'Bluetooth', 'bluetooth'
];

function isPhysicalInterface(iface) {
  if (iface.operstate !== 'up') return false;
  if (iface.type === 'wireless' || iface.type === 'wired') return true;
  for (const keyword of VIRTUAL_IFACE_KEYWORDS) {
    if (iface.iface && iface.iface.includes(keyword)) return false;
    if (iface.ifaceName && iface.ifaceName.includes(keyword)) return false;
  }
  return true;
}

function getNetworkSpeed(netStats) {
  return netStats.map(net => ({
    iface: net.iface,
    rx_sec: net.rx_sec >= 0 ? net.rx_sec : -1,
    tx_sec: net.tx_sec >= 0 ? net.tx_sec : -1,
    rx_total: net.rx_bytes,
    tx_total: net.tx_bytes
  }));
}

function formatBytes(bytes) {
  if (bytes == null || bytes < 0) return null;
  return bytes;
}

async function collectAllSystemData() {
  const [
    cpu,
    cpuSpeed,
    cpuTemp,
    mem,
    disks,
    networkInterfaces,
    netStats,
    processes,
    graphics,
    battery,
    osInfo
  ] = await Promise.all([
    si.cpu(),
    si.currentLoad(),
    si.cpuTemperature().catch(() => ({ main: null, max: null, cores: [] })),
    si.mem(),
    si.fsSize(),
    si.networkInterfaces(),
    si.networkStats(),
    si.processes(),
    si.graphics().catch(() => ({ controllers: [] })),
    si.battery().catch(() => ({ hasBattery: false, percent: null, isCharging: false })),
    si.osInfo()
  ]);

  const activeIfaces = networkInterfaces
    .filter(isPhysicalInterface)
    .map(iface => iface.iface || iface.ifaceName);

  const networkData = getNetworkSpeed(netStats)
    .filter(net => activeIfaces.includes(net.iface));

  const topProcesses = processes.list
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 10)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: p.cpu,
      mem: p.mem,
      state: p.state
    }));

  return {
    time: Date.now(),
    platform: process.platform,
    osInfo: {
      distro: osInfo.distro,
      hostname: osInfo.hostname,
      uptime: osInfo.uptime,
      arch: osInfo.arch
    },
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      usage: cpuSpeed.currentLoad,
      speed: cpuSpeed.avgClock
    },
    memory: {
      total: formatBytes(mem.total),
      used: formatBytes(mem.used),
      free: formatBytes(mem.free),
      usagePercent: (mem.used / mem.total * 100),
      swapTotal: formatBytes(mem.swaptotal),
      swapUsed: formatBytes(mem.swapused)
    },
    disk: disks.map(d => ({
      fs: d.fs,
      size: formatBytes(d.size),
      used: formatBytes(d.used),
      usagePercent: d.use,
      type: d.type,
      mount: d.mount
    })),
    network: networkData,
    processes: topProcesses,
    graphics: {
      controllers: graphics.controllers.map(g => ({
        model: g.model,
        vram: g.vram,
        vendor: g.vendor
      }))
    },
    battery: {
      hasBattery: battery.hasBattery,
      percent: battery.percent,
      isCharging: battery.isCharging
    },
    temperature: {
      main: cpuTemp.main,
      max: cpuTemp.max,
      cores: cpuTemp.cores || []
    }
  };
}

app.get('/api/system/all', async (req, res) => {
  try {
    const data = await collectAllSystemData();
    res.json(data);
  } catch (err) {
    console.error('Failed to collect system data:', err.message);
    res.status(500).json({ error: 'Failed to collect system data', message: err.message });
  }
});

// SPA fallback：非 API 路由返回 index.html
app.use((req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`System monitor server running on http://localhost:${PORT}`);
    console.log(`Platform: ${process.platform}`);
  });
}

module.exports = app;
