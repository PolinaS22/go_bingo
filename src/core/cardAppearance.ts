export const CARD_THEME_COLORS = [
  '#C9B8E8',
  '#FFBACA',
  '#F7D2C8',
  '#C5D8F4',
  '#C8EBE3',
  '#FFFFFF',
] as const;

export type CardThemeColor = (typeof CARD_THEME_COLORS)[number];

export function isCardThemeColor(value: string): value is CardThemeColor {
  return (CARD_THEME_COLORS as readonly string[]).includes(value);
}

export function hexLuminance(hex: string): number {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return 0;
  }

  const red = parseInt(raw.slice(0, 2), 16);
  const green = parseInt(raw.slice(2, 4), 16);
  const blue = parseInt(raw.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000;
}

export function isLightHex(hex: string): boolean {
  return hexLuminance(hex) > 180;
}

export function cardAccentColor(color: string): string {
  return hexLuminance(color) > 240 ? '#8b7cf6' : color;
}

/** Mix a hex color toward white for soft pastel card washes. */
export function pastelizeHex(hex: string, amount = 0.62): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return hex;
  }

  const mix = Math.min(1, Math.max(0, amount));
  const channel = (start: number) => {
    const value = parseInt(raw.slice(start, start + 2), 16);
    return Math.round(value + (255 - value) * mix)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${channel(0)}${channel(2)}${channel(4)}`;
}
