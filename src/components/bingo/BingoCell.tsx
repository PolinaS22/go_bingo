import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { BingoCell as BingoCellType } from '../../types/bingo';
import styles from './BingoCell.module.scss';

interface BingoCellProps {
  cell: BingoCellType;
  onClick: (id: string) => void;
  isGolden?: boolean;
}

export const BingoCell: React.FC<BingoCellProps> = ({ cell, onClick, isGolden }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(styles.cell, {
        [styles.completed]: cell.isCompleted,
        [styles.golden]: isGolden,
      })}
      onClick={() => onClick(cell.id)}
      role="button"
      aria-pressed={cell.isCompleted}
    >
      <div className={styles.content}>
        <span className={styles.text}>{cell.text}</span>
      </div>
      <AnimatePresence>
        {cell.isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={styles.overlay}
          >
            <div className={styles.checkMark}>✓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
