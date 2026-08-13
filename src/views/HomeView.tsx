import React from 'react';
import { useBingoStore } from '../store/useBingoStore';
import styles from './HomeView.module.scss';

interface HomeViewProps {
  onCreateNew: () => void;
  onPlay: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onCreateNew, onPlay }) => {
  const { cards, setCurrentCard } = useBingoStore();

  const handleCardClick = (id: string) => {
    setCurrentCard(id);
    onPlay(id);
  };

  return (
    <div className={styles.container}>
      <h1>My Bingo Cards</h1>
      
      {cards.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No bingo cards yet. Create one to start playing!</p>
          <button className={styles.createButton} onClick={onCreateNew}>Create New Bingo</button>
        </div>
      ) : (
        <div className={styles.cardList}>
          {cards.map((card) => (
            <div key={card.id} className={styles.cardItem} onClick={() => handleCardClick(card.id)}>
              <h3>{card.title}</h3>
              <p>Created: {new Date(card.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          <button className={styles.createButton} onClick={onCreateNew}>Create New Bingo</button>
        </div>
      )}
    </div>
  );
};
