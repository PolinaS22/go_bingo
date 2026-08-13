import { useMemo } from 'react';
import { useBingoStore } from './useBingoStore';
import { isCellCompleted } from '../core/defaults';
import { checkBingo, getBingoLines, getCompletedLines } from '../core/engine';
import { getCardStats } from '../core/stats';

export const useBingoLogic = () => {
  const { cards, currentCardId } = useBingoStore();

  const currentCard = useMemo(
    () => cards.find((card) => card.id === currentCardId) ?? null,
    [cards, currentCardId]
  );

  const completedPositions = useMemo(() => {
    if (!currentCard) {
      return [];
    }

    return currentCard.cells
      .filter((cell) => isCellCompleted(cell.completedAt))
      .map((cell) => cell.position);
  }, [currentCard]);

  const isBingo = useMemo(() => {
    if (!currentCard) {
      return false;
    }
    return checkBingo(completedPositions, currentCard.size);
  }, [currentCard, completedPositions]);

  const completedLineCount = useMemo(() => {
    if (!currentCard) {
      return 0;
    }
    return getBingoLines(completedPositions, currentCard.size);
  }, [currentCard, completedPositions]);

  const completedLines = useMemo(() => {
    if (!currentCard) {
      return [];
    }
    return getCompletedLines(completedPositions, currentCard.size);
  }, [currentCard, completedPositions]);

  const stats = useMemo(
    () => (currentCard ? getCardStats(currentCard) : null),
    [currentCard]
  );

  return {
    currentCard,
    isBingo,
    completedLineCount,
    completedLines,
    stats,
  };
};
