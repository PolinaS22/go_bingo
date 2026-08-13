import { describe, it, expect } from 'vitest';
import { checkBingo } from './engine';

describe('checkBingo', () => {
  it('detects a row completion', () => {
    const size = 3;
    const completedPositions = [0, 1, 2];
    expect(checkBingo(completedPositions, size)).toBe(true);
  });

  it('detects a column completion', () => {
    const size = 3;
    const completedPositions = [0, 3, 6];
    expect(checkBingo(completedPositions, size)).toBe(true);
  });

  it('detects a main diagonal completion', () => {
    const size = 3;
    const completedPositions = [0, 4, 8];
    expect(checkBingo(completedPositions, size)).toBe(true);
  });

  it('detects an anti-diagonal completion', () => {
    const size = 3;
    const completedPositions = [2, 4, 6];
    expect(checkBingo(completedPositions, size)).toBe(true);
  });

  it('returns false if no line is completed', () => {
    const size = 3;
    const completedPositions = [0, 1, 4];
    expect(checkBingo(completedPositions, size)).toBe(false);
  });

  it('works for 5x5 grid', () => {
    const size = 5;
    const rowPositions = [5, 6, 7, 8, 9];
    expect(checkBingo(rowPositions, size)).toBe(true);
    
    const colPositions = [1, 6, 11, 16, 21];
    expect(checkBingo(colPositions, size)).toBe(true);
  });
});
