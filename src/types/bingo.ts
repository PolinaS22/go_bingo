export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BingoCell {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
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
  createdAt: number;
  completedAt?: number;
}
