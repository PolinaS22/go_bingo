import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { Check, Star } from 'lucide-react';
import { isCellIconPath } from '../../core/cellPresets';
import { isCellCompleted } from '../../core/defaults';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { BingoCell as BingoCellType } from '../../types/bingo';
import styles from './BingoCell.module.scss';

interface BingoCellProps {
  cell: BingoCellType;
  onClick: (id: string) => void;
  selected?: boolean;
}

export const BingoCell = ({ cell, onClick, selected = false }: BingoCellProps) => {
  const isCompleted = isCellCompleted(cell.completedAt);
  const photoUrl = usePhotoUrl(cell.photoId, isCompleted);

  const customStyle: CSSProperties = {};
  if (cell.customBackground) {
    if (cell.customBackground.type === 'color' || cell.customBackground.type === 'gradient') {
      customStyle.background = cell.customBackground.value;
    } else if (cell.customBackground.type === 'image') {
      customStyle.backgroundImage = `url(${cell.customBackground.value})`;
    }
  }

  return (
    <button
      type="button"
      className={clsx(styles.cell, {
        [styles.completed]: isCompleted,
        [styles.selected]: selected,
        [styles.difficultyGolden]: cell.difficulty === 'GOLDEN' && !isCompleted,
        [styles.hasCustomBackground]: !!cell.customBackground,
      })}
      style={customStyle}
      onClick={() => onClick(cell.id)}
      aria-pressed={isCompleted}
      aria-label={`${cell.title}, ${cell.difficulty}`}
    >
      {photoUrl && isCompleted && (
        <img src={photoUrl} className={styles.photoBackground} alt="" />
      )}

      {!(isCompleted && photoUrl) && (
        <div className={clsx(styles.content, !cell.icon && styles.textOnly)}>
          <span className={styles.title}>{cell.title}</span>
          {cell.icon && (
            isCellIconPath(cell.icon) ? (
              <img src={cell.icon} alt="" className={styles.iconImage} />
            ) : (
              <span className={styles.icon}>{cell.icon}</span>
            )
          )}
        </div>
      )}

      {isCompleted && (
        <>
          <span className={styles.doneBanner}>
            <Check size={12} strokeWidth={3} />
            Done!
          </span>
          <span className={styles.doneStar} aria-hidden>
            <Star size={16} fill="currentColor" />
          </span>
        </>
      )}
    </button>
  );
};
