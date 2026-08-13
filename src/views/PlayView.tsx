import React, { useState, useEffect, useRef } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { useBingoLogic } from '../store/useBingoLogic';
import { BingoGrid } from '../components/bingo/BingoGrid';
import { CompletionModal } from '../components/bingo/CompletionModal';
import { RewardPopup } from '../components/bingo/RewardPopup';
import { BingoCelebration } from '../components/bingo/BingoCelebration';
import { Reward } from '../types/bingo';
import styles from './PlayView.module.scss';
import { AnimatePresence } from 'framer-motion';

export const PlayView: React.FC = () => {
  const { currentCardId, cards, completeCell } = useBingoStore();
  const { currentCard, completedLineCount } = useBingoLogic();
  
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showBingoCelebration, setShowBingoCelebration] = useState(false);
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null);
  
  const prevLineCount = useRef(completedLineCount);

  useEffect(() => {
    if (completedLineCount > prevLineCount.current) {
      setShowBingoCelebration(true);
      // Auto-hide celebration after 3 seconds
      const timer = setTimeout(() => setShowBingoCelebration(false), 3000);
      prevLineCount.current = completedLineCount;
      return () => clearTimeout(timer);
    }
    prevLineCount.current = completedLineCount;
  }, [completedLineCount]);

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <p>No bingo card selected. Go back to home to pick one.</p>
      </div>
    );
  }

  const selectedCell = currentCard.cells.find(c => c.id === selectedCellId);

  const handleCellClick = (cellId: string) => {
    setSelectedCellId(cellId);
  };

  const handleComplete = (photoId?: string) => {
    if (currentCardId && selectedCellId) {
      const cell = currentCard.cells.find(c => c.id === selectedCellId);
      completeCell(currentCardId, selectedCellId, photoId);
      setSelectedCellId(null);
      
      // If cell had a reward, show it
      if (cell?.reward) {
        setUnlockedReward(cell.reward);
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{currentCard.title}</h1>
      </header>
      
      <main className={styles.main}>
        <BingoGrid card={currentCard} onCellClick={handleCellClick} />
      </main>

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
        {unlockedReward && (
          <RewardPopup 
            reward={unlockedReward} 
            onClose={() => setUnlockedReward(null)} 
          />
        )}
      </AnimatePresence>

      <BingoCelebration 
        show={showBingoCelebration} 
        onClose={() => setShowBingoCelebration(false)} 
      />
    </div>
  );
};
