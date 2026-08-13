export type BingoLineKind = 'row' | 'column' | 'diagonal' | 'antidiagonal';

export interface BingoLine {
  id: string;
  kind: BingoLineKind;
  index: number;
  positions: number[];
}

export function bingoLineId(kind: BingoLineKind, index: number): string {
  return `${kind}-${index}`;
}

function collectLines(size: number): BingoLine[] {
  const lines: BingoLine[] = [];

  for (let row = 0; row < size; row += 1) {
    lines.push({
      id: bingoLineId('row', row),
      kind: 'row',
      index: row,
      positions: Array.from({ length: size }, (_, column) => row * size + column),
    });
  }

  for (let column = 0; column < size; column += 1) {
    lines.push({
      id: bingoLineId('column', column),
      kind: 'column',
      index: column,
      positions: Array.from({ length: size }, (_, row) => row * size + column),
    });
  }

  lines.push({
    id: bingoLineId('diagonal', 0),
    kind: 'diagonal',
    index: 0,
    positions: Array.from({ length: size }, (_, index) => index * size + index),
  });

  lines.push({
    id: bingoLineId('antidiagonal', 0),
    kind: 'antidiagonal',
    index: 0,
    positions: Array.from({ length: size }, (_, index) => index * size + (size - 1 - index)),
  });

  return lines;
}

export function getCompletedLines(completedPositions: number[], size: number): BingoLine[] {
  const completed = new Set(completedPositions);
  return collectLines(size).filter((line) =>
    line.positions.every((position) => completed.has(position))
  );
}

export function getBingoLines(completedPositions: number[], size: number): number {
  return getCompletedLines(completedPositions, size).length;
}

export function checkBingo(completedPositions: number[], size: number): boolean {
  return getBingoLines(completedPositions, size) > 0;
}
