import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';

import { BingoCardSheet } from '../components/bingo/BingoCardSheet';
import { BingoCelebration } from '../components/bingo/BingoCelebration';
import { CompletionModal } from '../components/bingo/CompletionModal';
import { useBingoLogic } from '../store/useBingoLogic';
import { useBingoStore } from '../store/useBingoStore';

import { isCellCompleted, isEmptyCell } from '../core/defaults';
import {
  ensureAssignedRewards,
  rewardForBingoLine,
  rewardForFullCard,
} from '../core/rewards';
import { Reward } from '../types/bingo';

import styles from './PlayView.module.scss';

interface PlayViewProps {
  onMemories: () => void;
}

type PlayPopup =
  | { kind: 'line'; reward?: Reward }
  | { kind: 'full'; reward?: Reward };

export const PlayView = ({ onMemories }: PlayViewProps) => {
  const { completeCell, updateCard } = useBingoStore();
  const { currentCard, completedLineCount, completedLines, stats } = useBingoLogic();

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [queue, setQueue] = useState<PlayPopup[]>([]);

  const prevLineCount = useRef(completedLineCount);
  const activePopup = queue[0] ?? null;

  useEffect(() => {
    if (!currentCard || completedLineCount <= prevLineCount.current) {
      prevLineCount.current = completedLineCount;
      return;
    }

    const previous = prevLineCount.current;
    const isFullCard = currentCard.completedAt !== undefined;
    const withAssigned = ensureAssignedRewards(currentCard.rewards);

    if (withAssigned !== currentCard.rewards && withAssigned.assigned) {
      updateCard({
        ...currentCard,
        rewards: withAssigned,
        updatedAt: Date.now(),
      });
    }

    const popups: PlayPopup[] = [];

    for (let lineIndex = previous; lineIndex < completedLineCount; lineIndex += 1) {
      const reward = rewardForBingoLine(withAssigned, lineIndex);
      const isLastNewLine = lineIndex === completedLineCount - 1;

      if (isFullCard && isLastNewLine) {
        const cardReward = rewardForFullCard(withAssigned);
        popups.push({
          kind: 'full',
          reward: cardReward ?? reward,
        });
      } else {
        popups.push({ kind: 'line', reward });
      }
    }

    setQueue((prev) => [...prev, ...popups]);
    prevLineCount.current = completedLineCount;
  }, [completedLineCount, currentCard, updateCard]);

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <p>No bingo card selected. Go back to home to pick one.</p>
      </div>
    );
  }

  const selectedCell = currentCard.cells.find((cell) => cell.id === selectedCellId);
  const firstOpenCell = currentCard.cells.find(
    (cell) => !isEmptyCell(cell) && !isCellCompleted(cell.completedAt)
  );

  const advanceQueue = () => {
    setQueue((prev) => prev.slice(1));
  };

  const handleComplete = (photoId?: string) => {
    if (!selectedCellId) {
      return;
    }

    const cell = currentCard.cells.find((item) => item.id === selectedCellId);
    if (!cell || isCellCompleted(cell.completedAt) || isEmptyCell(cell)) {
      setSelectedCellId(null);
      return;
    }

    completeCell(currentCard.id, selectedCellId, photoId);
    setSelectedCellId(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{currentCard.title}</h1>
      </header>

      <main className={styles.main}>
        <BingoCardSheet
          card={currentCard}
          completedLines={completedLines}
          selectedCellId={selectedCellId}
          onCellClick={(cellId) => {
            const cell = currentCard.cells.find((item) => item.id === cellId);
            if (!cell || isEmptyCell(cell)) {
              return;
            }
            setSelectedCellId(cellId);
          }}
          variant="play"
        />
      </main>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            if (firstOpenCell) {
              setSelectedCellId(firstOpenCell.id);
            }
          }}
          disabled={!firstOpenCell}
        >
          <Sparkles size={16} />
          Complete a Challenge
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onMemories}>
          <Camera size={16} />
          Memories
        </button>
      </div>

      <AnimatePresence>
        {selectedCell && !isEmptyCell(selectedCell) && (
          <CompletionModal
            cell={selectedCell}
            onClose={() => setSelectedCellId(null)}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      <BingoCelebration
        show={activePopup !== null}
        variant={activePopup?.kind ?? 'line'}
        reward={activePopup?.reward}
        stats={stats ?? undefined}
        onClose={advanceQueue}
      />
    </div>
  );
};
