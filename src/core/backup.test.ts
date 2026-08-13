import { describe, expect, it } from 'vitest';
import { parseBackup } from './backup';
import { normalizeCard } from './normalize';

describe('normalizeCard', () => {
  it('migrates legacy text and isCompleted fields', () => {
    const card = normalizeCard({
      id: 'legacy',
      title: 'Old card',
      size: 3,
      isFrozen: false,
      createdAt: 1,
      updatedAt: 1,
      cells: [
        { id: 'a', text: 'Walk', isCompleted: true, difficulty: 'HARD' },
      ],
    });

    expect(card).not.toBeNull();
    expect(card?.cells).toHaveLength(9);
    expect(card?.cells[0]?.title).toBe('Walk');
    expect(card?.cells[0]?.completedAt).toEqual(expect.any(Number));
    expect(card?.cells[0]?.position).toBe(0);
    expect(card?.isFrozen).toBe(true);
  });
});

describe('parseBackup', () => {
  it('accepts the typed backup payload', () => {
    const backup = parseBackup({
      version: 1,
      timestamp: '2026-08-13T00:00:00.000Z',
      state: {
        cards: [],
        currentCardId: null,
      },
      photos: {},
    });

    expect(backup?.version).toBe(1);
    expect(backup?.state.cards).toEqual([]);
  });

  it('accepts a legacy localStorage dump', () => {
    const backup = parseBackup({
      localStorage: {
        'bingo-storage': JSON.stringify({
          state: {
            cards: [{ id: '1', title: 'Imported', size: 3, cells: [] }],
            currentCardId: '1',
          },
        }),
      },
      photos: {},
    });

    expect(backup?.state.cards[0]?.title).toBe('Imported');
    expect(backup?.state.currentCardId).toBe('1');
  });

  it('rejects non-objects', () => {
    expect(parseBackup(null)).toBeNull();
    expect(parseBackup('nope')).toBeNull();
  });
});
