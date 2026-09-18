export type Difficulty = 'NORMAL' | 'HARD' | 'GOLDEN';
export type CellStyle = 'glass' | 'solid' | 'bordered';
export type GridSize = 2 | 3 | 4 | 5;
export type RewardMode = 'card' | 'perBingo';

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  isMystery: boolean;
  link?: string;
}

/** Editor draft for one reward; empty + useRandom fills from the catalog. */
export interface RewardSlot {
  title: string;
  useRandom: boolean;
}

export interface CardRewards {
  mode: RewardMode;
  slots: RewardSlot[];
  /** Resolved, shuffled rewards (filled on first bingo / card complete). */
  assigned?: Reward[];
}

export interface BingoCell {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty: Difficulty;
  customBackground?: Background;
  completedAt?: number;
  photoId?: string;
  photoRequired: boolean;
  position: number;
}

export interface BingoTheme {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  cellStyle: CellStyle;
  /** Home cover only — not the play-sheet background. */
  globalBackground: Background;
}

export interface BingoCard {
  id: string;
  title: string;
  description?: string;
  size: GridSize;
  cells: BingoCell[];
  theme: BingoTheme;
  rewards: CardRewards;
  isFrozen: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface PersistedBingoState {
  cards: BingoCard[];
  currentCardId: string | null;
}

export interface BackupPayload {
  version: 1;
  timestamp: string;
  state: PersistedBingoState;
  photos: Record<string, string>;
}

export const BINGO_STORAGE_KEY = 'bingo-storage';
export const BACKUP_VERSION = 1;
