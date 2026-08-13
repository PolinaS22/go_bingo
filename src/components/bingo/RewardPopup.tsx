import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Reward } from '../../types/bingo';
import styles from './RewardPopup.module.scss';

interface RewardPopupProps {
  reward: Reward;
  onClose: () => void;
}

export const RewardPopup = ({ reward, onClose }: RewardPopupProps) => {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <motion.div
        className={styles.popup}
        role="dialog"
        aria-labelledby="reward-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className={styles.icon} aria-hidden>
          <Gift size={36} />
        </div>
        <h3 id="reward-title">Challenge complete!</h3>
        <p className={styles.lead}>Your reward is unlocked!</p>
        {reward.link ? (
          <a href={reward.link} target="_blank" rel="noopener noreferrer" className={styles.rewardBtn}>
            {reward.title}
          </a>
        ) : (
          <p className={styles.rewardBtn}>{reward.title}</p>
        )}
        {reward.description && <p className={styles.description}>{reward.description}</p>}
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Yay!
        </button>
      </motion.div>
    </div>
  );
};
