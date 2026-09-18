import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift } from 'lucide-react';

import { CardStats } from '../../core/stats';
import { Reward } from '../../types/bingo';

import styles from './BingoCelebration.module.scss';

interface BingoCelebrationProps {
  show: boolean;
  variant: 'line' | 'full';
  reward?: Reward;
  stats?: CardStats;
  onClose: () => void;
}

type ParticleContent =
  | { kind: 'emoji'; value: string }
  | { kind: 'image'; src: string };

interface ParticleConfig {
  x: number;
  y: number;
  rotate: number;
  duration: number;
  size: number;
  content: ParticleContent;
}

const PARTICLE_EMOJIS = ['🌸', '✨', '☁️'] as const;

const PARTICLE_IMAGES = [
  '/assets/main/bow_1.png',
  '/assets/main/flower_1.png',
  '/assets/main/heart_1.png',
  '/assets/main/moon_1.png',
  '/assets/main/pearl.png',
  '/assets/main/pearl_1.png',
  '/assets/main/pearl_2.png',
  '/assets/main/seashel_1.png',
  '/assets/main/seashel_2.png',
  '/assets/main/star.png',
  '/assets/main/star_1.png',
  '/assets/main/star_pearl.png',
  '/assets/main/tulip_1.png',
  '/assets/main/silver_1.png',
  '/assets/main/silver_2.png',
  '/assets/main/silver_3.png',
  '/assets/main/silver_4.png',
  '/assets/main/silver_5.png',
] as const;

function pickFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function createParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, () => {
    const useImage = Math.random() < 0.65;
    return {
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      rotate: Math.random() * 360,
      duration: 2 + Math.random() * 2,
      size: 22 + Math.random() * 22,
      content: useImage
        ? { kind: 'image' as const, src: pickFrom(PARTICLE_IMAGES) }
        : { kind: 'emoji' as const, value: pickFrom(PARTICLE_EMOJIS) },
    };
  });
}

export const BingoCelebration = ({ show, variant, reward, stats, onClose }: BingoCelebrationProps) => {
  const particles = useMemo(
    () => (show ? createParticles(32) : []),
    [show]
  );

  const title = variant === 'full' ? 'Board Complete!' : 'Bingo!';
  const subtitle =
    variant === 'full' ? 'Your garden of memories is full' : 'A beautiful line is complete';
  const action = 'Wonderful!';

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
            className={styles.card}
            role="dialog"
            aria-labelledby="celebration-title"
            initial={{ scale: 0.5, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h1 id="celebration-title" className={styles.text}>
              {title}
            </h1>
            <p className={styles.subtext}>{subtitle}</p>
            {reward ? (
              <div className={styles.reward}>
                <Gift size={18} />
                <span>{reward.title}</span>
              </div>
            ) : null}
            {variant === 'full' && stats && (
              <ul className={styles.stats}>
                <li>🌸 <strong>{stats.completedCount}</strong> challenges done</li>
                <li>✨ <strong>{stats.lineCount}</strong> bingo lines</li>
                <li>💖 <strong>{stats.goldenCount}</strong> golden treasures</li>
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
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    scale: [0, 1, 0.5, 0],
                    opacity: [0, 1, 1, 0],
                    rotate: [0, particle.rotate],
                  }}
                  transition={{ duration: particle.duration, ease: 'easeOut' }}
                >
                  {particle.content.kind === 'image' ? (
                    <img
                      src={particle.content.src}
                      alt=""
                      className={styles.particleImage}
                      style={{ width: particle.size, height: particle.size }}
                    />
                  ) : (
                    particle.content.value
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
