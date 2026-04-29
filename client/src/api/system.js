const API_BASE = 'http://localhost:3001';

export async function fetchSystemData() {
  try {
    const res = await fetch(`${API_BASE}/api/system/all`);
    if (!res.ok) {
      console.warn(`System API returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch system data:', err.message);
    return null;
  }
}
