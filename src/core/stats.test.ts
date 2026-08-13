import { describe, expect, it } from 'vitest';
import { makeCard, makeCell } from '../test/fixtures';
import { getCardStats } from './stats';

describe('card stats', () => {
  it('derives progress from cells', () => {
    const card = makeCard({
      size: 2,
      cells: [
        makeCell({ position: 0, completedAt: 1, photoId: 'p1', difficulty: 'GOLDEN' }),
        makeCell({ position: 1, completedAt: 2 }),
        makeCell({ position: 2 }),
        makeCell({ position: 3 }),
      ],
    });

    expect(getCardStats(card)).toEqual({
      completedCount: 2,
      playableCount: 4,
      lineCount: 1,
      goldenCount: 1,
      photoCount: 1,
    });
  });
});
