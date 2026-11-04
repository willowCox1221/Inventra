import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ScanPageContent from './ScanPageContent';

function setup(onScan: (b: string) => Promise<unknown>) {
  render(
    <ScanPageContent title="Scan In" description="Desc" submitLabel="Submit" onScan={onScan} />,
  );
  return userEvent.setup();
}

describe('ScanPageContent', () => {
  it('renders title and description', () => {
    setup(vi.fn());
    expect(screen.getByRole('heading', { level: 1, name: 'Scan In' })).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('calls onScan and shows a success message', async () => {
    const onScan = vi.fn().mockResolvedValue({});
    const user = setup(onScan);
    await user.type(screen.getByLabelText('Barcode'), '4006381333931');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onScan).toHaveBeenCalledWith('4006381333931');
    expect(await screen.findByRole('status')).toHaveTextContent('Submitted 4006381333931.');
  });

  it('shows an error message when onScan rejects', async () => {
    const onScan = vi.fn().mockRejectedValue(new Error('boom'));
    const user = setup(onScan);
    await user.type(screen.getByLabelText('Barcode'), '123');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Could not submit 123.');
  });
});
