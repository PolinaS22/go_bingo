import { describe, expect, it } from 'vitest';
import {
  REWARD_TITLES,
  assignRewards,
  createDefaultRewards,
  createRewardSlot,
  maxBingoLines,
  resolveBingoReward,
  rewardForBingoLine,
  rewardForFullCard,
} from './rewards';

describe('bingo reward', () => {
  it('keeps a named reward', () => {
    const reward = resolveBingoReward({
      id: 'r1',
      title: '  Ice cream ',
      isMystery: false,
    });

    expect(reward.title).toBe('Ice cream');
    expect(reward.id).toBe('r1');
  });

  it('fills an empty reward from the catalog', () => {
    const reward = resolveBingoReward(undefined);
    expect(REWARD_TITLES).toContain(reward.title);
  });

  it('counts max bingo lines by grid size', () => {
    expect(maxBingoLines(2)).toBe(6);
    expect(maxBingoLines(5)).toBe(12);
  });

  it('assigns a single card reward', () => {
    const assigned = assignRewards({
      mode: 'card',
      slots: [{ title: 'Picnic', useRandom: false }],
    });
    expect(assigned).toHaveLength(1);
    expect(assigned[0]?.title).toBe('Picnic');
  });

  it('fills random slots from the catalog', () => {
    const assigned = assignRewards({
      mode: 'card',
      slots: [createRewardSlot()],
    });
    expect(REWARD_TITLES).toContain(assigned[0]?.title);
  });

  it('returns a card reward only in card mode', () => {
    const card = createDefaultRewards('card');
    card.slots = [{ title: 'Flowers', useRandom: false }];
    expect(rewardForFullCard(card)?.title).toBe('Flowers');
    expect(rewardForBingoLine({ ...card, mode: 'perBingo', slots: card.slots }, 0)).toBeDefined();
  });

  it('hands out per-bingo rewards in order of assigned list', () => {
    const config = {
      mode: 'perBingo' as const,
      slots: [
        { title: 'A', useRandom: false },
        { title: 'B', useRandom: false },
      ],
      assigned: [
        { id: '1', title: 'A', isMystery: false },
        { id: '2', title: 'B', isMystery: false },
      ],
    };
    expect(rewardForBingoLine(config, 0)?.title).toBe('A');
    expect(rewardForBingoLine(config, 1)?.title).toBe('B');
  });
});
