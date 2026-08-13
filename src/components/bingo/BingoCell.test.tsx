import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BingoCell } from './BingoCell';

describe('BingoCell', () => {
  const mockCell = {
    id: '1',
    text: 'Test Cell',
    isCompleted: false,
    position: 0,
  };

  it('renders cell text', () => {
    render(<BingoCell cell={mockCell} onClick={() => {}} />);
    expect(screen.getByText('Test Cell')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BingoCell cell={mockCell} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('displays completed state', () => {
    const completedCell = { ...mockCell, isCompleted: true };
    render(<BingoCell cell={completedCell} onClick={() => {}} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(/completed/i);
  });
});
