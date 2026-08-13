import React from 'react';
import { BingoCard } from '../../types/bingo';
import { BingoCell } from './BingoCell';
import styles from './BingoGrid.module.scss';

interface BingoGridProps {
  card: BingoCard;
  onCellClick: (id: string) => void;
}

export const BingoGrid: React.FC<BingoGridProps> = ({ card, onCellClick }) => {
  return (
    <div className={styles.container}>
      {card.title && <h2 className={styles.title}>{card.title}</h2>}
      <div 
        className={styles.grid}
        style={{ 
          gridTemplateColumns: `repeat(${card.size}, 1fr)`,
          gap: '1rem'
        }}
      >
        {card.cells
          .sort((a, b) => a.position - b.position)
          .map((cell) => (
            <BingoCell 
              key={cell.id} 
              cell={cell} 
              onClick={onCellClick} 
            />
          ))}
      </div>
    </div>
  );
};
