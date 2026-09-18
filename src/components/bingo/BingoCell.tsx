import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { Plus, Star } from 'lucide-react';

import { usePhotoUrl } from '../../hooks/usePhotoUrl';

import { isCellIconPath } from '../../core/cellPresets';
import { isCellCompleted, isEmptyCell } from '../../core/defaults';
import { BingoCell as BingoCellType } from '../../types/bingo';

import styles from './BingoCell.module.scss';

export type BingoCellVariant = 'edit' | 'play';

interface BingoCellProps {
  cell: BingoCellType;
  onClick: (id: string) => void;
  selected?: boolean;
  variant?: BingoCellVariant;
}

const WATERCOLOR_SPOTS = [
  styles.spot0,
  styles.spot1,
  styles.spot2,
  styles.spot3,
  styles.spot4,
  styles.spot5,
] as const;

function spotClassFor(id: string): string {
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const spot = WATERCOLOR_SPOTS[Math.abs(sum) % WATERCOLOR_SPOTS.length];
  return spot ?? styles.spot0;
}

export const BingoCell = ({
  cell,
  onClick,
  selected = false,
  variant = 'play',
}: BingoCellProps) => {
  const isCompleted = isCellCompleted(cell.completedAt);
  const empty = isEmptyCell(cell);
  const photoUrl = usePhotoUrl(cell.photoId, isCompleted);
  const clickable = variant === 'edit' || !empty;

  const customStyle: CSSProperties = {};
  if (cell.customBackground) {
    if (cell.customBackground.type === 'color' || cell.customBackground.type === 'gradient') {
      customStyle.background = cell.customBackground.value;
    } else if (cell.customBackground.type === 'image') {
      customStyle.backgroundImage = `url(${cell.customBackground.value})`;
    }
  }

  const label = empty
    ? 'Add challenge'
    : `${cell.title}, ${cell.difficulty}`;

  return (
    <button
      type="button"
      className={clsx(styles.cell, {
        [styles.completed]: isCompleted,
        [styles.selected]: selected,
        [styles.empty]: empty,
        [styles.difficultyGolden]: cell.difficulty === 'GOLDEN' && !isCompleted && !empty,
        [styles.hasCustomBackground]: Boolean(cell.customBackground),
      })}
      style={customStyle}
      onClick={() => {
        if (clickable) {
          onClick(cell.id);
        }
      }}
      disabled={!clickable}
      aria-pressed={isCompleted}
      aria-label={label}
    >
      {!empty && <div className={clsx(styles.watercolorSpot, spotClassFor(cell.id))} />}

      {photoUrl && isCompleted && (
        <img src={photoUrl} className={styles.photoBackground} alt="" />
      )}

      {empty ? (
        <div className={styles.emptyContent}>
          {variant === 'edit' ? (
            <>
              <Plus size={22} strokeWidth={2.2} />
              <span>Add challenge</span>
            </>
          ) : (
            <img src="/assets/main/star.png" alt="" className={styles.emptyStar} />
          )}
        </div>
      ) : (
        <div className={styles.content}>
          <span className={styles.title}>{cell.title}</span>
          {cell.icon ? (
            isCellIconPath(cell.icon) ? (
              <img src={cell.icon} alt="" className={styles.iconImage} />
            ) : (
              <span className={styles.icon}>{cell.icon}</span>
            )
          ) : null}
        </div>
      )}

      {isCompleted && (
        <span className={styles.doneStar} aria-hidden>
          <Star size={20} fill="currentColor" />
        </span>
      )}
    </button>
  );
};
