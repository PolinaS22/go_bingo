import React, { useState } from 'react';
import { BingoCell } from './BingoCell';
import styles from './BingoGrid.module.scss';
import { BingoCard as BingoCardType } from '../../types/bingo';
import { motion, AnimatePresence } from 'framer-motion';

interface BingoGridProps {
  card: BingoCardType;
  onCellClick: (cellId: string) => void;
}

export const BingoGrid: React.FC<BingoGridProps> = ({ card, onCellClick }) => {
  const isBingo = false; // Simplified for now

  return (
    <div className={styles.gridContainer}>
      <h2 className={styles.title}>{card.title}</h2>
      <div 
        className={styles.grid}
        style={{ 
          gridTemplateColumns: `repeat(${card.size}, 1fr)`
        }}
      >
        {card.cells.map((cell) => (
          <BingoCell 
            key={cell.id} 
            cell={cell} 
            onClick={() => onCellClick(cell.id)} 
          />
        ))}
      </div>

      <AnimatePresence>
        {card.completedAt && (
          <motion.div 
            className={styles.celebration}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.particles}>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.particle}
                  animate={{
                    y: [-20, -100 - Math.random() * 200],
                    x: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
            <div className={styles.bingoText}>BINGO!</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
