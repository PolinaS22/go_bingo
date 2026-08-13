import { describe, expect, it } from 'vitest';
import { makeCell } from '../test/fixtures';
import { REWARD_TITLES, dealRewardsToCells, fillEmptyRewards } from './rewards';

describe('rewards catalog', () => {
  it('fills only empty rewards', () => {
    const cells = [
      makeCell({ position: 0, reward: { id: 'r1', title: 'Keep me', isMystery: false } }),
      makeCell({ position: 1 }),
    ];

    const filled = fillEmptyRewards(cells);

    expect(filled[0]?.reward?.title).toBe('Keep me');
    expect(filled[1]?.reward?.title).toBeTruthy();
    expect(REWARD_TITLES).toContain(filled[1]?.reward?.title);
  });

  it('deals one reward per cell', () => {
    const cells = [makeCell({ position: 0 }), makeCell({ position: 1 }), makeCell({ position: 2 })];
    const dealt = dealRewardsToCells(cells);

    expect(dealt).toHaveLength(3);
    expect(new Set(dealt.map((cell) => cell.reward?.title)).size).toBe(3);
  });
});
