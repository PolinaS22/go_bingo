import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';

import { BingoCardSheet } from '../components/bingo/BingoCardSheet';
import { CardAppearanceStep } from '../components/editor/CardAppearanceStep';
import { CardRewardsEditor } from '../components/editor/CardRewardsEditor';
import { CellSettingsPanel } from '../components/editor/CellSettingsPanel';
import { EditorStep, EditorStepper } from '../components/editor/EditorStepper';
import { useBingoStore } from '../store/useBingoStore';

import { CARD_THEME_COLORS } from '../core/cardAppearance';
import {
  countChallenges,
  createCells,
  DEFAULT_THEME,
  GRID_SIZES,
  hasCardProgress,
  isCellCompleted,
  resizeCells,
} from '../core/defaults';
import { getHomeCardStatus } from '../core/homeCard';
import { createDefaultRewards, createRewardSlot, maxBingoLines } from '../core/rewards';
import {
  Background,
  BingoCard,
  BingoCell,
  BingoTheme,
  CardRewards,
  GridSize,
} from '../types/bingo';

import styles from './EditorView.module.scss';

interface EditorViewProps {
  onSave: () => void;
  onBack: () => void;
  cardId: string | null;
}

const INITIAL_THEME: BingoTheme = {
  ...DEFAULT_THEME,
  primaryColor: CARD_THEME_COLORS[0],
  globalBackground: { type: 'color', value: CARD_THEME_COLORS[0] },
};

const STATUS_LABEL = {
  active: 'Active',
  draft: 'Draft',
  completed: 'Completed',
} as const;

function clampRewardsToSize(rewards: CardRewards, size: GridSize): CardRewards {
  if (rewards.mode === 'card') {
    return {
      mode: 'card',
      slots: [rewards.slots[0] ?? createRewardSlot()],
    };
  }

  const max = maxBingoLines(size);
  return {
    mode: 'perBingo',
    slots: rewards.slots.slice(0, max),
  };
}

export const EditorView = ({ onSave, onBack, cardId }: EditorViewProps) => {
  const { addCard, updateCard, cards } = useBingoStore();
  const existing = cardId ? (cards.find((card) => card.id === cardId) ?? null) : null;
  const draftIdRef = useRef(crypto.randomUUID());

  const [step, setStep] = useState<EditorStep>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<GridSize>(5);
  const [cells, setCells] = useState<BingoCell[]>(() => createCells(5));
  const [theme, setTheme] = useState<BingoTheme>(INITIAL_THEME);
  const [rewards, setRewards] = useState<CardRewards>(() => createDefaultRewards('card'));
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const playStarted = existing?.isFrozen === true || hasCardProgress(cells);
  const canContinue = title.trim().length > 0;
  const canSave = canContinue && cells.length === size * size;

  useEffect(() => {
    setStep(1);
    setSelectedCellId(null);

    if (!cardId) {
      draftIdRef.current = crypto.randomUUID();
      setTitle('');
      setDescription('');
      setSize(5);
      setCells(createCells(5));
      setTheme(INITIAL_THEME);
      setRewards(createDefaultRewards('card'));
      return;
    }

    const card = useBingoStore.getState().cards.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    setTitle(card.title);
    setDescription(card.description ?? '');
    setSize(card.size);
    setCells(card.cells);
    setTheme(card.theme);
    setRewards(clampRewardsToSize(card.rewards, card.size));
  }, [cardId]);

  const persistExisting = (
    nextCells: BingoCell[],
    nextTheme: BingoTheme,
    nextTitle: string,
    nextDescription: string,
    nextSize: GridSize,
    nextRewards: CardRewards
  ) => {
    if (!existing) {
      return;
    }

    updateCard({
      ...existing,
      title: nextTitle.trim() || existing.title,
      description: nextDescription.trim() || undefined,
      size: nextSize,
      cells: nextCells.map((cell, position) => ({ ...cell, position })),
      theme: nextTheme,
      rewards: clampRewardsToSize(nextRewards, nextSize),
      updatedAt: Date.now(),
    });
  };

  const handleSizeChange = (nextSize: GridSize) => {
    if (playStarted) {
      return;
    }

    const nextCells = resizeCells(cells, nextSize);
    const nextRewards = clampRewardsToSize(rewards, nextSize);
    setSize(nextSize);
    setCells(nextCells);
    setRewards(nextRewards);
    persistExisting(nextCells, theme, title, description, nextSize, nextRewards);
    setSelectedCellId(null);
  };

  const handleCellChange = (updatedCell: BingoCell) => {
    setCells((prev) => {
      const next = prev.map((cell) => (cell.id === updatedCell.id ? updatedCell : cell));
      persistExisting(next, theme, title, description, size, rewards);
      return next;
    });
  };

  const applyTheme = (next: BingoTheme) => {
    setTheme(next);
    persistExisting(cells, next, title, description, size, rewards);
  };

  const handleThemeColor = (color: string) => {
    applyTheme({
      ...theme,
      primaryColor: color,
      globalBackground:
        theme.globalBackground.type === 'image'
          ? theme.globalBackground
          : { type: 'color', value: color },
    });
  };

  const handleCoverChange = (background: Background) => {
    applyTheme({ ...theme, globalBackground: background });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    persistExisting(cells, theme, value, description, size, rewards);
  };

  const handleRewardsChange = (next: CardRewards) => {
    const clamped = clampRewardsToSize(next, size);
    setRewards(clamped);
    persistExisting(cells, theme, title, description, size, clamped);
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const normalizedCells = cells.map((cell, position) => ({
      ...cell,
      position,
      photoRequired: cell.difficulty === 'GOLDEN' ? true : cell.photoRequired,
    }));
    const now = Date.now();
    const nextRewards = clampRewardsToSize(rewards, size);

    if (existing) {
      const updated: BingoCard = {
        ...existing,
        title: title.trim(),
        description: description.trim() || undefined,
        size,
        cells: normalizedCells,
        theme,
        rewards: nextRewards,
        updatedAt: now,
      };
      updateCard(updated);
    } else {
      const created: BingoCard = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim() || undefined,
        size,
        cells: normalizedCells,
        theme,
        rewards: nextRewards,
        isFrozen: false,
        createdAt: now,
        updatedAt: now,
      };
      addCard(created);
    }

    onSave();
  };

  const goToBingoStep = () => {
    if (!canContinue) {
      return;
    }
    setStep(2);
  };

  const handleStepSelect = (next: EditorStep) => {
    if (next === 2 && !canContinue) {
      return;
    }
    setSelectedCellId(null);
    setStep(next);
  };

  const handleHeaderBack = () => {
    if (step === 2) {
      setSelectedCellId(null);
      setStep(1);
      return;
    }
    onBack();
  };

  const selectedCell = cells.find((cell) => cell.id === selectedCellId);
  const selectedLocked = selectedCell ? isCellCompleted(selectedCell.completedAt) : false;
  const isEditing = existing !== null;
  const pageTitle = isEditing ? 'Edit Bingo' : 'Create New Bingo';
  const challengeCount = countChallenges(cells);

  const previewCard: BingoCard = {
    id: existing?.id ?? draftIdRef.current,
    title: title.trim() || 'Your Bingo',
    description: description.trim() || undefined,
    size,
    cells,
    theme,
    rewards,
    isFrozen: existing?.isFrozen ?? false,
    createdAt: existing?.createdAt ?? 0,
    updatedAt: existing?.updatedAt ?? 0,
    completedAt: existing?.completedAt,
  };

  const status = getHomeCardStatus(previewCard);
  const challengeLabel = challengeCount === 1 ? 'challenge' : 'challenges';

  return (
    <div className={`${styles.editorContainer} ${selectedCell ? styles.panelOpen : ''}`}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label="Back"
            onClick={handleHeaderBack}
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.heading}>
            {step === 1 ? (
              <>
                <h1>
                  {pageTitle}
                  <span className={styles.titleSparkle} aria-hidden="true" />
                </h1>
                <p>{isEditing ? 'tweak the look of this card' : "let's build your next adventure"}</p>
              </>
            ) : (
              <>
                <h1 className={styles.mobilePageTitle}>
                  {pageTitle}
                  <span className={styles.titleSparkle} aria-hidden="true" />
                </h1>
                <label className={styles.inlineTitle} htmlFor="bingo-title">
                  <input
                    id="bingo-title"
                    type="text"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Japan Adventure"
                    aria-label="Card title"
                  />
                  <Pencil size={16} aria-hidden />
                </label>
                <p>
                  {STATUS_LABEL[status]} • {challengeCount} {challengeLabel}
                </p>
              </>
            )}
          </div>
        </header>

        <EditorStepper step={step} onStepSelect={handleStepSelect} />

        {step === 1 ? (
          <>
            <CardAppearanceStep
              title={title}
              theme={theme}
              previewCard={previewCard}
              onTitleChange={handleTitleChange}
              onCoverChange={handleCoverChange}
              onColorChange={handleThemeColor}
            />
            <div className={styles.continueRow}>
              <button
                type="button"
                className={styles.continueButton}
                onClick={goToBingoStep}
                disabled={!canContinue}
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {playStarted && (
              <p className={styles.frozenNotice}>
                Play has started. Completed cells stay as they are. Theme and open challenges can still
                change.
              </p>
            )}

            <p className={styles.editHint}>
              <span className={styles.hintDesktop}>click a cell to edit</span>
              <span className={styles.hintMobile}>tap a cell to edit</span>
            </p>

            <BingoCardSheet
              card={previewCard}
              selectedCellId={selectedCellId}
              onCellClick={setSelectedCellId}
              variant="edit"
            />

            <div className={styles.bingoMeta}>
              <fieldset className={styles.sizeGroup}>
                <legend>Grid Size</legend>
                <div className={styles.sizeButtons}>
                  {GRID_SIZES.map((gridSize) => (
                    <button
                      type="button"
                      key={gridSize}
                      className={size === gridSize ? styles.sizeActive : undefined}
                      aria-pressed={size === gridSize}
                      onClick={() => handleSizeChange(gridSize)}
                      disabled={playStarted}
                    >
                      {gridSize}x{gridSize}
                    </button>
                  ))}
                </div>
              </fieldset>

              <CardRewardsEditor
                size={size}
                rewards={rewards}
                onChange={handleRewardsChange}
                disabled={playStarted}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={!canSave}
              >
                {existing ? 'Save Changes' : 'Save Bingo Card'}
              </button>
            </div>
          </>
        )}
      </div>

      {selectedCell && (
        <CellSettingsPanel
          cell={selectedCell}
          onChange={handleCellChange}
          onClose={() => setSelectedCellId(null)}
          disabled={selectedLocked}
        />
      )}
    </div>
  );
};
