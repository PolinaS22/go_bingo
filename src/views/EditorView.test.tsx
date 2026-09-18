import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorView } from './EditorView';
import { useBingoStore } from '../store/useBingoStore';
import { mockBingoState } from '../test/mockBingoStore';

vi.mock('../store/useBingoStore');

const mockedUseBingoStore = vi.mocked(useBingoStore);

function renderEditor() {
  const onSave = vi.fn();
  const onBack = vi.fn();
  render(<EditorView onSave={onSave} onBack={onBack} cardId={null} />);
  return { onSave, onBack };
}

function goToBingoStep(title = 'My Awesome Bingo') {
  fireEvent.change(screen.getByLabelText(/^Title$/i), { target: { value: title } });
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
}

describe('EditorView', () => {
  it('renders the appearance step for a new card', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();

    expect(screen.getByRole('heading', { name: /Create New Bingo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title$/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Cover presets/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Color theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
    expect(screen.queryByRole('group', { name: /Grid Size/i })).not.toBeInTheDocument();
  });

  it('updates the title and live card preview', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();

    const titleInput = screen.getByLabelText(/^Title$/i);
    fireEvent.change(titleInput, { target: { value: 'My Awesome Bingo' } });

    expect(titleInput).toHaveValue('My Awesome Bingo');
    expect(screen.getByText('My Awesome Bingo')).toBeInTheDocument();
  });

  it('does not continue without a title', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: /Bingo/i }));
    expect(screen.queryByRole('group', { name: /Grid Size/i })).not.toBeInTheDocument();
  });

  it('opens the bingo step after a title is set', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();
    goToBingoStep();

    expect(screen.getByRole('group', { name: /Grid Size/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Rewards$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Card reward$/i)).toBeInTheDocument();
  });

  it('does not save without a title', () => {
    const addCard = vi.fn();
    mockedUseBingoStore.mockReturnValue(mockBingoState({ addCard }));
    renderEditor();

    expect(screen.queryByRole('button', { name: /Save Bingo Card/i })).not.toBeInTheDocument();
    expect(addCard).not.toHaveBeenCalled();
  });

  it('switches to a 2x2 grid', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();
    goToBingoStep();
    fireEvent.click(screen.getByRole('button', { name: '2x2' }));

    expect(screen.getAllByRole('button', { name: 'Add challenge' })).toHaveLength(4);
  });

  it('opens cell settings when a cell is selected', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();
    goToBingoStep();
    const addChallenge = screen.getAllByRole('button', { name: 'Add challenge' })[0];
    expect(addChallenge).toBeTruthy();
    fireEvent.click(addChallenge);

    expect(screen.getByRole('dialog', { name: /Cell details/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Challenge title/i)).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
  });

  it('selects a cover preset', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    renderEditor();

    const flowers = screen.getByRole('button', { name: 'Flowers' });
    fireEvent.click(flowers);
    expect(flowers).toHaveAttribute('aria-pressed', 'true');
  });

  it('goes home from the appearance step', () => {
    mockedUseBingoStore.mockReturnValue(mockBingoState());
    const { onBack } = renderEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
