export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BingoCell {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
  photoId?: string;
}

export interface BingoTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface BingoCard {
  id: string;
  title: string;
  cells: BingoCell[];
  difficulty: Difficulty;
  theme: BingoTheme;
  size: number;
  createdAt: number;
  completedAt?: number;
}
