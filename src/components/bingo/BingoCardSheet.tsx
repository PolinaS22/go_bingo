import type { CSSProperties } from 'react';
import { isCellCompleted } from '../../core/defaults';
import { BingoLine } from '../../core/engine';
import { BingoCell, GridSize } from '../../types/bingo';
import { BingoGrid } from './BingoGrid';
import styles from './BingoCardSheet.module.scss';

type CardCssVariables = CSSProperties & {
  '--card-ink'?: string;
  '--card-paper'?: string;
};

interface BingoCardSheetProps {
  title: string;
  size: GridSize;
  cells: BingoCell[];
  createdAt?: number;
  completedLines?: BingoLine[];
  selectedCellId?: string | null;
  onCellClick: (cellId: string) => void;
  accentColor?: string;
  paperColor?: string;
}

export const BingoCardSheet = ({
  title,
  size,
  cells,
  createdAt,
  completedLines = [],
  selectedCellId = null,
  onCellClick,
  accentColor,
  paperColor,
}: BingoCardSheetProps) => {
  const completedCount = cells.filter((cell) => isCellCompleted(cell.completedAt)).length;
  const cardNumber = new Date(createdAt ?? Date.now()).getFullYear();
  const cssVariables: CardCssVariables = {};
  if (accentColor) {
    cssVariables['--card-ink'] = accentColor;
  }
  if (paperColor) {
    cssVariables['--card-paper'] = paperColor;
  }

  return (
    <div className={styles.stage} style={cssVariables}>
      <div className={`${styles.tape} ${styles.tapeTop}`} aria-hidden />
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.titles}>
            <p className={styles.bingo}>Bingo</p>
            <h2 className={styles.subtitle}>{title || 'Untitled Bingo'}</h2>
          </div>
          <div className={styles.meta}>
            <span className={styles.number}>No. {cardNumber}</span>
            <span className={styles.seal}>Good luck</span>
          </div>
        </header>

        <BingoGrid
          size={size}
          cells={cells}
          onCellClick={onCellClick}
          completedLines={completedLines}
          selectedCellId={selectedCellId}
        />

        <footer className={styles.footer}>
          <span>Enjoy every moment</span>
          <div className={styles.progress}>
            <span>
              {String(completedCount).padStart(2, '0')} / {String(cells.length).padStart(2, '0')} completed
            </span>
            <div className={styles.bar} aria-hidden>
              <div
                className={styles.barFill}
                style={{ width: `${cells.length === 0 ? 0 : (completedCount / cells.length) * 100}%` }}
              />
            </div>
          </div>
          <span>Make memories</span>
        </footer>
      </article>
      <div className={`${styles.tape} ${styles.tapeBottom}`} aria-hidden />
    </div>
  );
};
