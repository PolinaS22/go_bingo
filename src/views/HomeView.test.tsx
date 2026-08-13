import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { useBingoStore } from '../store/useBingoStore';
import { mockBingoState } from '../test/mockBingoStore';
import { makeCard } from '../test/fixtures';

vi.mock('../store/useBingoStore');

const mockedUseBingoStore = vi.mocked(useBingoStore);

describe('HomeView', () => {
  it('renders title and empty state message when no cards exist', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(
      <HomeView onCreateNew={vi.fn()} onPlay={vi.fn()} onEdit={vi.fn()} />
    );

    expect(screen.getByText(/My Bingo Cards/i)).toBeInTheDocument();
    expect(screen.getByText(/No bingo cards yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Bingo/i })).toBeInTheDocument();
  });

  it('renders a list of cards when they exist', () => {
    mockedUseBingoStore.mockReturnValue(
      mockBingoState({
        cards: [
          makeCard({ id: '1', title: 'Test Bingo 1' }),
          makeCard({ id: '2', title: 'Test Bingo 2' }),
        ],
      })
    );

    render(
      <HomeView onCreateNew={vi.fn()} onPlay={vi.fn()} onEdit={vi.fn()} />
    );

    expect(screen.getByText('Test Bingo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Bingo 2')).toBeInTheDocument();
  });

  it('selects a card and starts play', () => {
    const setCurrentCard = vi.fn();
    const onPlay = vi.fn();
    mockedUseBingoStore.mockReturnValue(
      mockBingoState({
        cards: [makeCard({ id: '1', title: 'Test Bingo 1' })],
        setCurrentCard,
      })
    );

    render(
      <HomeView onCreateNew={vi.fn()} onPlay={onPlay} onEdit={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Test Bingo 1/i }));
    expect(setCurrentCard).toHaveBeenCalledWith('1');
    expect(onPlay).toHaveBeenCalled();
  });
});
