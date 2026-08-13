import { BingoCell, Reward } from '../types/bingo';

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

function randomInt(max: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const value = bytes[0] ?? 0;
  return value % max;
}

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = randomInt(index + 1);
    const current = copy[index];
    const other = copy[swapWith];
    if (current === undefined || other === undefined) {
      continue;
    }
    copy[index] = other;
    copy[swapWith] = current;
  }
  return copy;
}

export function createReward(title: string, isMystery = true): Reward {
  return {
    id: crypto.randomUUID(),
    title,
    isMystery,
  };
}

export function createRandomReward(exclude: ReadonlySet<string> = new Set()): Reward {
  const pool = REWARD_TITLES.filter((title) => !exclude.has(title));
  const source = pool.length > 0 ? pool : REWARD_TITLES;
  const title = source[randomInt(source.length)] ?? REWARD_TITLES[0];
  return createReward(title, true);
}

export function fillEmptyRewards(cells: BingoCell[]): BingoCell[] {
  const used = new Set(
    cells
      .map((cell) => cell.reward?.title.trim())
      .filter((title): title is string => title !== undefined && title.length > 0)
  );

  return cells.map((cell) => {
    const existingTitle = cell.reward?.title.trim();
    if (existingTitle) {
      return cell;
    }

    const reward = createRandomReward(used);
    used.add(reward.title);
    return { ...cell, reward };
  });
}

export function dealRewardsToCells(cells: BingoCell[]): BingoCell[] {
  const titles = shuffled(REWARD_TITLES);
  return cells.map((cell, index) => {
    const title = titles[index % titles.length] ?? REWARD_TITLES[0];
    return { ...cell, reward: createReward(title, true) };
  });
}
