import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getDashboardStats, getHealth, scanIn, scanOut } from './client';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('api client', () => {
  it('getDashboardStats requests /dashboard/stats and returns parsed JSON', async () => {
    const stats = { totalInventory: 5, lowStock: 1, outOfStock: 0 };
    fetchMock.mockResolvedValue(jsonResponse(stats));
    await expect(getDashboardStats()).resolves.toEqual(stats);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/dashboard\/stats$/);
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('getHealth requests /health and returns parsed JSON', async () => {
    const health = { status: 'ok', timestamp: '2026-01-01T00:00:00Z', mongo: 'ok', mongoDetail: null };
    fetchMock.mockResolvedValue(jsonResponse(health));
    await expect(getHealth()).resolves.toEqual(health);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/health$/);
  });

  it.each([
    ['scanIn', scanIn, '/scan-in'],
    ['scanOut', scanOut, '/scan-out'],
  ])('%s POSTs the barcode as JSON to %s', async (_name, fn, path) => {
    fetchMock.mockResolvedValue(jsonResponse({ barcode: 'abc' }));
    await fn('abc');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.endsWith(path)).toBe(true);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ barcode: 'abc' });
  });

  it('throws ApiError with the status on non-2xx responses', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 404, statusText: 'Not Found' }));
    const err = await scanIn('x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
    expect(err.message).toContain('404');
  });
});
