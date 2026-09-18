import clsx from 'clsx';

import { BingoCellVariant } from './BingoCell';
import { BingoGrid } from './BingoGrid';

import { BingoLine } from '../../core/engine';
import { getBingoSheetCover } from '../../core/homeCard';
import { BingoCard } from '../../types/bingo';

import styles from './BingoCardSheet.module.scss';

interface BingoCardSheetProps {
  card: BingoCard;
  completedLines?: BingoLine[];
  selectedCellId?: string | null;
  onCellClick: (cellId: string) => void;
  variant?: BingoCellVariant;
}

const SIZE_CLASS: Record<BingoCard['size'], string> = {
  2: styles.size2,
  3: styles.size3,
  4: styles.size4,
  5: styles.size5,
};

export const BingoCardSheet = ({
  card,
  completedLines = [],
  selectedCellId = null,
  onCellClick,
  variant = 'play',
}: BingoCardSheetProps) => {
  const cover = getBingoSheetCover(card);

  return (
    <div className={clsx(styles.stage, SIZE_CLASS[card.size])}>
      <article className={styles.card} style={{ background: cover.base }}>
        <div className={styles.blobs} style={{ background: cover.base }} aria-hidden>
          {cover.blobs.map((blob) => (
            <span
              key={`${blob.color}-${blob.x}-${blob.y}`}
              className={styles.blob}
              style={{
                background: blob.color,
                width: blob.size,
                height: blob.size,
                left: blob.x,
                top: blob.y,
              }}
            />
          ))}
        </div>

        <BingoGrid
          size={card.size}
          cells={card.cells}
          onCellClick={onCellClick}
          completedLines={completedLines}
          selectedCellId={selectedCellId}
          variant={variant}
        />
      </article>
    </div>
  );
};
