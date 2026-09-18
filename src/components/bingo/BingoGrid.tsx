import { BingoCell, BingoCellVariant } from './BingoCell';

import { BingoLine } from '../../core/engine';
import { BingoCell as BingoCellType, GridSize } from '../../types/bingo';

import styles from './BingoGrid.module.scss';

interface BingoGridProps {
  size: GridSize;
  cells: BingoCellType[];
  onCellClick: (cellId: string) => void;
  completedLines?: BingoLine[];
  selectedCellId?: string | null;
  variant?: BingoCellVariant;
}

function lineCoords(line: BingoLine, size: number): { x1: number; y1: number; x2: number; y2: number } {
  const inset = 10;
  const mid = (index: number) => ((index + 0.5) / size) * 100;

  if (line.kind === 'row') {
    return { x1: inset, y1: mid(line.index), x2: 100 - inset, y2: mid(line.index) };
  }

  if (line.kind === 'column') {
    return { x1: mid(line.index), y1: inset, x2: mid(line.index), y2: 100 - inset };
  }

  if (line.kind === 'diagonal') {
    return { x1: inset, y1: inset, x2: 100 - inset, y2: 100 - inset };
  }

  return { x1: 100 - inset, y1: inset, x2: inset, y2: 100 - inset };
}

export const BingoGrid = ({
  size,
  cells,
  onCellClick,
  completedLines = [],
  selectedCellId = null,
  variant = 'play',
}: BingoGridProps) => {
  return (
    <div className={styles.wrap}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {cells.map((cell) => (
          <BingoCell
            key={cell.id}
            cell={cell}
            onClick={onCellClick}
            selected={selectedCellId === cell.id}
            variant={variant}
          />
        ))}
      </div>
      {completedLines.length > 0 ? (
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {completedLines.map((line) => {
            const coords = lineCoords(line, size);
            return (
              <g key={line.id}>
                <line className={styles.lineGlow} {...coords} />
                <line className={styles.line} {...coords} />
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
};
