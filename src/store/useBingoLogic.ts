import { useMemo } from 'react';
import { useBingoStore } from './useBingoStore';
import { checkBingo } from '../core/engine';

export const useBingoLogic = () => {
  const { cards, currentCardId, completeCell } = useBingoStore();

  const currentCard = useMemo(
    () => cards.find((card) => card.id === currentCardId) || null,
    [cards, currentCardId]
  );

  const isBingo = useMemo(() => {
    if (!currentCard) return false;
    const completedPositions = currentCard.cells
      .filter((cell) => cell.isCompleted)
      .map((cell) => cell.position);
    return checkBingo(completedPositions, currentCard.size);
  }, [currentCard]);

  const toggleCell = (cellId: string) => {
    if (currentCardId) {
      completeCell(currentCardId, cellId);
    }
  };

  return {
    currentCard,
    isBingo,
    toggleCell,
  };
};
