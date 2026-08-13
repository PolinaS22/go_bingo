import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BingoCelebration.module.scss';

interface BingoCelebrationProps {
  show: boolean;
  onClose: () => void;
}

export const BingoCelebration: React.FC<BingoCelebrationProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className={styles.content}
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <h1 className={styles.text}>BINGO!</h1>
            <div className={styles.subtext}>Line Completed</div>
            <div className={styles.particles}>
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.particle}
                        animate={{
                            x: [0, (Math.random() - 0.5) * 800],
                            y: [0, (Math.random() - 0.5) * 800],
                            scale: [1, 0],
                            opacity: [1, 0],
                            rotate: [0, Math.random() * 360]
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
