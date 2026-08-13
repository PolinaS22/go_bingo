import React, { useState } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { useBingoLogic } from '../store/useBingoLogic';
import { BingoGrid } from '../components/bingo/BingoGrid';
import styles from './PlayView.module.scss';

export const PlayView: React.FC = () => {
  const { currentCardId, cards } = useBingoStore();
  const { toggleCell } = useBingoLogic();
  const [showModal, setShowModal] = useState(false);

  const currentCard = cards.find((c) => c.id === currentCardId);

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <p>No bingo card selected. Go back to home to pick one.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{currentCard.title}</h1>
      </header>
      
      <main className={styles.main}>
        <BingoGrid card={currentCard} onCellClick={toggleCell} />
      </main>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Bingo Completed!</h2>
            <p>Congratulations! You've cleared the board.</p>
            <button onClick={() => setShowModal(false)}>Awesome!</button>
          </div>
        </div>
      )}
    </div>
  );
};
