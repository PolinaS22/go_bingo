export type Difficulty = 'NORMAL' | 'HARD' | 'GOLDEN';
export type CellStyle = 'glass' | 'solid' | 'bordered';

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
  customImage?: string;
  reward?: Reward;
  completedAt?: string;
  photoId?: string;
  photoRequired?: boolean;
}

export interface BingoTheme {
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
  size: number;
  cells: BingoCell[];
  theme: BingoTheme;
  isFrozen: boolean;
  createdAt: number;
  updatedAt: number;
}
