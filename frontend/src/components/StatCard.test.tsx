import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the label and numeric value', () => {
    render(<StatCard label="Low Stock" value={7} />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders zero and string values', () => {
    const { rerender } = render(<StatCard label="Out of Stock" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    rerender(<StatCard label="Out of Stock" value="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
