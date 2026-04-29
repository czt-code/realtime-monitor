import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../index');

describe('System Monitor API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server.close();
  });

  // B-01: 正常返回 200
  describe('B-01: GET /api/system/all returns 200', () => {
    it('should return 200 with JSON content-type', async () => {
      const res = await request(app).get('/api/system/all');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  // B-02: 返回数据结构完整性
  describe('B-02: Response structure completeness', () => {
    it('should contain all required top-level fields', async () => {
      const res = await request(app).get('/api/system/all');
      const requiredFields = [
        'time', 'platform', 'osInfo', 'cpu', 'memory',
        'disk', 'network', 'processes', 'graphics', 'battery', 'temperature'
      ];
      for (const field of requiredFields) {
        expect(res.body).toHaveProperty(field);
      }
    });
  });

  // B-03: platform 字段正确
  describe('B-03: Platform field matches process.platform', () => {
    it('should report the correct platform', async () => {
      const res = await request(app).get('/api/system/all');
      expect(res.body.platform).toBe(process.platform);
      expect(['win32', 'linux', 'darwin']).toContain(res.body.platform);
    });
  });

  // B-04: cpu 字段类型校验
  describe('B-04: CPU field type validation', () => {
    it('should have valid CPU data types', async () => {
      const res = await request(app).get('/api/system/all');
      const { cpu } = res.body;
      expect(cpu.usage).toEqual(expect.any(Number));
      expect(cpu.usage).toBeGreaterThanOrEqual(0);
      expect(cpu.usage).toBeLessThanOrEqual(100);
      expect(cpu.cores).toEqual(expect.any(Number));
      expect(cpu.cores).toBeGreaterThan(0);
      expect(typeof cpu.brand).toBe('string');
      expect(cpu.brand.length).toBeGreaterThan(0);
      expect(typeof cpu.manufacturer).toBe('string');
    });
  });

  // B-05: memory 字段类型校验
  describe('B-05: Memory field type validation', () => {
    it('should have valid memory data types', async () => {
      const res = await request(app).get('/api/system/all');
      const { memory } = res.body;
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.usagePercent).toEqual(expect.any(Number));
      expect(memory.usagePercent).toBeGreaterThanOrEqual(0);
      expect(memory.usagePercent).toBeLessThanOrEqual(100);
      if (memory.used !== null && memory.total !== null) {
        expect(memory.used).toBeLessThanOrEqual(memory.total);
      }
    });
  });

  // B-06: disk 数组非空
  describe('B-06: Disk array non-empty with required fields', () => {
    it('should have at least one disk with required fields', async () => {
      const res = await request(app).get('/api/system/all');
      const { disk } = res.body;
      expect(Array.isArray(disk)).toBe(true);
      expect(disk.length).toBeGreaterThan(0);
      const diskKeys = ['fs', 'size', 'used', 'usagePercent', 'type'];
      for (const d of disk) {
        for (const key of diskKeys) {
          expect(d).toHaveProperty(key);
        }
        expect(d.usagePercent).toEqual(expect.any(Number));
        expect(d.usagePercent).toBeGreaterThanOrEqual(0);
        expect(d.usagePercent).toBeLessThanOrEqual(100);
      }
    });
  });

  // B-07: network 数组过滤虚拟接口
  describe('B-07: Network filters out virtual interfaces', () => {
    it('should not contain loopback or virtual interfaces', async () => {
      const res = await request(app).get('/api/system/all');
      const { network } = res.body;
      expect(Array.isArray(network)).toBe(true);
      const forbidden = ['Loopback', 'loopback', 'lo', 'vEthernet', 'docker', 'br-', 'veth', 'VMware', 'vbox'];
      for (const net of network) {
        for (const keyword of forbidden) {
          expect(net.iface).not.toContain(keyword);
        }
      }
      for (const net of network) {
        expect(net).toHaveProperty('iface');
        expect(net).toHaveProperty('rx_sec');
        expect(net).toHaveProperty('tx_sec');
      }
    });
  });

  // B-08: processes 数组非空且按 CPU 降序
  describe('B-08: Processes sorted by CPU descending', () => {
    it('should return top processes sorted by CPU', async () => {
      const res = await request(app).get('/api/system/all');
      const { processes } = res.body;
      expect(Array.isArray(processes)).toBe(true);
      expect(processes.length).toBeGreaterThan(0);
      expect(processes.length).toBeLessThanOrEqual(10);

      for (let i = 1; i < processes.length; i++) {
        expect(processes[i - 1].cpu).toBeGreaterThanOrEqual(processes[i].cpu);
      }

      for (const p of processes) {
        expect(p).toHaveProperty('pid');
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('cpu');
        expect(p).toHaveProperty('mem');
        expect(p.cpu).toEqual(expect.any(Number));
      }
    });
  });

  // B-09: battery.hasBattery=false 降级
  describe('B-09: Battery fallback when no battery', () => {
    it('should return battery info with hasBattery field', async () => {
      const res = await request(app).get('/api/system/all');
      const { battery } = res.body;
      expect(battery).toHaveProperty('hasBattery');
      expect(typeof battery.hasBattery).toBe('boolean');
      if (!battery.hasBattery) {
        expect(battery.percent === null || battery.percent === 0).toBe(true);
      }
    });
  });

  // B-10: temperature 缺失时降级
  describe('B-10: Temperature graceful fallback', () => {
    it('should return temperature data without throwing errors', async () => {
      const res = await request(app).get('/api/system/all');
      const { temperature } = res.body;
      expect(temperature).toBeDefined();
      expect(temperature).toHaveProperty('main');
      expect(temperature).toHaveProperty('max');
      expect(temperature).toHaveProperty('cores');
      expect(Array.isArray(temperature.cores)).toBe(true);
    });
  });

  // B-11: graphics.controllers 缺失时降级
  describe('B-11: Graphics graceful fallback', () => {
    it('should return graphics data without throwing errors', async () => {
      const res = await request(app).get('/api/system/all');
      const { graphics } = res.body;
      expect(graphics).toBeDefined();
      expect(graphics).toHaveProperty('controllers');
      expect(Array.isArray(graphics.controllers)).toBe(true);
    });
  });

  // B-12: time 为有效时间戳
  describe('B-12: Timestamp validity', () => {
    it('should have a valid recent timestamp', async () => {
      const res = await request(app).get('/api/system/all');
      expect(typeof res.body.time).toBe('number');
      const now = Date.now();
      const diff = Math.abs(now - res.body.time);
      expect(diff).toBeLessThan(5000);
    });
  });

  // B-13: CORS 头正确
  describe('B-13: CORS headers', () => {
    it('should include Access-Control-Allow-Origin header', async () => {
      const res = await request(app).get('/api/system/all');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });

  // B-14: 404 处理
  describe('B-14: 404 handling', () => {
    it('should return 404 with JSON for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('error');
    });
  });

  // B-15: 并发请求稳定性
  describe('B-15: Concurrent request stability', () => {
    it('should handle 10 concurrent requests without errors', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app).get('/api/system/all')
      );
      const results = await Promise.all(requests);
      for (const res of results) {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('time');
      }
    }, 120000);
  });
});
