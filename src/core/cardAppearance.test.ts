import { describe, expect, it } from 'vitest';
import {
  CARD_THEME_COLORS,
  cardAccentColor,
  hexLuminance,
  isCardThemeColor,
  isLightHex,
} from './cardAppearance';

describe('card appearance helpers', () => {
  it('recognizes preset theme colors', () => {
    expect(isCardThemeColor(CARD_THEME_COLORS[0])).toBe(true);
    expect(isCardThemeColor('#000000')).toBe(false);
  });

  it('treats white as light and uses a violet accent', () => {
    expect(isLightHex('#FFFFFF')).toBe(true);
    expect(hexLuminance('#FFFFFF')).toBeGreaterThan(240);
    expect(cardAccentColor('#FFFFFF')).toBe('#8b7cf6');
  });

  it('keeps saturated pastels as the accent', () => {
    expect(cardAccentColor('#C9B8E8')).toBe('#C9B8E8');
  });
});
