import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayView } from './PlayView';
import { useBingoStore } from '../store/useBingoStore';

vi.mock('../store/useBingoStore');
vi.mock('../components/bingo/BingoGrid', () => ({
  BingoGrid: () => <div data-testid="bingo-grid">Bingo Grid</div>
}));

describe('PlayView', () => {
  it('renders "No card selected" when no card is active', () => {
    (useBingoStore as any).mockReturnValue({
      currentCardId: null,
      cards: [],
    });

    render(<PlayView />);
    expect(screen.getByText(/No bingo card selected/i)).toBeInTheDocument();
  });

  it('renders the grid when a card is selected', () => {
    const mockCard = { id: '1', title: 'Test Bingo', cells: [] };
    (useBingoStore as any).mockReturnValue({
      currentCardId: '1',
      cards: [mockCard],
    });

    render(<PlayView />);
    expect(screen.getByText('Test Bingo')).toBeInTheDocument();
    expect(screen.getByTestId('bingo-grid')).toBeInTheDocument();
  });
});
