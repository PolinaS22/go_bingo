import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Check, Plus, Star, X } from 'lucide-react';

import {
  CELL_ICON_PATHS,
  isPresetPastel,
  isSameBackground,
  PASTEL_COLORS,
  PRESET_BACKGROUNDS,
} from '../../core/cellPresets';
import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_TITLE_MAX,
  createCell,
} from '../../core/defaults';
import { Background, BingoCell, Difficulty } from '../../types/bingo';

import styles from './CellSettingsPanel.module.scss';

interface CellSettingsPanelProps {
  cell: BingoCell;
  onChange: (updatedCell: BingoCell) => void;
  onClose: () => void;
  disabled?: boolean;
}

const DIFFICULTIES: readonly { id: Difficulty; label: string }[] = [
  { id: 'NORMAL', label: 'Normal' },
  { id: 'HARD', label: 'Hard' },
  { id: 'GOLDEN', label: 'Golden' },
];

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
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    setDraft(cell);
    setIconPickerOpen(false);

    const color = cell.customBackground?.type === 'color' ? cell.customBackground.value : undefined;
    if (color && !isPresetPastel(color)) {
      setCustomColors((prev) => (prev.includes(color) ? prev : [...prev, color]));
    }
  }, [cell]);

  // Native `change` fires when the picker closes; React `onChange` tracks every drag move.
  useEffect(() => {
    const input = colorInputRef.current;
    if (!input) {
      return;
    }

    const commit = () => {
      const value = input.value;
      if (!isPresetPastel(value)) {
        setCustomColors((prev) => (prev.includes(value) ? prev : [...prev, value]));
      }
      setDraft({
        ...draftRef.current,
        customBackground: { type: 'color', value },
      });
    };

    input.addEventListener('change', commit);
    return () => input.removeEventListener('change', commit);
  }, []);

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

  const selectBackground = (background: Background) => {
    patchDraft(
      'customBackground',
      isSameBackground(draft.customBackground, background) ? undefined : background
    );
  };

  const handleSave = () => {
    onChange({
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      photoRequired: draft.difficulty === 'GOLDEN' ? true : draft.photoRequired,
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
  const isGolden = draft.difficulty === 'GOLDEN';
  const photoOn = isGolden || draft.photoRequired;
  const titleLength = draft.title.length;
  const descriptionLength = (draft.description ?? '').length;

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
          <h3 id="cell-settings-title">
            <span className={styles.titleDesktop}>Cell details</span>
            <span className={styles.titleMobile}>Edit cell</span>
          </h3>
          <button
            type="button"
            className={styles.doneHeader}
            onClick={handleSave}
            disabled={disabled}
          >
            Done
          </button>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
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
                Change
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
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="cell-title">
                Challenge title
              </label>
              <span className={styles.counter}>
                {titleLength}/{CHALLENGE_TITLE_MAX}
              </span>
            </div>
            <input
              id="cell-title"
              type="text"
              value={draft.title}
              maxLength={CHALLENGE_TITLE_MAX}
              onChange={(event) => patchDraft('title', event.target.value)}
              placeholder="Visit a shrine"
              disabled={disabled}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="cell-description">
                Description (optional)
              </label>
              <span className={styles.counter}>
                {descriptionLength}/{CHALLENGE_DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              id="cell-description"
              value={draft.description ?? ''}
              maxLength={CHALLENGE_DESCRIPTION_MAX}
              onChange={(event) => patchDraft('description', event.target.value)}
              placeholder="Find and visit a beautiful shrine."
              disabled={disabled}
            />
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Difficulty</span>
            <div className={styles.difficultyGroup} role="group" aria-label="Difficulty">
              {DIFFICULTIES.map((level) => (
                <button
                  type="button"
                  key={level.id}
                  className={clsx(
                    styles.difficultyButton,
                    draft.difficulty === level.id && styles.difficultyActive,
                    level.id === 'GOLDEN' && styles.difficultyGolden
                  )}
                  aria-pressed={draft.difficulty === level.id}
                  onClick={() => setDifficulty(level.id)}
                  disabled={disabled}
                >
                  {level.id === 'GOLDEN' && <Star size={14} fill="currentColor" />}
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.label}>Photo required</span>
                <p className={styles.hint}>
                  {isGolden
                    ? 'Required for Golden challenges.'
                    : 'Optional. Recommended for Hard and required for Golden.'}
                </p>
              </div>
              <button
                type="button"
                className={styles.switch}
                role="switch"
                aria-checked={photoOn}
                aria-label="Photo required"
                disabled={disabled || isGolden}
                onClick={() => patchDraft('photoRequired', !draft.photoRequired)}
              />
            </div>
          </div>

          <div className={clsx(styles.section, styles.desktopOnly)}>
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
                defaultValue={selectedColor ?? '#C9B8E8'}
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
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={disabled}
          >
            Clear cell
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={disabled}
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
};
