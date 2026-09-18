import { Background } from '../types/bingo';

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;

export const PASTEL_COLORS = ['#F4C6C8', '#F3D59A', '#C9D6C3', '#C5D8EA'] as const;

export const PRESET_BACKGROUNDS = [
  { src: assetUrl('bg/flowers_bg.jpeg'), label: 'Flowers' },
  { src: assetUrl('bg/crochet_bg.jpeg'), label: 'Crochet' },
  { src: assetUrl('bg/shape_bg.jpeg'), label: 'Shapes' },
] as const;

const ICON_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19] as const;

export const CELL_ICON_PATHS = ICON_NUMBERS.map((id) => assetUrl(`icons/icon_${id}.svg`));

export function isPresetPastel(value: string): boolean {
  return (PASTEL_COLORS as readonly string[]).includes(value);
}

export function isCellIconPath(icon: string): boolean {
  return icon.startsWith(`${import.meta.env.BASE_URL}assets/icons/`);
}

export function isSameBackground(
  current: Background | undefined,
  next: Background
): boolean {
  return current?.type === next.type && current.value === next.value;
}
