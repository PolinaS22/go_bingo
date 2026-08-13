import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { CardStats } from '../../core/stats';
import styles from './BingoCelebration.module.scss';

interface BingoCelebrationProps {
  show: boolean;
  variant: 'line' | 'full' | 'golden';
  stats?: CardStats;
  onClose: () => void;
}

interface ParticleConfig {
  x: number;
  y: number;
  rotate: number;
  duration: number;
}

function createParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 800,
    rotate: Math.random() * 360,
    duration: 1.5 + Math.random(),
  }));
}

export const BingoCelebration = ({ show, variant, stats, onClose }: BingoCelebrationProps) => {
  const particles = useMemo(
    () => (show ? createParticles(24) : []),
    [show]
  );

  const title =
    variant === 'golden' ? 'Golden Bingo!' : variant === 'full' ? 'Bingo Complete!' : 'Bingo!';
  const subtitle =
    variant === 'golden'
      ? 'You completed a Golden Challenge!'
      : variant === 'full'
        ? 'Every playable challenge is done'
        : 'A new line is complete';
  const action = variant === 'golden' ? 'Amazing!' : variant === 'full' ? 'Finish' : 'Yay!';

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
            className={variant === 'golden' ? styles.goldenCard : styles.card}
            role="dialog"
            aria-labelledby="celebration-title"
            initial={{ scale: 0.5, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            {variant === 'golden' && (
              <div className={styles.crown} aria-hidden>
                <Crown size={36} />
              </div>
            )}
            <h1 id="celebration-title" className={styles.text}>
              {title}
            </h1>
            <p className={styles.subtext}>{subtitle}</p>
            {variant === 'full' && stats && (
              <ul className={styles.stats}>
                <li>
                  <strong>{stats.completedCount}</strong> / {stats.playableCount} challenges
                </li>
                <li>
                  <strong>{stats.lineCount}</strong> bingo lines
                </li>
                <li>
                  <strong>{stats.goldenCount}</strong> golden challenges
                </li>
                <li>
                  <strong>{stats.photoCount}</strong> photos
                </li>
              </ul>
            )}
            <button type="button" className={styles.action} onClick={onClose}>
              {action}
            </button>
            <div className={styles.particles}>
              {particles.map((particle, index) => (
                <motion.div
                  key={index}
                  className={styles.particle}
                  animate={{
                    x: [0, particle.x],
                    y: [0, particle.y],
                    scale: [1, 0],
                    opacity: [1, 0],
                    rotate: [0, particle.rotate],
                  }}
                  transition={{ duration: particle.duration, ease: 'easeOut' }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
