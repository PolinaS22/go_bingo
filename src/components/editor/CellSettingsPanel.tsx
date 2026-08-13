import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Check, Crown, Gift, Plus, Shuffle, Star, X } from 'lucide-react';
import {
  CELL_ICON_PATHS,
  PASTEL_COLORS,
  PRESET_BACKGROUNDS,
  isPresetPastel,
  isSameBackground,
} from '../../core/cellPresets';
import { createCell } from '../../core/defaults';
import { createRandomReward } from '../../core/rewards';
import { Background, BingoCell, Difficulty, Reward } from '../../types/bingo';
import styles from './CellSettingsPanel.module.scss';

interface CellSettingsPanelProps {
  cell: BingoCell;
  onChange: (updatedCell: BingoCell) => void;
  onClose: () => void;
  disabled?: boolean;
}

const DIFFICULTIES: readonly Difficulty[] = ['NORMAL', 'HARD', 'GOLDEN'];

function emptyReward(): Reward {
  return {
    id: crypto.randomUUID(),
    title: '',
    isMystery: false,
  };
}

export const CellSettingsPanel = ({
  cell,
  onChange,
  onClose,
  disabled = false,
}: CellSettingsPanelProps) => {
  const [draft, setDraft] = useState<BingoCell>(cell);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(cell);
    setIconPickerOpen(false);

    const color = cell.customBackground?.type === 'color' ? cell.customBackground.value : undefined;
    if (color && !isPresetPastel(color)) {
      setCustomColors((prev) => (prev.includes(color) ? prev : [...prev, color]));
    }
  }, [cell]);

  const patchDraft = <K extends keyof BingoCell>(field: K, value: BingoCell[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const setDifficulty = (level: Difficulty) => {
    setDraft((prev) => ({
      ...prev,
      difficulty: level,
      photoRequired: level === 'GOLDEN' ? true : prev.photoRequired,
    }));
  };

  const patchReward = <K extends keyof Reward>(field: K, value: Reward[K]) => {
    setDraft((prev) => {
      const currentReward = prev.reward ?? emptyReward();
      return { ...prev, reward: { ...currentReward, [field]: value } };
    });
  };

  const selectBackground = (background: Background) => {
    patchDraft(
      'customBackground',
      isSameBackground(draft.customBackground, background) ? undefined : background
    );
  };

  const handleCustomColor = (value: string) => {
    if (!isPresetPastel(value)) {
      setCustomColors((prev) => (prev.includes(value) ? prev : [...prev, value]));
    }
    patchDraft('customBackground', { type: 'color', value });
  };

  const handleSave = () => {
    const rewardTitle = draft.reward?.title.trim() ?? '';
    const nextReward =
      draft.reward && rewardTitle.length > 0
        ? { ...draft.reward, title: rewardTitle }
        : createRandomReward();

    onChange({
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      photoRequired: draft.difficulty === 'GOLDEN' ? true : draft.photoRequired,
      reward: nextReward,
    });
    onClose();
  };

  const handleDelete = () => {
    onChange({
      ...createCell(cell.position),
      id: cell.id,
    });
    onClose();
  };

  const selectedColor =
    draft.customBackground?.type === 'color' ? draft.customBackground.value : undefined;
  const selectedImage =
    draft.customBackground?.type === 'image' ? draft.customBackground.value : undefined;

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close cell settings"
      />
      <aside className={styles.panel} role="dialog" aria-labelledby="cell-settings-title">
        <div className={styles.header}>
          <h3 id="cell-settings-title">Edit Cell</h3>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <span className={styles.label}>Challenge</span>
            <input
              id="cell-title"
              type="text"
              value={draft.title}
              onChange={(event) => patchDraft('title', event.target.value)}
              placeholder="Visit a shrine"
              disabled={disabled}
            />
            <textarea
              id="cell-description"
              value={draft.description ?? ''}
              onChange={(event) => patchDraft('description', event.target.value)}
              placeholder="Find and visit a beautiful shrine. Take a moment to enjoy the atmosphere."
              disabled={disabled}
            />
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Icon</span>
            <div className={styles.iconRow}>
              <div className={styles.iconPreview}>
                {draft.icon ? (
                  <img src={draft.icon} alt="" />
                ) : (
                  <span className={styles.iconPlaceholder}>?</span>
                )}
              </div>
              <button
                type="button"
                className={styles.changeIcon}
                onClick={() => setIconPickerOpen((open) => !open)}
                disabled={disabled}
              >
                Change Icon
              </button>
            </div>
            {iconPickerOpen && (
              <div className={styles.iconGrid} role="listbox" aria-label="Cell icons">
                {CELL_ICON_PATHS.map((path) => (
                  <button
                    type="button"
                    key={path}
                    role="option"
                    aria-selected={draft.icon === path}
                    className={clsx(styles.iconOption, draft.icon === path && styles.iconSelected)}
                    onClick={() => {
                      patchDraft('icon', draft.icon === path ? undefined : path);
                      setIconPickerOpen(false);
                    }}
                    disabled={disabled}
                  >
                    <img src={path} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Difficulty</span>
            <div className={styles.difficultyGroup} role="group" aria-label="Difficulty">
              {DIFFICULTIES.map((level) => (
                <button
                  type="button"
                  key={level}
                  className={clsx(
                    styles.difficultyButton,
                    draft.difficulty === level && styles.difficultyActive,
                    level === 'GOLDEN' && styles.difficultyGolden
                  )}
                  aria-pressed={draft.difficulty === level}
                  onClick={() => setDifficulty(level)}
                  disabled={disabled}
                >
                  {level === 'GOLDEN' && <Star size={14} fill="currentColor" />}
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Background</span>
            <div className={styles.swatchRow} role="group" aria-label="Background colors">
              {PASTEL_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={clsx(styles.swatch, selectedColor === color && styles.swatchSelected)}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                  aria-pressed={selectedColor === color}
                  onClick={() => selectBackground({ type: 'color', value: color })}
                  disabled={disabled}
                >
                  {selectedColor === color && <Check size={14} />}
                </button>
              ))}
              {customColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={clsx(styles.swatch, selectedColor === color && styles.swatchSelected)}
                  style={{ backgroundColor: color }}
                  aria-label={`Custom color ${color}`}
                  aria-pressed={selectedColor === color}
                  onClick={() => selectBackground({ type: 'color', value: color })}
                  disabled={disabled}
                >
                  {selectedColor === color && <Check size={14} />}
                </button>
              ))}
              <button
                type="button"
                className={styles.addSwatch}
                onClick={() => colorInputRef.current?.click()}
                disabled={disabled}
                aria-label="Pick a custom color"
              >
                <Plus size={18} />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                className={styles.hiddenColor}
                value={selectedColor ?? '#C0504D'}
                onChange={(event) => handleCustomColor(event.target.value)}
                tabIndex={-1}
                aria-hidden
              />
            </div>
            <div className={styles.swatchRow} role="group" aria-label="Background images">
              {PRESET_BACKGROUNDS.map((background) => (
                <button
                  type="button"
                  key={background.src}
                  className={clsx(
                    styles.imageSwatch,
                    selectedImage === background.src && styles.swatchSelected
                  )}
                  aria-label={background.label}
                  aria-pressed={selectedImage === background.src}
                  onClick={() => selectBackground({ type: 'image', value: background.src })}
                  disabled={disabled}
                >
                  <img src={background.src} alt="" />
                  {selectedImage === background.src && (
                    <span className={styles.imageCheck}>
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
              <div className={styles.photoHint}>
                A completion photo becomes the cell background after the challenge is done.
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Reward (hidden until completed)</span>
            <div className={styles.rewardRow}>
              <input
                id="reward-title"
                type="text"
                value={draft.reward?.title ?? ''}
                onChange={(event) => patchReward('title', event.target.value)}
                placeholder="Empty = random surprise reward"
                disabled={disabled}
              />
              <button
                type="button"
                className={styles.giftButton}
                aria-label="Pick a random reward"
                onClick={() => {
                  const reward = createRandomReward();
                  setDraft((prev) => ({ ...prev, reward }));
                }}
                disabled={disabled}
              >
                <Shuffle size={18} />
              </button>
              <button
                type="button"
                className={clsx(
                  styles.giftButton,
                  draft.reward?.isMystery && styles.giftActive
                )}
                aria-pressed={draft.reward?.isMystery ?? false}
                aria-label="Mystery reward"
                onClick={() => patchReward('isMystery', !(draft.reward?.isMystery ?? false))}
                disabled={disabled}
              >
                <Gift size={18} />
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Photo</span>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={draft.photoRequired}
                onChange={(event) => patchDraft('photoRequired', event.target.checked)}
                disabled={disabled}
              />
              <span className={styles.box}>
                {draft.photoRequired && <Check size={14} />}
              </span>
              <span>Photo required to complete</span>
            </label>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Golden Challenge</span>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={draft.difficulty === 'GOLDEN'}
                onChange={(event) =>
                  setDifficulty(event.target.checked ? 'GOLDEN' : 'NORMAL')
                }
                disabled={disabled}
              />
              <span className={styles.box}>
                {draft.difficulty === 'GOLDEN' && <Check size={14} />}
              </span>
              <span>This is a Golden Challenge</span>
              <Crown size={18} className={styles.crown} />
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={disabled}
          >
            Delete Cell
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={disabled}
          >
            Save Changes
          </button>
        </div>
      </aside>
    </div>
  );
};
