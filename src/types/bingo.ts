export type Difficulty = 'NORMAL' | 'HARD' | 'GOLDEN';
export type CellStyle = 'glass' | 'solid' | 'bordered';
export type GridSize = 2 | 3 | 4 | 5;

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

export interface BingoCell {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty: Difficulty;
  customBackground?: Background;
  reward?: Reward;
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
  globalBackground: Background;
}

export interface BingoCard {
  id: string;
  title: string;
  description?: string;
  size: GridSize;
  cells: BingoCell[];
  theme: BingoTheme;
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
