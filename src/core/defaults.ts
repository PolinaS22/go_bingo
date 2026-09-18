import { BingoCell, BingoTheme, Difficulty, GridSize } from '../types/bingo';

export const GRID_SIZES: readonly GridSize[] = [2, 3, 4, 5];

export const DEFAULT_THEME: BingoTheme = {
  id: 'default',
  primaryColor: '#c45c58',
  secondaryColor: '#e8b86d',
  backgroundColor: '#f7f1e8',
  textColor: '#3d2914',
  borderRadius: 8,
  cellStyle: 'solid',
  globalBackground: { type: 'color', value: '#f7f1e8' },
};

export function isGridSize(value: number): value is GridSize {
  return value === 2 || value === 3 || value === 4 || value === 5;
}

export const CHALLENGE_TITLE_MAX = 40;
export const CHALLENGE_DESCRIPTION_MAX = 120;
export const REWARD_TITLE_MAX = 40;

export function createCell(position: number): BingoCell {
  return {
    id: crypto.randomUUID(),
    title: '',
    difficulty: 'NORMAL',
    position,
    photoRequired: false,
  };
}

export function isEmptyCell(cell: BingoCell): boolean {
  return cell.title.trim().length === 0;
}

export function countChallenges(cells: readonly BingoCell[]): number {
  return cells.filter((cell) => !isEmptyCell(cell)).length;
}

export function createCells(size: GridSize): BingoCell[] {
  return Array.from({ length: size * size }, (_, position) => createCell(position));
}

export function resizeCells(cells: BingoCell[], size: GridSize): BingoCell[] {
  const nextCount = size * size;
  const kept = cells.slice(0, nextCount).map((cell, position) => ({
    ...cell,
    position,
  }));

  if (kept.length >= nextCount) {
    return kept;
  }

  const extra = Array.from({ length: nextCount - kept.length }, (_, offset) =>
    createCell(kept.length + offset)
  );

  return [...kept, ...extra];
}

export function isCellCompleted(completedAt: number | undefined): boolean {
  return completedAt !== undefined;
}

export function hasCardProgress(cells: BingoCell[]): boolean {
  return cells.some((cell) => isCellCompleted(cell.completedAt));
}

export function isPhotoRequired(difficulty: Difficulty, photoRequired: boolean): boolean {
  return difficulty === 'GOLDEN' || photoRequired;
}

export function isPhotoRecommended(difficulty: Difficulty, photoRequired: boolean): boolean {
  return difficulty === 'HARD' && !isPhotoRequired(difficulty, photoRequired);
}
