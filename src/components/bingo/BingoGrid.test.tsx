import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BingoGrid } from './BingoGrid';

describe('BingoGrid', () => {
  const mockCells = Array.from({ length: 9 }, (_, i) => ({
    id: `${i}`,
    text: `Cell ${i}`,
    isCompleted: false,
    position: i,
  }));

  const mockCard = {
    id: 'card-1',
    title: 'Test Card',
    cells: mockCells,
    size: 3,
    difficulty: 'easy' as const,
    theme: {
      id: 'default',
      name: 'Default',
      primaryColor: '#000',
      secondaryColor: '#fff',
      backgroundColor: '#eee',
      textColor: '#000',
    },
    createdAt: Date.now(),
  };

  it('renders all cells', () => {
    render(<BingoGrid card={mockCard} onCellClick={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('renders card title', () => {
    render(<BingoGrid card={mockCard} onCellClick={() => {}} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });
});
