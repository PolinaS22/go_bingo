import { describe, expect, it } from 'vitest';
import { makeCard, makeCell } from '../test/fixtures';
import { DEFAULT_THEME } from './defaults';
import { getCardCover, getHomeCardStatus, hashId } from './homeCard';

describe('home card presentation', () => {
  it('marks a card without progress as draft', () => {
    expect(getHomeCardStatus(makeCard())).toBe('draft');
  });

  it('marks a frozen or in-progress card as active', () => {
    expect(getHomeCardStatus(makeCard({ isFrozen: true }))).toBe('active');
    expect(
      getHomeCardStatus(makeCard({ cells: [makeCell({ completedAt: 1 })] }))
    ).toBe('active');
  });

  it('marks a finished card as completed', () => {
    expect(getHomeCardStatus(makeCard({ completedAt: 10 }))).toBe('completed');
  });

  it('uses a custom image cover when the theme provides one', () => {
    const card = makeCard({
      theme: {
        ...DEFAULT_THEME,
        globalBackground: { type: 'image', value: '/covers/japan.jpg' },
      },
    });

    expect(getCardCover(card)).toEqual({ kind: 'image', src: '/covers/japan.jpg' });
  });

  it('picks a deterministic blob cover from the card id (never an auto image)', () => {
    const first = getCardCover(makeCard({ id: 'alpha' }));
    const second = getCardCover(makeCard({ id: 'alpha' }));
    expect(first).toEqual(second);
    expect(first.kind).toBe('blobs');
    expect(hashId('alpha')).toBe(hashId('alpha'));
  });
});
