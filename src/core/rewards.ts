import { CardRewards, GridSize, Reward, RewardMode, RewardSlot } from '../types/bingo';

export const REWARD_TITLES = [
  'Treat yourself to dessert',
  'Buy a small souvenir',
  'Take a long bath',
  'Watch a comfort movie',
  'Order your favorite drink',
  'Buy fresh flowers',
  'Have a picnic',
  'Visit a bookstore',
  'Write a postcard',
  'Try a new cafe',
  'Take a golden hour walk',
  'Cook a special breakfast',
  'Call someone you miss',
  'Buy a sticker or pin',
  'Spend an hour offline',
  'Make a playlist',
  'Do a 20-minute stretch',
  'Get ice cream',
  'Light a nice candle',
  'Wear your favorite outfit',
  'Draw something tiny',
  'Read in the sun',
  'Plan a mini date',
  'Try a new recipe',
  'Sleep in on purpose',
  'Buy a plant',
  'Write three good things',
  'Take a scenic route home',
  'Share a treat with a friend',
  'Pick a song and dance',
] as const;

/** Rows + columns + both diagonals. */
export function maxBingoLines(size: GridSize): number {
  return size * 2 + 2;
}

function randomInt(max: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const value = bytes[0] ?? 0;
  return value % max;
}

function pickCatalogTitle(exclude: ReadonlySet<string> = new Set()): string {
  const available = REWARD_TITLES.filter((title) => !exclude.has(title));
  const pool = available.length > 0 ? available : [...REWARD_TITLES];
  return pool[randomInt(pool.length)] ?? REWARD_TITLES[0];
}

export function createReward(title: string, isMystery = false): Reward {
  return {
    id: crypto.randomUUID(),
    title,
    isMystery,
  };
}

export function createRandomReward(): Reward {
  return createReward(pickCatalogTitle(), false);
}

export function createRewardSlot(title = '', useRandom = true): RewardSlot {
  return { title, useRandom };
}

export function createDefaultRewards(mode: RewardMode = 'card'): CardRewards {
  return {
    mode,
    slots: [createRewardSlot()],
  };
}

export function createEmptySlots(count: number): RewardSlot[] {
  return Array.from({ length: Math.max(1, count) }, () => createRewardSlot());
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    const current = items[index];
    const other = items[swap];
    if (current === undefined || other === undefined) {
      continue;
    }
    items[index] = other;
    items[swap] = current;
  }
  return items;
}

export function resolveRewardSlot(
  slot: RewardSlot | undefined,
  usedTitles: ReadonlySet<string> = new Set()
): Reward {
  const trimmed = slot?.title.trim() ?? '';
  if (slot && !slot.useRandom && trimmed) {
    return createReward(trimmed, false);
  }
  return createReward(pickCatalogTitle(usedTitles), slot?.useRandom !== false && !trimmed);
}

/** Resolve slots into a shuffled assigned list for play. */
export function assignRewards(config: CardRewards): Reward[] {
  const slots =
    config.mode === 'card'
      ? [config.slots[0] ?? createRewardSlot()]
      : config.slots.length > 0
        ? [...config.slots]
        : [createRewardSlot()];

  const resolved: Reward[] = [];
  const used = new Set<string>();

  for (const slot of slots) {
    const reward = resolveRewardSlot(slot, used);
    used.add(reward.title);
    resolved.push(reward);
  }

  if (config.mode === 'perBingo' && resolved.length > 1) {
    shuffleInPlace(resolved);
  }

  return resolved;
}

export function ensureAssignedRewards(config: CardRewards): CardRewards {
  if (config.assigned && config.assigned.length > 0) {
    return config;
  }
  return { ...config, assigned: assignRewards(config) };
}

/** Reward for the n-th completed bingo line (0-based), perBingo mode only. */
export function rewardForBingoLine(config: CardRewards, lineIndex: number): Reward | undefined {
  if (config.mode !== 'perBingo') {
    return undefined;
  }
  const assigned = config.assigned ?? assignRewards(config);
  if (lineIndex < assigned.length) {
    return assigned[lineIndex];
  }
  // More bingos than written slots → catalog fill
  return createRandomReward();
}

/** Reward shown when the whole card is completed, card mode only. */
export function rewardForFullCard(config: CardRewards): Reward | undefined {
  if (config.mode !== 'card') {
    return undefined;
  }
  const assigned = config.assigned ?? assignRewards(config);
  return assigned[0] ?? createRandomReward();
}

/** @deprecated Prefer resolveRewardSlot / assignRewards. Kept for tests migrating. */
export function resolveBingoReward(reward: Reward | undefined): Reward {
  const title = reward?.title.trim();
  if (reward && title) {
    return { ...reward, title };
  }
  return createRandomReward();
}
