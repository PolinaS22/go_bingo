import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isCellCompleted } from '../core/defaults';
import { normalizePersistedState } from '../core/normalize';
import { BackupPayload, BINGO_STORAGE_KEY, BingoCard, PersistedBingoState } from '../types/bingo';

export interface BingoState extends PersistedBingoState {
  addCard: (card: BingoCard) => void;
  updateCard: (card: BingoCard) => void;
  deleteCard: (cardId: string) => void;
  completeCell: (cardId: string, cellId: string, photoId?: string) => void;
  resetCard: (cardId: string) => void;
  setCurrentCard: (cardId: string | null) => void;
  importBackup: (payload: BackupPayload) => void;
}

export const useBingoStore = create<BingoState>()(
  persist(
    (set) => ({
      cards: [],
      currentCardId: null,

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
          cards: state.cards.map((card) => {
            if (card.id !== cardId) {
              return card;
            }

            const now = Date.now();
            const cells = card.cells.map((cell) => {
              if (cell.id !== cellId || isCellCompleted(cell.completedAt)) {
                return cell;
              }

              return {
                ...cell,
                completedAt: now,
                photoId: photoId ?? cell.photoId,
              };
            });

            const allCompleted = cells.every((cell) => isCellCompleted(cell.completedAt));

            return {
              ...card,
              cells,
              isFrozen: true,
              completedAt: allCompleted ? (card.completedAt ?? now) : card.completedAt,
              updatedAt: now,
            };
          }),
        })),

          resetCard: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  cells: card.cells.map((cell) => ({
                    ...cell,
                    completedAt: undefined,
                    photoId: undefined,
                  })),
                  completedAt: undefined,
                  isFrozen: false,
                  rewards: {
                    mode: card.rewards.mode,
                    slots: card.rewards.slots,
                  },
                  updatedAt: Date.now(),
                }
              : card
          ),
        })),

      setCurrentCard: (cardId) => set({ currentCardId: cardId }),

      importBackup: (payload) =>
        set({
          cards: payload.state.cards,
          currentCardId: payload.state.currentCardId,
        }),
    }),
    {
      name: BINGO_STORAGE_KEY,
      version: 1,
      partialize: (state): PersistedBingoState => ({
        cards: state.cards,
        currentCardId: state.currentCardId,
      }),
      migrate: (persistedState) => normalizePersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState),
      }),
    }
  )
);
