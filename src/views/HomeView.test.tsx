import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { useBingoStore } from '../store/useBingoStore';

vi.mock('../store/useBingoStore');

describe('HomeView', () => {
  it('renders title and empty state message when no cards exist', () => {
    (useBingoStore as any).mockReturnValue({
      cards: [],
      setCurrentCard: vi.fn(),
    });

    render(<HomeView />);
    
    expect(screen.getByText(/My Bingo Cards/i)).toBeInTheDocument();
    expect(screen.getByText(/No bingo cards yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Bingo/i })).toBeInTheDocument();
  });

  it('renders a list of cards when they exist', () => {
    const mockCards = [
      { id: '1', title: 'Test Bingo 1', createdAt: Date.now() },
      { id: '2', title: 'Test Bingo 2', createdAt: Date.now() },
    ];
    (useBingoStore as any).mockReturnValue({
      cards: mockCards,
      setCurrentCard: vi.fn(),
    });

    render(<HomeView />);

    expect(screen.getByText('Test Bingo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Bingo 2')).toBeInTheDocument();
  });
});
