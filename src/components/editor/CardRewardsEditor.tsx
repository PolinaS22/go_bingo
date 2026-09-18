import { Gift, Plus, Shuffle, Trash2 } from 'lucide-react';

import {
  createEmptySlots,
  createRewardSlot,
  maxBingoLines,
} from '../../core/rewards';
import { REWARD_TITLE_MAX } from '../../core/defaults';
import { CardRewards, GridSize, RewardMode, RewardSlot } from '../../types/bingo';

import styles from './CardRewardsEditor.module.scss';

interface CardRewardsEditorProps {
  size: GridSize;
  rewards: CardRewards;
  onChange: (rewards: CardRewards) => void;
  disabled?: boolean;
}

export const CardRewardsEditor = ({
  size,
  rewards,
  onChange,
  disabled = false,
}: CardRewardsEditorProps) => {
  const maxSlots = maxBingoLines(size);

  const setMode = (mode: RewardMode) => {
    if (mode === rewards.mode) {
      return;
    }

    if (mode === 'card') {
      onChange({
        mode: 'card',
        slots: [rewards.slots[0] ?? createRewardSlot()],
      });
      return;
    }

    const slots =
      rewards.slots.length >= 2
        ? rewards.slots.slice(0, maxSlots)
        : createEmptySlots(Math.min(2, maxSlots));
    onChange({ mode: 'perBingo', slots });
  };

  const updateSlot = (index: number, patch: Partial<RewardSlot>) => {
    const slots = rewards.slots.map((slot, slotIndex) =>
      slotIndex === index ? { ...slot, ...patch } : slot
    );
    onChange({ mode: rewards.mode, slots });
  };

  const addSlot = () => {
    if (rewards.slots.length >= maxSlots) {
      return;
    }
    onChange({
      mode: 'perBingo',
      slots: [...rewards.slots, createRewardSlot()],
    });
  };

  const removeSlot = (index: number) => {
    if (rewards.slots.length <= 1) {
      return;
    }
    onChange({
      mode: 'perBingo',
      slots: rewards.slots.filter((_, slotIndex) => slotIndex !== index),
    });
  };

  return (
    <section className={styles.root}>
      <div className={styles.head}>
        <h3>
          <Gift size={16} />
          Rewards
        </h3>
        <p>
          {rewards.mode === 'card'
            ? 'One treat when you finish the whole card'
            : `Up to ${maxSlots} treats — shuffled onto each bingo`}
        </p>
      </div>

      <div className={styles.modes} role="group" aria-label="Reward mode">
        <button
          type="button"
          className={rewards.mode === 'card' ? styles.modeActive : undefined}
          aria-pressed={rewards.mode === 'card'}
          disabled={disabled}
          onClick={() => setMode('card')}
        >
          Whole card
        </button>
        <button
          type="button"
          className={rewards.mode === 'perBingo' ? styles.modeActive : undefined}
          aria-pressed={rewards.mode === 'perBingo'}
          disabled={disabled}
          onClick={() => setMode('perBingo')}
        >
          Each bingo
        </button>
      </div>

      <ul className={styles.slots}>
        {rewards.slots.map((slot, index) => (
          <li key={`reward-slot-${index}`} className={styles.slot}>
            <div className={styles.slotRow}>
              <input
                type="text"
                value={slot.useRandom ? '' : slot.title}
                maxLength={REWARD_TITLE_MAX}
                placeholder={slot.useRandom ? 'Random from the catalog' : 'Write a reward'}
                disabled={disabled || slot.useRandom}
                onChange={(event) =>
                  updateSlot(index, { title: event.target.value, useRandom: false })
                }
                aria-label={
                  rewards.mode === 'card' ? 'Card reward' : `Bingo reward ${index + 1}`
                }
              />
              {rewards.mode === 'perBingo' && rewards.slots.length > 1 ? (
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`Remove reward ${index + 1}`}
                  disabled={disabled}
                  onClick={() => removeSlot(index)}
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>
            <label className={styles.random}>
              <input
                type="checkbox"
                checked={slot.useRandom}
                disabled={disabled}
                onChange={(event) =>
                  updateSlot(index, {
                    useRandom: event.target.checked,
                    title: event.target.checked ? '' : slot.title,
                  })
                }
              />
              <Shuffle size={14} />
              Random from catalog
            </label>
          </li>
        ))}
      </ul>

      {rewards.mode === 'perBingo' && rewards.slots.length < maxSlots ? (
        <button
          type="button"
          className={styles.add}
          disabled={disabled}
          onClick={addSlot}
        >
          <Plus size={16} />
          Add reward
        </button>
      ) : null}
    </section>
  );
};
