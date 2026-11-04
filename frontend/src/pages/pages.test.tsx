import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import NotFoundPage from './NotFoundPage';
import ScanInPage from './ScanInPage';
import ScanOutPage from './ScanOutPage';

const fetchMock = vi.fn();

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('DashboardPage', () => {
  it('shows the three stat cards', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    for (const label of ['Total Inventory', 'Low Stock', 'Out of Stock']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe('NotFoundPage', () => {
  it('shows a heading and a link back to the dashboard', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/');
  });
});

describe.each([
  ['Scan In', ScanInPage, '/scan-in'],
  ['Scan Out', ScanOutPage, '/scan-out'],
])('%s page', (name, Page, endpoint) => {
  it('posts the barcode to its endpoint', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ barcode: '123' }), { status: 200 }));
    const user = userEvent.setup();
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Barcode'), '123');
    await user.click(screen.getByRole('button', { name }));
    expect(await screen.findByRole('status')).toHaveTextContent('Submitted 123.');
    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`${endpoint}$`));
  });
});
