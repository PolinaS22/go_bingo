import {
  Background,
  BingoCard,
  BingoCell,
  BingoTheme,
  CardRewards,
  CellStyle,
  Difficulty,
  GridSize,
  PersistedBingoState,
  Reward,
  RewardMode,
  RewardSlot,
} from '../types/bingo';
import { createCell, DEFAULT_THEME, isGridSize } from './defaults';
import { createDefaultRewards, createRewardSlot, maxBingoLines } from './rewards';

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

function normalizeRewardSlot(value: unknown): RewardSlot | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = typeof value.title === 'string' ? value.title : '';
  const useRandom =
    value.useRandom === true || (value.useRandom !== false && title.trim().length === 0);

  return { title, useRandom };
}

function normalizeRewardMode(value: unknown): RewardMode {
  return value === 'perBingo' ? 'perBingo' : 'card';
}

function normalizeCardRewards(
  raw: Record<string, unknown>,
  size: GridSize,
  liftedReward: Reward | undefined
): CardRewards {
  if (isRecord(raw.rewards)) {
    const mode = normalizeRewardMode(raw.rewards.mode);
    const maxSlots = mode === 'card' ? 1 : maxBingoLines(size);
    const rawSlots = Array.isArray(raw.rewards.slots) ? raw.rewards.slots : [];
    const slots = rawSlots
      .map(normalizeRewardSlot)
      .filter((slot): slot is RewardSlot => slot !== undefined)
      .slice(0, maxSlots);

    const assigned = Array.isArray(raw.rewards.assigned)
      ? raw.rewards.assigned
          .map(normalizeReward)
          .filter((reward): reward is Reward => reward !== undefined)
      : undefined;

    return {
      mode,
      slots: slots.length > 0 ? slots : [createRewardSlot()],
      assigned: assigned && assigned.length > 0 ? assigned : undefined,
    };
  }

  const legacy = normalizeReward(raw.bingoReward) ?? liftedReward;
  if (legacy) {
    return {
      mode: 'card',
      slots: [{ title: legacy.title, useRandom: false }],
      assigned: [legacy],
    };
  }

  return createDefaultRewards('card');
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

  const difficulty = normalizeDifficulty(raw.difficulty);

  return {
    id: asString(raw.id) ?? crypto.randomUUID(),
    title: asString(raw.title) ?? asString(raw.text) ?? '',
    description: asString(raw.description),
    icon: asString(raw.icon),
    difficulty,
    customBackground: normalizeBackground(raw.customBackground),
    completedAt: normalizeCompletedAt(raw),
    photoId: asString(raw.photoId),
    photoRequired: difficulty === 'GOLDEN' || raw.photoRequired === true,
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
  const liftedReward = rawCells
    .map((cell) => (isRecord(cell) ? normalizeReward(cell.reward) : undefined))
    .find((reward) => reward !== undefined);

  return {
    id,
    title: asString(raw.title) ?? 'Untitled Bingo',
    description: asString(raw.description),
    size,
    cells,
    theme: normalizeTheme(raw.theme),
    rewards: normalizeCardRewards(raw, size, liftedReward),
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
