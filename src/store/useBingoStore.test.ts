import { describe, it, expect, beforeEach } from 'vitest';
import { useBingoStore } from './useBingoStore';

describe('useBingoStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBingoStore.setState({
      cards: [],
      themes: [],
      currentThemeId: null,
      currentCardId: null,
    });
  });

  it('adds a new card', () => {
    const { addCard } = useBingoStore.getState();
    const newCard = {
      id: '1',
      title: 'Test Bingo',
      size: 3,
      cells: [
        { id: 'c1', text: 'Cell 1', isCompleted: false, position: 0 },
        { id: 'c2', text: 'Cell 2', isCompleted: false, position: 1 },
        { id: 'c3', text: 'Cell 3', isCompleted: false, position: 2 },
        { id: 'c4', text: 'Cell 4', isCompleted: false, position: 3 },
        { id: 'c5', text: 'Cell 5', isCompleted: false, position: 4 },
        { id: 'c6', text: 'Cell 6', isCompleted: false, position: 5 },
        { id: 'c7', text: 'Cell 7', isCompleted: false, position: 6 },
        { id: 'c8', text: 'Cell 8', isCompleted: false, position: 7 },
        { id: 'c9', text: 'Cell 9', isCompleted: false, position: 8 },
      ]
    };

    addCard(newCard);
    
    const state = useBingoStore.getState();
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].id).toBe('1');
    expect(state.currentCardId).toBe('1');
  });

  it('completes a cell', () => {
    const { addCard, completeCell } = useBingoStore.getState();
    const card = {
      id: '1',
      title: 'Test Bingo',
      size: 3,
      cells: [
        { id: 'c1', text: 'Cell 1', isCompleted: false, position: 0 },
        // ... rest don't matter much for this test
      ]
    };
    // Mock the rest of cells
    for(let i=1; i<9; i++) {
        card.cells.push({ id: `c${i+1}`, text: `Cell ${i+1}`, isCompleted: false, position: i });
    }

    addCard(card);
    completeCell('1', 'c1');
    
    const state = useBingoStore.getState();
    expect(state.cards[0].cells[0].isCompleted).toBe(true);
  });

  it('resets a card', () => {
    const { addCard, completeCell, resetCard } = useBingoStore.getState();
    const card = {
      id: '1',
      title: 'Test Bingo',
      size: 3,
      cells: [
        { id: 'c1', text: 'Cell 1', isCompleted: true, position: 0 },
      ]
    };
    for(let i=1; i<9; i++) {
        card.cells.push({ id: `c${i+1}`, text: `Cell ${i+1}`, isCompleted: false, position: i });
    }

    addCard(card);
    resetCard('1');
    
    const state = useBingoStore.getState();
    expect(state.cards[0].cells[0].isCompleted).toBe(false);
  });

  it('updates theme', () => {
    const { updateTheme } = useBingoStore.getState();
    const theme = {
      id: 't1',
      name: 'Dark',
      primaryColor: '#000',
      secondaryColor: '#fff',
      backgroundColor: '#333',
      textColor: '#eee'
    };
    
    updateTheme(theme);
    
    const state = useBingoStore.getState();
    expect(state.themes).toContainEqual(theme);
    expect(state.currentThemeId).toBe('t1');
  });
});
