import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BingoCard, BingoTheme } from '../types/bingo';

interface BingoState {
  cards: BingoCard[];
  themes: BingoTheme[];
  currentCardId: string | null;
  currentThemeId: string | null;
  
  // Actions
  addCard: (card: BingoCard) => void;
  completeCell: (cardId: string, cellId: string) => void;
  resetCard: (cardId: string) => void;
  updateTheme: (theme: BingoTheme) => void;
  setCurrentCard: (cardId: string | null) => void;
  setCurrentTheme: (themeId: string | null) => void;
}

export const useBingoStore = create<BingoState>()(
  persist(
    (set) => ({
      cards: [],
      themes: [],
      currentCardId: null,
      currentThemeId: null,

      addCard: (card) => 
        set((state) => ({
          cards: [...state.cards, card],
          currentCardId: card.id,
        })),

      completeCell: (cardId, cellId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  cells: card.cells.map((cell) =>
                    cell.id === cellId ? { ...cell, isCompleted: true } : cell
                  ),
                }
              : card
          ),
        })),

      resetCard: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  cells: card.cells.map((cell) => ({ ...cell, isCompleted: false })),
                }
              : card
          ),
        })),

      updateTheme: (theme) =>
        set((state) => {
          const themes = state.themes.find((t) => t.id === theme.id)
            ? state.themes.map((t) => (t.id === theme.id ? theme : t))
            : [...state.themes, theme];
          return { themes, currentThemeId: theme.id };
        }),

      setCurrentCard: (cardId) => set({ currentCardId: cardId }),
      setCurrentTheme: (themeId) => set({ currentThemeId: themeId }),
    }),
    {
      name: 'bingo-storage',
    }
  )
);
