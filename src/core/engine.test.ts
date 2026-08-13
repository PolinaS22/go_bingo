import { describe, expect, it } from 'vitest';
import { checkBingo, getBingoLines, getCompletedLines } from './engine';

describe('bingo engine', () => {
  it('detects a completed row', () => {
    expect(checkBingo([0, 1, 2], 3)).toBe(true);
    expect(getBingoLines([0, 1, 2], 3)).toBe(1);
  });

  it('detects a completed column', () => {
    expect(checkBingo([0, 3, 6], 3)).toBe(true);
  });

  it('detects both diagonals', () => {
    expect(checkBingo([0, 4, 8], 3)).toBe(true);
    expect(checkBingo([2, 4, 6], 3)).toBe(true);
  });

  it('returns no bingo for a partial grid', () => {
    expect(checkBingo([0, 1, 4], 3)).toBe(false);
    expect(getBingoLines([0, 1, 4], 3)).toBe(0);
  });

  it('counts multiple completed lines', () => {
    expect(getBingoLines([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toBe(8);
  });

  it('detects bingo on a 2x2 grid', () => {
    expect(checkBingo([0, 1], 2)).toBe(true);
    expect(checkBingo([0, 2], 2)).toBe(true);
    expect(checkBingo([0, 3], 2)).toBe(true);
    expect(getBingoLines([0, 1, 2, 3], 2)).toBe(6);
  });

  it('returns completed line kinds', () => {
    const lines = getCompletedLines([0, 1, 2], 3);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.kind).toBe('row');
    expect(lines[0]?.index).toBe(0);
    expect(lines[0]?.id).toBe('row-0');
  });

  it('does not count the same line twice', () => {
    const first = getCompletedLines([0, 1, 2], 3).map((line) => line.id);
    const again = getCompletedLines([0, 1, 2], 3).map((line) => line.id);
    expect(first).toEqual(again);
    expect(new Set(first).size).toBe(first.length);
  });
});
