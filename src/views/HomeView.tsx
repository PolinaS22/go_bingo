import React from 'react';
import { useBingoStore } from '../store/useBingoStore';
import styles from './HomeView.module.scss';

export const HomeView: React.FC = () => {
  const { cards, setCurrentCard } = useBingoStore();

  return (
    <div className={styles.container}>
      <h1>My Bingo Cards</h1>
      
      {cards.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No bingo cards yet. Create one to start playing!</p>
          <button className={styles.createButton}>Create New Bingo</button>
        </div>
      ) : (
        <div className={styles.cardList}>
          {cards.map((card) => (
            <div key={card.id} className={styles.cardItem} onClick={() => setCurrentCard(card.id)}>
              <h3>{card.title}</h3>
              <p>Created: {new Date(card.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          <button className={styles.createButton}>Create New Bingo</button>
        </div>
      )}
    </div>
  );
};
