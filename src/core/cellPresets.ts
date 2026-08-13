import { Background } from '../types/bingo';

export const PASTEL_COLORS = ['#F4C6C8', '#F3D59A', '#C9D6C3', '#C5D8EA'] as const;

export const PRESET_BACKGROUNDS = [
  { src: '/assets/bg/flowers_bg.jpeg', label: 'Flowers' },
  { src: '/assets/bg/crochet_bg.jpeg', label: 'Crochet' },
  { src: '/assets/bg/shape_bg.jpeg', label: 'Shapes' },
] as const;

const ICON_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19] as const;

export const CELL_ICON_PATHS = ICON_NUMBERS.map((id) => `/assets/icons/icon_${id}.svg`);

export function isPresetPastel(value: string): boolean {
  return (PASTEL_COLORS as readonly string[]).includes(value);
}

export function isCellIconPath(icon: string): boolean {
  return icon.startsWith('/assets/icons/');
}

export function isSameBackground(
  current: Background | undefined,
  next: Background
): boolean {
  return current?.type === next.type && current.value === next.value;
}
