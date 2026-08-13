import { BingoCard } from '../types/bingo';
import { isCellCompleted } from './defaults';
import { getBingoLines } from './engine';

export interface CardStats {
  completedCount: number;
  playableCount: number;
  lineCount: number;
  goldenCount: number;
  photoCount: number;
}

export function getCardStats(card: BingoCard): CardStats {
  const playable = card.cells;
  const completed = playable.filter((cell) => isCellCompleted(cell.completedAt));

  return {
    completedCount: completed.length,
    playableCount: playable.length,
    lineCount: getBingoLines(
      completed.map((cell) => cell.position),
      card.size
    ),
    goldenCount: completed.filter((cell) => cell.difficulty === 'GOLDEN').length,
    photoCount: completed.filter((cell) => cell.photoId !== undefined).length,
  };
}
