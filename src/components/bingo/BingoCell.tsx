import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { Star } from 'lucide-react';
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

  // Deterministic watercolor spot selection based on ID
  const watercolorCount = 6;
  const spotIndex = cell.id ? Math.abs(cell.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % watercolorCount : 0;
  const spotClass = (styles as any)[`spot${spotIndex}`];

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
      {/* Watercolor Spot Layer */}
      <div className={clsx(styles.watercolorSpot, spotClass)} />

      {photoUrl && isCompleted && (
        <img src={photoUrl} className={styles.photoBackground} alt="" />
      )}

      <div className={styles.content}>
        {cell.icon && (
          isCellIconPath(cell.icon) ? (
            <img src={cell.icon} alt="" className={styles.iconImage} />
          ) : (
            <span className={styles.icon}>{cell.icon}</span>
          )
        )}
        <span className={styles.title}>{cell.title}</span>
      </div>

      {isCompleted && (
        <span className={styles.doneStar} aria-hidden>
          <Star size={20} fill="currentColor" />
        </span>
      )}
    </button>
  );
};
