import React from 'react';
import { Reward } from '../../types/bingo';
import styles from './RewardPopup.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardPopupProps {
  reward: Reward;
  onClose: () => void;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({ reward, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div 
        className={styles.popup}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className={styles.icon}>🎉</div>
        <h3>Reward Unlocked!</h3>
        <p className={styles.title}>{reward.title}</p>
        {reward.description && <p className={styles.description}>{reward.description}</p>}
        {reward.link && (
            <a href={reward.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Claim Reward
            </a>
        )}
        <button className={styles.closeBtn} onClick={onClose}>Awesome!</button>
      </motion.div>
    </div>
  );
};
