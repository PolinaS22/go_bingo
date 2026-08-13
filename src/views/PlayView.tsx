import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { BingoCardSheet } from '../components/bingo/BingoCardSheet';
import { BingoCelebration } from '../components/bingo/BingoCelebration';
import { CompletionModal } from '../components/bingo/CompletionModal';
import { RewardPopup } from '../components/bingo/RewardPopup';
import { isCellCompleted } from '../core/defaults';
import { createRandomReward } from '../core/rewards';
import { useBingoLogic } from '../store/useBingoLogic';
import { useBingoStore } from '../store/useBingoStore';
import { Reward } from '../types/bingo';
import styles from './PlayView.module.scss';

interface PlayViewProps {
  onMemories: () => void;
}

type PlayPopup =
  | { kind: 'golden' }
  | { kind: 'reward'; reward: Reward }
  | { kind: 'line' }
  | { kind: 'full' };

export const PlayView = ({ onMemories }: PlayViewProps) => {
  const { completeCell } = useBingoStore();
  const { currentCard, completedLineCount, completedLines, stats } = useBingoLogic();

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [queue, setQueue] = useState<PlayPopup[]>([]);

  const prevLineCount = useRef(completedLineCount);
  const activePopup = queue[0] ?? null;

  useEffect(() => {
    if (completedLineCount > prevLineCount.current) {
      const isFullCard = currentCard?.completedAt !== undefined;
      setQueue((prev) => [
        ...prev,
        isFullCard ? { kind: 'full' } : { kind: 'line' },
      ]);
    }
    prevLineCount.current = completedLineCount;
  }, [completedLineCount, currentCard?.completedAt]);

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <p>No bingo card selected. Go back to home to pick one.</p>
      </div>
    );
  }

  const selectedCell = currentCard.cells.find((cell) => cell.id === selectedCellId);
  const firstOpenCell = currentCard.cells.find((cell) => !isCellCompleted(cell.completedAt));

  const advanceQueue = () => {
    setQueue((prev) => prev.slice(1));
  };

  const handleComplete = (photoId?: string) => {
    if (!selectedCellId) {
      return;
    }

    const cell = currentCard.cells.find((item) => item.id === selectedCellId);
    if (!cell || isCellCompleted(cell.completedAt)) {
      setSelectedCellId(null);
      return;
    }

    const reward = cell.reward ?? createRandomReward();
    completeCell(currentCard.id, selectedCellId, photoId, reward);
    setSelectedCellId(null);

    const next: PlayPopup[] = [];
    if (cell.difficulty === 'GOLDEN') {
      next.push({ kind: 'golden' });
    }
    next.push({ kind: 'reward', reward });
    setQueue((prev) => [...prev, ...next]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.visuallyHidden}>{currentCard.title}</h1>
      </header>

      <main className={styles.main}>
        <BingoCardSheet
          title={currentCard.title}
          size={currentCard.size}
          cells={currentCard.cells}
          createdAt={currentCard.createdAt}
          completedLines={completedLines}
          selectedCellId={selectedCellId}
          onCellClick={setSelectedCellId}
          accentColor={currentCard.theme.primaryColor}
          paperColor={currentCard.theme.backgroundColor}
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
        {selectedCell && (
          <CompletionModal
            cell={selectedCell}
            onClose={() => setSelectedCellId(null)}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePopup?.kind === 'reward' && (
          <RewardPopup
            reward={activePopup.reward}
            onClose={advanceQueue}
          />
        )}
      </AnimatePresence>

      <BingoCelebration
        show={activePopup?.kind === 'golden' || activePopup?.kind === 'line' || activePopup?.kind === 'full'}
        variant={
          activePopup?.kind === 'golden' || activePopup?.kind === 'line' || activePopup?.kind === 'full'
            ? activePopup.kind
            : 'line'
        }
        stats={stats ?? undefined}
        onClose={advanceQueue}
      />
    </div>
  );
};
