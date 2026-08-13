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
  updateCard: (card: BingoCard) => void;
  deleteCard: (cardId: string) => void;
  completeCell: (cardId: string, cellId: string, photoId?: string) => void;
  resetCard: (cardId: string) => void;
  updateTheme: (theme: BingoTheme) => void;
  setCurrentCard: (cardId: string | null) => void;
  setCurrentTheme: (themeId: string | null) => void;
  importBackup: (data: any) => void;
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

      updateCard: (updatedCard) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        })),

      deleteCard: (cardId) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
          currentCardId: state.currentCardId === cardId ? null : state.currentCardId,
        })),

      completeCell: (cardId, cellId, photoId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  cells: card.cells.map((cell) =>
                    cell.id === cellId 
                      ? { ...cell, isCompleted: true, photoId: photoId || cell.photoId } 
                      : cell
                  ),
                  completedAt: 
                    !card.completedAt && 
                    card.cells.filter(c => c.id !== cellId ? c.isCompleted : true).length === card.cells.length
                      ? Date.now()
                      : card.completedAt
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
                  cells: card.cells.map((cell) => ({ ...cell, isCompleted: false, photoId: undefined })),
                  completedAt: undefined
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

      importBackup: (data) => {
        if (data.localStorage) {
          Object.entries(data.localStorage).forEach(([key, value]) => {
            localStorage.setItem(key, value as string);
          });
          // Note: This won't automatically refresh the store state from localStorage
          // because Zustand's persist middleware already initialized.
          // In a real app, we might want to window.location.reload() or manually set state.
          try {
            const parsed = JSON.parse(data.localStorage['bingo-storage']);
            set({
              cards: parsed.state.cards,
              themes: parsed.state.themes,
              currentCardId: parsed.state.currentCardId,
              currentThemeId: parsed.state.currentThemeId,
            });
          } catch (e) {
            console.error('Failed to parse bingo-storage from backup', e);
          }
        }
      }
    }),
    {
      name: 'bingo-storage',
    }
  )
);
