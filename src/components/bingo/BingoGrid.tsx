import type { CSSProperties } from 'react';
import { BingoLine } from '../../core/engine';
import { BingoCell as BingoCellType, GridSize } from '../../types/bingo';
import { BingoCell } from './BingoCell';
import styles from './BingoGrid.module.scss';

interface BingoGridProps {
  size: GridSize;
  cells: BingoCellType[];
  onCellClick: (cellId: string) => void;
  completedLines?: BingoLine[];
  selectedCellId?: string | null;
}

function stampStyle(line: BingoLine, size: number): CSSProperties {
  const unit = 100 / size;

  if (line.kind === 'row') {
    return {
      top: `${line.index * unit + unit / 2}%`,
      left: '5%',
      width: '90%',
      transform: 'translateY(-50%) rotate(-6deg)',
    };
  }

  if (line.kind === 'column') {
    return {
      top: '50%',
      left: `${line.index * unit + unit / 2}%`,
      width: '90%',
      transform: 'translate(-50%, -50%) rotate(84deg)',
    };
  }

  if (line.kind === 'diagonal') {
    return {
      top: '50%',
      left: '8%',
      width: '84%',
      transform: 'translateY(-50%) rotate(45deg)',
    };
  }

  return {
    top: '50%',
    left: '8%',
    width: '84%',
    transform: 'translateY(-50%) rotate(-45deg)',
  };
}

export const BingoGrid = ({
  size,
  cells,
  onCellClick,
  completedLines = [],
  selectedCellId = null,
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
          />
        ))}
      </div>
      {completedLines.map((line) => (
        <div
          key={line.id}
          className={styles.lineStamp}
          style={stampStyle(line, size)}
          aria-hidden
        >
          Bingo!
        </div>
      ))}
    </div>
  );
};
