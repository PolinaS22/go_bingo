import { useMemo } from 'react';
import { useBingoStore } from './useBingoStore';
import { checkBingo, getBingoLines } from '../core/engine';

export const useBingoLogic = () => {
  const { cards, currentCardId, completeCell } = useBingoStore();

  const currentCard = useMemo(
    () => cards.find((card) => card.id === currentCardId) || null,
    [cards, currentCardId]
  );

  const completedPositions = useMemo(() => {
    if (!currentCard) return [];
    return currentCard.cells
      .filter((cell) => cell.isCompleted)
      .map((cell) => cell.position)
      .filter((pos): pos is number => pos !== undefined);
  }, [currentCard]);

  const isBingo = useMemo(() => {
    if (!currentCard) return false;
    return checkBingo(completedPositions, currentCard.size);
  }, [currentCard, completedPositions]);

  const completedLineCount = useMemo(() => {
    if (!currentCard) return 0;
    return getBingoLines(completedPositions, currentCard.size);
  }, [currentCard, completedPositions]);

  const toggleCell = (cellId: string) => {
    if (currentCardId) {
      completeCell(currentCardId, cellId);
    }
  };

  return {
    currentCard,
    isBingo,
    completedLineCount,
    toggleCell,
  };
};
