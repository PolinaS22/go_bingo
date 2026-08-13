import {
  Background,
  BingoCard,
  BingoCell,
  BingoTheme,
  CellStyle,
  Difficulty,
  GridSize,
  PersistedBingoState,
  Reward,
} from '../types/bingo';
import { DEFAULT_THEME, createCell, isGridSize } from './defaults';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (value === 'HARD' || value === 'GOLDEN' || value === 'NORMAL') {
    return value;
  }
  return 'NORMAL';
}

function normalizeCellStyle(value: unknown): CellStyle {
  if (value === 'glass' || value === 'solid' || value === 'bordered') {
    return value;
  }
  return 'solid';
}

function normalizeBackground(value: unknown): Background | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const type = value.type;
  const backgroundValue = asString(value.value);
  if (
    (type === 'color' || type === 'gradient' || type === 'image') &&
    backgroundValue
  ) {
    return { type, value: backgroundValue };
  }

  return undefined;
}

function normalizeReward(value: unknown): Reward | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = asString(value.title);
  if (!title) {
    return undefined;
  }

  return {
    id: asString(value.id) ?? crypto.randomUUID(),
    title,
    description: asString(value.description),
    isMystery: value.isMystery === true,
    link: asString(value.link),
  };
}

function normalizeCompletedAt(raw: Record<string, unknown>): number | undefined {
  const completedAt = raw.completedAt;
  if (typeof completedAt === 'number' && Number.isFinite(completedAt)) {
    return completedAt;
  }
  if (typeof completedAt === 'string') {
    const parsed = Date.parse(completedAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (raw.isCompleted === true) {
    return Date.now();
  }
  return undefined;
}

export function normalizeCell(raw: unknown, index: number): BingoCell {
  if (!isRecord(raw)) {
    return createCell(index);
  }

  return {
    id: asString(raw.id) ?? crypto.randomUUID(),
    title: asString(raw.title) ?? asString(raw.text) ?? `Cell ${index + 1}`,
    description: asString(raw.description),
    icon: asString(raw.icon),
    difficulty: normalizeDifficulty(raw.difficulty),
    customBackground: normalizeBackground(raw.customBackground),
    reward: normalizeReward(raw.reward),
    completedAt: normalizeCompletedAt(raw),
    photoId: asString(raw.photoId),
    photoRequired: raw.photoRequired === true,
    position: index,
  };
}

function normalizeTheme(value: unknown): BingoTheme {
  if (!isRecord(value)) {
    return DEFAULT_THEME;
  }

  return {
    id: asString(value.id) ?? DEFAULT_THEME.id,
    primaryColor: asString(value.primaryColor) ?? DEFAULT_THEME.primaryColor,
    secondaryColor: asString(value.secondaryColor) ?? DEFAULT_THEME.secondaryColor,
    backgroundColor: asString(value.backgroundColor) ?? DEFAULT_THEME.backgroundColor,
    textColor: asString(value.textColor) ?? DEFAULT_THEME.textColor,
    borderRadius: asFiniteNumber(value.borderRadius) ?? DEFAULT_THEME.borderRadius,
    cellStyle: normalizeCellStyle(value.cellStyle),
    globalBackground:
      normalizeBackground(value.globalBackground) ?? DEFAULT_THEME.globalBackground,
  };
}

function normalizeSize(value: unknown, cellCount: number): GridSize {
  if (typeof value === 'number' && isGridSize(value)) {
    return value;
  }

  const inferred = Math.sqrt(cellCount);
  if (isGridSize(inferred)) {
    return inferred;
  }

  return 5;
}

function normalizeTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function normalizeCard(raw: unknown): BingoCard | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asString(raw.id);
  if (!id) {
    return null;
  }

  const rawCells = Array.isArray(raw.cells) ? raw.cells : [];
  const size = normalizeSize(raw.size, rawCells.length);
  const expectedCount = size * size;
  const cells = Array.from({ length: expectedCount }, (_, index) =>
    normalizeCell(rawCells[index], index)
  );

  const now = Date.now();
  const completedAt = asFiniteNumber(raw.completedAt);
  const allCompleted = cells.every((cell) => cell.completedAt !== undefined);

  return {
    id,
    title: asString(raw.title) ?? 'Untitled Bingo',
    description: asString(raw.description),
    size,
    cells,
    theme: normalizeTheme(raw.theme),
    isFrozen: raw.isFrozen === true || cells.some((cell) => cell.completedAt !== undefined),
    createdAt: normalizeTimestamp(raw.createdAt, now),
    updatedAt: normalizeTimestamp(raw.updatedAt, now),
    completedAt: allCompleted ? (completedAt ?? now) : undefined,
  };
}

export function normalizePersistedState(raw: unknown): PersistedBingoState {
  const source = unwrapPersistedState(raw);
  const cards = Array.isArray(source.cards)
    ? source.cards
        .map(normalizeCard)
        .filter((card): card is BingoCard => card !== null)
    : [];

  const currentCardId = asString(source.currentCardId) ?? null;
  const currentExists = currentCardId !== null && cards.some((card) => card.id === currentCardId);

  return {
    cards,
    currentCardId: currentExists ? currentCardId : null,
  };
}

function unwrapPersistedState(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    return {};
  }

  if (isRecord(raw.state)) {
    return raw.state;
  }

  return raw;
}
