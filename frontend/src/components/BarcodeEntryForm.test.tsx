import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BarcodeEntryForm from './BarcodeEntryForm';

describe('BarcodeEntryForm', () => {
  it('disables submit when the input is empty or whitespace', async () => {
    const user = userEvent.setup();
    render(<BarcodeEntryForm submitLabel="Go" onSubmit={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText('Barcode'), '   ');
    expect(button).toBeDisabled();
  });

  it('submits the trimmed barcode and clears the input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BarcodeEntryForm submitLabel="Go" onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Barcode');
    await user.type(input, '  12345  ');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('12345');
    expect(input).toHaveValue('');
  });

  it('submits on Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BarcodeEntryForm submitLabel="Go" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Barcode'), '999{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('999');
  });
});
