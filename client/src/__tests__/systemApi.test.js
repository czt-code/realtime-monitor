import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSystemData } from '../api/system.js';

describe('system.js API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // F-20: fetch 成功返回数据
  it('F-20: should return parsed JSON on successful fetch', async () => {
    const mockData = {
      time: Date.now(),
      platform: 'win32',
      cpu: { usage: 30, cores: 8, brand: 'Intel', manufacturer: 'Intel', speed: 3.5 },
      memory: { total: 32000000000, used: 16000000000, usagePercent: 50, free: 16000000000 },
      disk: [],
      network: [],
      processes: [],
      graphics: { controllers: [] },
      battery: { hasBattery: false },
      temperature: { main: 50 }
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchSystemData();
    expect(result).toEqual(mockData);
    expect(result.cpu.usage).toBe(30);
    expect(result.memory.usagePercent).toBe(50);
  });

  // F-21: fetch 失败不抛异常，返回 null
  it('F-21: should return null and not throw on fetch failure', async () => {
    fetch.mockRejectedValue(new Error('Connection refused'));

    const result = await fetchSystemData();
    expect(result).toBeNull();
  });

  // F-21b: 非 200 响应也返回 null
  it('F-21b: should return null on non-ok response', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    const result = await fetchSystemData();
    expect(result).toBeNull();
  });
});
