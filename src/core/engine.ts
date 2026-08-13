/**
 * Checks if there's a bingo (full row, column, or diagonal)
 * @param completedPositions - Array of indices that are completed
 * @param size - The dimension of the N x N grid
 */
export const checkBingo = (completedPositions: number[], size: number): boolean => {
  const completedSet = new Set(completedPositions);

  // Rows
  for (let r = 0; r < size; r++) {
    let complete = true;
    for (let c = 0; c < size; c++) {
      if (!completedSet.has(r * size + c)) {
        complete = false;
        break;
      }
    }
    if (complete) return true;
  }

  // Columns
  for (let c = 0; c < size; c++) {
    let complete = true;
    for (let r = 0; r < size; r++) {
      if (!completedSet.has(r * size + c)) {
        complete = false;
        break;
      }
    }
    if (complete) return true;
  }

  // Main Diagonal (top-left to bottom-right)
  let mainDiagComplete = true;
  for (let i = 0; i < size; i++) {
    if (!completedSet.has(i * size + i)) {
      mainDiagComplete = false;
      break;
    }
  }
  if (mainDiagComplete) return true;

  // Anti-Diagonal (top-right to bottom-left)
  let antiDiagComplete = true;
  for (let i = 0; i < size; i++) {
    if (!completedSet.has(i * size + (size - 1 - i))) {
      antiDiagComplete = false;
      break;
    }
  }
  if (antiDiagComplete) return true;

  return false;
};
