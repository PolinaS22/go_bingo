import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditorView } from './EditorView';
import { useBingoStore } from '../store/useBingoStore';
import { mockBingoState } from '../test/mockBingoStore';

vi.mock('../store/useBingoStore');

const mockedUseBingoStore = vi.mocked(useBingoStore);

describe('EditorView', () => {
  it('renders title and form fields', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(<EditorView onSave={vi.fn()} cardId={null} />);

    expect(screen.getByText(/Create New Bingo Card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Grid Size/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2x2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4x4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fill Rewards/i })).toBeInTheDocument();
  });

  it('updates title when typing', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(<EditorView onSave={vi.fn()} cardId={null} />);
    const titleInput = screen.getByLabelText(/^Title$/i);
    fireEvent.change(titleInput, { target: { value: 'My Awesome Bingo' } });
    expect(titleInput).toHaveValue('My Awesome Bingo');
  });

  it('does not save without a title', () => {
    const addCard = vi.fn();
    mockedUseBingoStore.mockReturnValue(mockBingoState({ addCard }));

    render(<EditorView onSave={vi.fn()} cardId={null} />);
    fireEvent.click(screen.getByRole('button', { name: /Save Bingo Card/i }));
    expect(addCard).not.toHaveBeenCalled();
  });

  it('switches to a 2x2 grid', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(<EditorView onSave={vi.fn()} cardId={null} />);
    fireEvent.click(screen.getByRole('button', { name: '2x2' }));

    expect(screen.getAllByText(/^Cell \d+$/)).toHaveLength(4);
  });

  it('opens cell settings when a cell is selected', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());

    render(<EditorView onSave={vi.fn()} cardId={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cell 1, NORMAL' }));

    expect(screen.getByRole('dialog', { name: /Edit Cell/i })).toBeInTheDocument();
    expect(screen.getByText('Challenge')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
  });
});
