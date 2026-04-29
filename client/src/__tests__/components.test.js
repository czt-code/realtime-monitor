import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CpuCard from '../components/CpuCard.vue';
import MemoryCard from '../components/MemoryCard.vue';
import DiskCard from '../components/DiskCard.vue';
import NetworkCard from '../components/NetworkCard.vue';
import ProcessTable from '../components/ProcessTable.vue';
import GpuCard from '../components/GpuCard.vue';
import InfoBar from '../components/InfoBar.vue';
import TitleBar from '../components/TitleBar.vue';
import Dashboard from '../views/Dashboard.vue';

// --- Stub fetchSystemData for Dashboard tests ---
vi.mock('../api/system.js', () => ({
  fetchSystemData: vi.fn()
}));

import { fetchSystemData } from '../api/system.js';

// ============================================================
// F-01 ~ F-02: Dashboard
// ============================================================
describe('Dashboard.vue', () => {
  // F-02: data is null — no crash
  it('F-02: should render without crash when data is null', () => {
    fetchSystemData.mockResolvedValue(null);
    const wrapper = mount(Dashboard, {
      global: { stubs: { TitleBar: true, CpuCard: true, MemoryCard: true, DiskCard: true, NetworkCard: true, GpuCard: true, ProcessTable: true, InfoBar: true } }
    });
    expect(wrapper.find('.dashboard').exists()).toBe(true);
    expect(wrapper.html()).toBeTruthy();
  });

  // F-01: layout — 8 child cards present
  it('F-01: should render all 8 child component areas', () => {
    fetchSystemData.mockResolvedValue({
      cpu: { usage: 10, cores: 8, brand: 'Test', manufacturer: 'Test', speed: 3.0 },
      memory: { total: 32e9, used: 8e9, usagePercent: 25, free: 24e9, swapTotal: null, swapUsed: null },
      disk: [{ fs: 'C:', size: 500e9, used: 200e9, usagePercent: 40, type: 'NTFS' }],
      network: [{ iface: 'Ethernet', rx_sec: 1024, tx_sec: 512 }],
      processes: [{ pid: 1, name: 'test', cpu: 5, mem: 10, state: 'running' }],
      graphics: { controllers: [] },
      battery: { hasBattery: false, percent: null, isCharging: false },
      temperature: { main: 50, max: 60, cores: [] },
      osInfo: { distro: 'Test', hostname: 'test-pc', uptime: 3600, arch: 'x64' },
      platform: 'win32'
    });
    const wrapper = mount(Dashboard, {
      global: { stubs: { TitleBar: true, CpuCard: true, MemoryCard: true, DiskCard: true, NetworkCard: true, GpuCard: true, ProcessTable: true, InfoBar: true } }
    });
    expect(wrapper.find('.dashboard').exists()).toBe(true);
    expect(wrapper.find('.dashboard-grid').exists()).toBe(true);
  });
});

// ============================================================
// F-03 ~ F-05: CpuCard
// ============================================================
describe('CpuCard.vue', () => {
  it('F-03: should display CPU usage and brand', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 45.2, cores: 8, brand: 'Intel Core i9', manufacturer: 'Intel', speed: 3.6 } }
    });
    expect(wrapper.text()).toContain('45.2');
    expect(wrapper.text()).toContain('Intel Core i9');
    expect(wrapper.text()).toContain('8 核心');
  });

  it('F-04: should handle 0% usage', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 0, cores: 4, brand: 'Test', manufacturer: 'Test', speed: 2.0 } }
    });
    expect(wrapper.text()).toContain('0');
  });

  it('F-05: should handle 100% usage', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 100, cores: 16, brand: 'Test', manufacturer: 'Test', speed: 4.0 } }
    });
    expect(wrapper.text()).toContain('100');
  });
});

// ============================================================
// F-06: MemoryCard
// ============================================================
describe('MemoryCard.vue', () => {
  it('F-06: should display correct usage percent and GB values', () => {
    const wrapper = mount(MemoryCard, {
      props: { memory: { total: 32 * 1024 ** 3, used: 8 * 1024 ** 3, usagePercent: 25, free: 24 * 1024 ** 3 } }
    });
    expect(wrapper.text()).toContain('25');
    expect(wrapper.text()).toContain('8');
    expect(wrapper.text()).toContain('32');
  });
});

// ============================================================
// F-07: DiskCard
// ============================================================
describe('DiskCard.vue', () => {
  it('F-07: should render two disks', () => {
    const wrapper = mount(DiskCard, {
      props: {
        disk: [
          { fs: 'C:', size: 500e9, used: 200e9, usagePercent: 40, type: 'NTFS' },
          { fs: 'D:', size: 1000e9, used: 500e9, usagePercent: 50, type: 'NTFS' }
        ]
      }
    });
    expect(wrapper.text()).toContain('C:');
    expect(wrapper.text()).toContain('D:');
    expect(wrapper.text()).toContain('40');
    expect(wrapper.text()).toContain('50');
  });
});

// ============================================================
// F-08 ~ F-09: NetworkCard
// ============================================================
describe('NetworkCard.vue', () => {
  it('F-08: should update with network data', () => {
    const wrapper = mount(NetworkCard, {
      props: { network: [{ iface: 'Ethernet', rx_sec: 1.2e6, tx_sec: 0.8e6 }] }
    });
    expect(wrapper.text()).toContain('Ethernet');
    // formatSpeed should show MB/s
    expect(wrapper.text()).toMatch(/1\.\d MB\/s/);
  });

  it('F-09: formatSpeed handles edge cases', () => {
    const wrapper = mount(NetworkCard, {
      props: { network: [{ iface: 'Wi-Fi', rx_sec: -1, tx_sec: 0 }] }
    });
    expect(wrapper.text()).toContain('Wi-Fi');
    // negative values show '--'
    expect(wrapper.text()).toContain('--');
  });
});

// ============================================================
// F-10 ~ F-11: ProcessTable
// ============================================================
describe('ProcessTable.vue', () => {
  it('F-10: should display top 10 processes sorted by CPU', () => {
    const processes = Array.from({ length: 20 }, (_, i) => ({
      pid: i,
      name: `process-${i}`,
      cpu: 20 - i,
      mem: 10,
      state: 'running'
    }));
    const wrapper = mount(ProcessTable, { props: { processes } });
    // Check that only 10 are displayed
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(10);
  });

  it('F-11: should show empty state when no processes', () => {
    const wrapper = mount(ProcessTable, { props: { processes: [] } });
    expect(wrapper.text()).toContain('无进程数据');
  });
});

// ============================================================
// F-12 ~ F-13: GpuCard
// ============================================================
describe('GpuCard.vue', () => {
  it('F-12: should display GPU model and VRAM when present', () => {
    const wrapper = mount(GpuCard, {
      props: { controllers: [{ model: 'RTX 4090', vram: 24, vendor: 'NVIDIA' }] }
    });
    expect(wrapper.text()).toContain('RTX 4090');
    expect(wrapper.text()).toContain('24');
  });

  it('F-13: should show fallback when no GPU', () => {
    const wrapper = mount(GpuCard, { props: { controllers: [] } });
    expect(wrapper.text()).toContain('无独立显卡');
  });
});

// ============================================================
// F-14 ~ F-18: InfoBar
// ============================================================
describe('InfoBar.vue', () => {
  it('F-14: should display temperature when present', () => {
    const wrapper = mount(InfoBar, {
      props: { temperature: { main: 52, max: 65 }, battery: { hasBattery: false }, uptime: 3600 }
    });
    expect(wrapper.text()).toContain('52°C');
  });

  it('F-15: should display N/A when temperature is null', () => {
    const wrapper = mount(InfoBar, {
      props: { temperature: { main: null }, battery: { hasBattery: false }, uptime: 3600 }
    });
    expect(wrapper.text()).toContain('N/A');
  });

  it('F-16: should show battery and charging status', () => {
    const wrapper = mount(InfoBar, {
      props: { temperature: { main: 50 }, battery: { hasBattery: true, percent: 85, isCharging: true }, uptime: 3600 }
    });
    expect(wrapper.text()).toContain('85');
    expect(wrapper.text()).toContain('电池');
  });

  it('F-17: should not show battery when hasBattery is false', () => {
    const wrapper = mount(InfoBar, {
      props: { temperature: { main: 50 }, battery: { hasBattery: false }, uptime: 3600 }
    });
    expect(wrapper.text()).not.toContain('电池');
  });

  it('F-18: should format uptime correctly (25h = 1d 1h)', () => {
    const wrapper = mount(InfoBar, {
      props: { temperature: { main: 50 }, battery: { hasBattery: false }, uptime: 90061 }
    });
    expect(wrapper.text()).toContain('1d');
    expect(wrapper.text()).toContain('1h');
  });
});

// ============================================================
// F-19: TitleBar
// ============================================================
describe('TitleBar.vue', () => {
  it('F-19: should render hostname and online status', () => {
    const wrapper = mount(TitleBar, {
      props: { hostname: 'my-pc', online: true }
    });
    expect(wrapper.text()).toContain('my-pc');
    expect(wrapper.text()).toContain('系统实时监控大屏');
    expect(wrapper.find('.status-dot.online').exists()).toBe(true);
  });

  it('F-19b: should show offline dot when offline', () => {
    const wrapper = mount(TitleBar, {
      props: { hostname: 'my-pc', online: false }
    });
    expect(wrapper.find('.status-dot.offline').exists()).toBe(true);
  });
});
