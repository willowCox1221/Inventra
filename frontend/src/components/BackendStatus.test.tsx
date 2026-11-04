import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BackendStatus from './BackendStatus';

const fetchMock = vi.fn();

function health(mongo: string) {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: '2026-01-01T00:00:00Z', mongo, mongoDetail: null }),
    { status: 200 },
  );
}

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('BackendStatus', () => {
  it('shows a checking state first', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<BackendStatus />);
    expect(screen.getByRole('status')).toHaveTextContent('Checking backend');
  });

  it.each([
    ['ok', 'database ok'],
    ['not_configured', 'database not configured'],
    ['unreachable', 'database unreachable'],
  ])('shows connected with database state %s', async (mongo, expected) => {
    fetchMock.mockResolvedValue(health(mongo));
    render(<BackendStatus />);
    const status = await screen.findByText(/Backend connected/);
    expect(status).toHaveTextContent(expected);
    expect(screen.getByRole('status')).toBe(status.closest('[role="status"]'));
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/health$/);
  });

  it('shows offline when the request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<BackendStatus />);
    expect(await screen.findByText('Backend offline')).toBeInTheDocument();
  });

  it('shows offline on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
    render(<BackendStatus />);
    expect(await screen.findByText('Backend offline')).toBeInTheDocument();
  });
});
