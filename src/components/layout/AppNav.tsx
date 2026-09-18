import clsx from 'clsx';
import { Camera, Gift, LayoutTemplate, Star } from 'lucide-react';
import styles from './AppNav.module.scss';

export type ShellNavId = 'home' | 'memories';

interface AppNavProps {
  active: ShellNavId | null;
  onHome: () => void;
  onMemories: () => void;
}

export const AppNav = ({ active, onHome, onMemories }: AppNavProps) => {
  return (
    <>
      <aside className={styles.sidebar}>
        <button type="button" className={styles.logo} onClick={onHome}>
          <span>BINGO</span>
          <img src="/assets/main/star_pearl.png" alt="" />
        </button>

        <nav className={styles.sideNav} aria-label="Main">
          <button
            type="button"
            className={clsx(styles.sideItem, active === 'home' && styles.sideItemActive)}
            onClick={onHome}
          >
            <Star size={18} fill={active === 'home' ? 'currentColor' : 'none'} />
            My Bingos
          </button>
          <button type="button" className={styles.sideItem} disabled>
            <LayoutTemplate size={18} />
            Templates
          </button>
          <button
            type="button"
            className={clsx(styles.sideItem, active === 'memories' && styles.sideItemActive)}
            onClick={onMemories}
          >
            <Camera size={18} />
            Memories
          </button>
          <button type="button" className={styles.sideItem} disabled>
            <Gift size={18} />
            Rewards
          </button>
        </nav>

        <div className={styles.branding}>
          <div className={styles.pearlWrap}>
            <img src="/assets/main/pearl.png" alt="" />
          </div>
          <p>go on adventures that feel like you ♡</p>
        </div>
      </aside>

      <nav className={styles.mobileNav} aria-label="Main">
        <button
          type="button"
          className={clsx(styles.mobileItem, active === 'home' && styles.mobileItemActive)}
          onClick={onHome}
        >
          <Star size={22} fill={active === 'home' ? 'currentColor' : 'none'} />
          <span>My Bingos</span>
        </button>
        <button
          type="button"
          className={clsx(styles.mobileItem, active === 'memories' && styles.mobileItemActive)}
          onClick={onMemories}
        >
          <Camera size={22} />
          <span>Memories</span>
        </button>
        <button type="button" className={styles.pearlButton} onClick={onHome} aria-label="Home">
          <img src="/assets/main/pearl.png" alt="" />
        </button>
        <button type="button" className={styles.mobileItem} disabled>
          <Gift size={22} />
          <span>Rewards</span>
        </button>
        <button type="button" className={styles.mobileItem} disabled>
          <LayoutTemplate size={22} />
          <span>Templates</span>
        </button>
      </nav>
    </>
  );
};
