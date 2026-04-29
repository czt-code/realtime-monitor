import { describe, it, expect, vi } from 'vitest';
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

// Mock echarts (jsdom has no Canvas)
vi.mock('echarts', () => {
  const mockChart = {
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn()
  };
  return {
    default: { init: vi.fn(() => mockChart) },
    init: vi.fn(() => mockChart),
    graphic: { LinearGradient: function() { return {}; } }
  };
});

vi.mock('../api/system.js', () => ({
  fetchSystemData: vi.fn()
}));

import { fetchSystemData } from '../api/system.js';

// ============================================================
// F-01 ~ F-02: Dashboard
// ============================================================
describe('Dashboard.vue', () => {
  it('F-02: should render without crash when data is null', () => {
    fetchSystemData.mockResolvedValue(null);
    const wrapper = mount(Dashboard, {
      global: { stubs: { TitleBar: true, CpuCard: true, MemoryCard: true, DiskCard: true, NetworkCard: true, GpuCard: true, ProcessTable: true, InfoBar: true } }
    });
    expect(wrapper.find('.dashboard').exists()).toBe(true);
    expect(wrapper.html()).toBeTruthy();
  });

  it('F-01: should render dashboard layout with grid', () => {
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
// F-03 ~ F-05: CpuCard (ECharts gauge — check chart container)
// ============================================================
describe('CpuCard.vue', () => {
  it('F-03: should render chart container and brand text', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 45.2, cores: 8, brand: 'Intel Core i9', manufacturer: 'Intel', speed: 3.6 } }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Intel Core i9');
    expect(wrapper.text()).toContain('8 核心');
  });

  it('F-04: should render with 0% usage', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 0, cores: 4, brand: 'Test', manufacturer: 'Test', speed: 2.0 } }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
  });

  it('F-05: should render with 100% usage', () => {
    const wrapper = mount(CpuCard, {
      props: { cpu: { usage: 100, cores: 16, brand: 'Test', manufacturer: 'Test', speed: 4.0 } }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
  });
});

// ============================================================
// F-06: MemoryCard (ECharts ring — check chart container)
// ============================================================
describe('MemoryCard.vue', () => {
  it('F-06: should render chart and show GB values', () => {
    const wrapper = mount(MemoryCard, {
      props: { memory: { total: 32 * 1024 ** 3, used: 8 * 1024 ** 3, usagePercent: 25, free: 24 * 1024 ** 3 } }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('8.0 GB');
    expect(wrapper.text()).toContain('32.0 GB');
  });
});

// ============================================================
// F-07: DiskCard (ECharts bar chart — check chart container)
// ============================================================
describe('DiskCard.vue', () => {
  it('F-07: should render chart for multiple disks', () => {
    const wrapper = mount(DiskCard, {
      props: {
        disk: [
          { fs: 'C:', size: 500e9, used: 200e9, usagePercent: 40, type: 'NTFS' },
          { fs: 'D:', size: 1000e9, used: 500e9, usagePercent: 50, type: 'NTFS' }
        ]
      }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
  });
});

// ============================================================
// F-08 ~ F-09: NetworkCard (ECharts line chart with ring buffer)
// ============================================================
describe('NetworkCard.vue', () => {
  it('F-08: should render chart container for network data', () => {
    const wrapper = mount(NetworkCard, {
      props: { network: [{ iface: 'Ethernet', rx_sec: 1.2e6, tx_sec: 0.8e6 }] }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
  });

  it('F-09: should handle empty network array', () => {
    const wrapper = mount(NetworkCard, {
      props: { network: [] }
    });
    expect(wrapper.find('.chart-box').exists()).toBe(true);
  });
});

// ============================================================
// F-10 ~ F-11: ProcessTable
// ============================================================
describe('ProcessTable.vue', () => {
  it('F-10: should display top 10 processes', () => {
    const processes = Array.from({ length: 20 }, (_, i) => ({
      pid: i,
      name: `process-${i}`,
      cpu: 20 - i,
      mem: 10,
      state: 'running'
    }));
    const wrapper = mount(ProcessTable, { props: { processes } });
    const rows = wrapper.findAll('.process-row');
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
      props: { hostname: 'my-pc', online: true, platform: 'win32' }
    });
    expect(wrapper.text()).toContain('my-pc');
    expect(wrapper.text()).toContain('系统实时监控大屏');
    expect(wrapper.find('.status-dot.online').exists()).toBe(true);
  });

  it('F-19b: should show offline dot when offline', () => {
    const wrapper = mount(TitleBar, {
      props: { hostname: 'my-pc', online: false, platform: '' }
    });
    expect(wrapper.find('.status-dot.offline').exists()).toBe(true);
  });
});
