import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Check, Plus, Upload } from 'lucide-react';
import {
  CARD_THEME_COLORS,
  isCardThemeColor,
  isLightHex,
} from '../../core/cardAppearance';
import { PRESET_BACKGROUNDS, isSameBackground } from '../../core/cellPresets';
import { blobToDataUrl, compressImage } from '../../services/storage';
import { Background, BingoCard, BingoTheme } from '../../types/bingo';
import { HomeCardPreview } from '../home/BingoPreviewCard';
import styles from './CardAppearanceStep.module.scss';

interface CardAppearanceStepProps {
  title: string;
  theme: BingoTheme;
  previewCard: BingoCard;
  onTitleChange: (value: string) => void;
  onCoverChange: (background: Background) => void;
  onColorChange: (color: string) => void;
}

export const CardAppearanceStep = ({
  title,
  theme,
  previewCard,
  onTitleChange,
  onCoverChange,
  onColorChange,
}: CardAppearanceStepProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const onColorChangeRef = useRef(onColorChange);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(() =>
    isCardThemeColor(theme.primaryColor) ? [] : [theme.primaryColor]
  );

  onColorChangeRef.current = onColorChange;

  // Native `change` fires when the picker closes; React `onChange` tracks every drag move.
  useEffect(() => {
    const input = colorInputRef.current;
    if (!input) {
      return;
    }

    const commit = () => {
      const color = input.value;
      if (!isCardThemeColor(color)) {
        setCustomColors((prev) => (prev.includes(color) ? prev : [...prev, color]));
      }
      onColorChangeRef.current(color);
    };

    input.addEventListener('change', commit);
    return () => input.removeEventListener('change', commit);
  }, []);

  const selectedImage =
    theme.globalBackground.type === 'image' ? theme.globalBackground.value : undefined;
  const hasUploadedCover = Boolean(selectedImage?.startsWith('data:'));

  const applyImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const dataUrl = await blobToDataUrl(compressed);
      onCoverChange({ type: 'image', value: dataUrl });
    } catch {
      return;
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }
    void applyImageFile(file);
  };

  const selectPreset = (src: string) => {
    const next: Background = { type: 'image', value: src };
    if (isSameBackground(theme.globalBackground, next)) {
      onCoverChange({ type: 'color', value: theme.primaryColor });
      return;
    }
    onCoverChange(next);
  };

  const swatches = [...CARD_THEME_COLORS, ...customColors];

  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Card look</h2>
            <p>this is how it appears on your board</p>
          </div>

          <label className={styles.titleField} htmlFor="card-title">
            Title
            <input
              id="card-title"
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Japan Adventure"
            />
          </label>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Cover</h2>
            <p>upload an image or pick a background</p>
          </div>

          <div className={styles.coverRow}>
            <label
              className={clsx(
                styles.upload,
                dragOver && styles.uploadActive,
                hasUploadedCover && styles.uploadSelected
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              {hasUploadedCover ? (
                <>
                  <img src={selectedImage} alt="" className={styles.uploadPreview} />
                  <span className={styles.check}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                </>
              ) : (
                <>
                  <Upload size={22} strokeWidth={1.8} />
                  <span>Upload image or drag & drop</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>

            <div className={styles.presets} role="group" aria-label="Cover presets">
              {PRESET_BACKGROUNDS.map((background) => {
                const selected = selectedImage === background.src;
                return (
                  <button
                    type="button"
                    key={background.src}
                    className={clsx(styles.preset, selected && styles.presetSelected)}
                    aria-label={background.label}
                    aria-pressed={selected}
                    onClick={() => selectPreset(background.src)}
                  >
                    <img src={background.src} alt="" />
                    <span>{background.label}</span>
                    {selected ? (
                      <span className={styles.check}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <p className={styles.hint}>Recommended size: 1600 × 1200px</p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Color theme</h2>
            <p>a soft wash for the card</p>
          </div>

          <div className={styles.swatches} role="group" aria-label="Color theme">
            {swatches.map((color) => {
              const selected = theme.primaryColor === color;
              return (
                <button
                  type="button"
                  key={color}
                  className={clsx(
                    styles.swatch,
                    selected && styles.swatchSelected,
                    isLightHex(color) && styles.swatchLight
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Theme color ${color}`}
                  aria-pressed={selected}
                  onClick={() => onColorChange(color)}
                >
                  {selected ? (
                    <Check size={14} strokeWidth={3} color={isLightHex(color) ? '#6f63e8' : '#fff'} />
                  ) : null}
                </button>
              );
            })}
            <button
              type="button"
              className={styles.addSwatch}
              aria-label="Pick a custom color"
              onClick={() => colorInputRef.current?.click()}
            >
              <Plus size={18} />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className={styles.hiddenColor}
              defaultValue={theme.primaryColor}
              tabIndex={-1}
              aria-hidden
            />
          </div>
        </section>
      </div>

      <aside className={styles.preview}>
        <div className={styles.sectionHead}>
          <h2>Preview</h2>
          <p>your card on the home board</p>
        </div>
        <div className={styles.previewStage}>
          <HomeCardPreview card={previewCard} />
        </div>
      </aside>
    </div>
  );
};
