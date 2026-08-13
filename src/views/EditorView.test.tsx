import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditorView } from './EditorView';
import { useBingoStore } from '../store/useBingoStore';

vi.mock('../store/useBingoStore');

describe('EditorView', () => {
  it('renders title and form fields', () => {
    (useBingoStore as any).mockReturnValue({
      addCard: vi.fn(),
      setCurrentCard: vi.fn(),
    });

    render(<EditorView onSave={vi.fn()} />);
    
    expect(screen.getByText(/Create New Bingo Card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
  });

  it('updates title when typing', () => {
    (useBingoStore as any).mockReturnValue({
      addCard: vi.fn(),
      setCurrentCard: vi.fn(),
    });

    render(<EditorView onSave={vi.fn()} />);
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'My Awesome Bingo' } });
    expect(titleInput.value).toBe('My Awesome Bingo');
  });
});
