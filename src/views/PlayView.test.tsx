import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayView } from './PlayView';
import { useBingoStore } from '../store/useBingoStore';
import { mockBingoState } from '../test/mockBingoStore';
import { makeCard } from '../test/fixtures';

vi.mock('../store/useBingoStore');
vi.mock('../components/bingo/BingoGrid', () => ({
  BingoGrid: () => <div data-testid="bingo-grid">Bingo Grid</div>,
}));

const mockedUseBingoStore = vi.mocked(useBingoStore);

describe('PlayView', () => {
  it('renders "No card selected" when no card is active', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(<PlayView onMemories={vi.fn()} />);
    expect(screen.getByText(/No bingo card selected/i)).toBeInTheDocument();
  });

  it('renders the grid when a card is selected', () => {
    const card = makeCard({ id: '1', title: 'Test Bingo' });
    mockedUseBingoStore.mockReturnValue(
      mockBingoState({
        currentCardId: '1',
        cards: [card],
      })
    );

    render(<PlayView onMemories={vi.fn()} />);
    expect(screen.getAllByText('Test Bingo').length).toBeGreaterThan(0);
    expect(screen.getByTestId('bingo-grid')).toBeInTheDocument();
  });
});
