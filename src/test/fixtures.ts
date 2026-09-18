import { BingoCard, BingoCell, GridSize } from '../types/bingo';
import { DEFAULT_THEME } from '../core/defaults';
import { createDefaultRewards } from '../core/rewards';

export function makeCell(overrides: Partial<BingoCell> = {}): BingoCell {
  const position = overrides.position ?? 0;
  return {
    id: `cell-${position}`,
    title: `Cell ${position + 1}`,
    difficulty: 'NORMAL',
    photoRequired: false,
    position,
    ...overrides,
  };
}

export function makeCard(overrides: Partial<BingoCard> = {}): BingoCard {
  const size: GridSize = overrides.size ?? 3;
  const cells =
    overrides.cells ??
    Array.from({ length: size * size }, (_, position) => makeCell({ position }));

  return {
    id: 'card-1',
    title: 'Test Bingo',
    size,
    cells,
    theme: DEFAULT_THEME,
    rewards: createDefaultRewards('card'),
    isFrozen: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}
