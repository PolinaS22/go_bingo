import { vi } from 'vitest';
import { BingoState } from '../store/useBingoStore';

export function mockBingoState(overrides: Partial<BingoState> = {}): BingoState {
  return {
    cards: [],
    currentCardId: null,
    addCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    completeCell: vi.fn(),
    resetCard: vi.fn(),
    setCurrentCard: vi.fn(),
    importBackup: vi.fn(),
    ...overrides,
  };
}
