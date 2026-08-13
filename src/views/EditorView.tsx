import { useEffect, useState } from 'react';
import { Eye, Gift, Palette, Pencil } from 'lucide-react';
import { BingoCardSheet } from '../components/bingo/BingoCardSheet';
import { CellSettingsPanel } from '../components/editor/CellSettingsPanel';
import { PASTEL_COLORS } from '../core/cellPresets';
import {
  DEFAULT_THEME,
  GRID_SIZES,
  createCells,
  hasCardProgress,
  isCellCompleted,
  resizeCells,
} from '../core/defaults';
import { dealRewardsToCells, fillEmptyRewards } from '../core/rewards';
import { useBingoStore } from '../store/useBingoStore';
import { BingoCard, BingoCell, BingoTheme, GridSize } from '../types/bingo';
import styles from './EditorView.module.scss';

interface EditorViewProps {
  onSave: () => void;
  cardId: string | null;
}

export const EditorView = ({ onSave, cardId }: EditorViewProps) => {
  const { addCard, updateCard, cards } = useBingoStore();
  const existing = cardId ? (cards.find((card) => card.id === cardId) ?? null) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<GridSize>(5);
  const [cells, setCells] = useState<BingoCell[]>(() => createCells(5));
  const [theme, setTheme] = useState<BingoTheme>(DEFAULT_THEME);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const playStarted = existing?.isFrozen === true || hasCardProgress(cells);
  const canSave = title.trim().length > 0 && cells.length === size * size;

  useEffect(() => {
    if (!cardId) {
      setTitle('');
      setDescription('');
      setSize(5);
      setCells(createCells(5));
      setTheme(DEFAULT_THEME);
      setSelectedCellId(null);
      setIsPreview(false);
      setThemeOpen(false);
      return;
    }

    if (!existing) {
      return;
    }

    setTitle(existing.title);
    setDescription(existing.description ?? '');
    setSize(existing.size);
    setCells(existing.cells);
    setTheme(existing.theme);
    setSelectedCellId(null);
    setIsPreview(false);
    setThemeOpen(false);
  }, [cardId, existing]);

  const persistExisting = (
    nextCells: BingoCell[],
    nextTheme: BingoTheme,
    nextTitle: string,
    nextDescription: string,
    nextSize: GridSize
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
      updatedAt: Date.now(),
    });
  };

  const handleSizeChange = (nextSize: GridSize) => {
    if (playStarted) {
      return;
    }

    setSize(nextSize);
    setCells((prev) => resizeCells(prev, nextSize));
    setSelectedCellId(null);
  };

  const handleCellChange = (updatedCell: BingoCell) => {
    setCells((prev) => {
      const next = prev.map((cell) => (cell.id === updatedCell.id ? updatedCell : cell));
      persistExisting(next, theme, title, description, size);
      return next;
    });
  };

  const handleThemeColor = (color: string) => {
    setTheme((prev) => {
      const next = {
        ...prev,
        primaryColor: color,
        globalBackground: { type: 'color' as const, value: color },
      };
      persistExisting(cells, next, title, description, size);
      return next;
    });
  };

  const handleFillRewards = () => {
    setCells((prev) => {
      const hasEmpty = prev.some((cell) => !cell.reward?.title.trim());
      const next = playStarted || hasEmpty ? fillEmptyRewards(prev) : dealRewardsToCells(prev);
      persistExisting(next, theme, title, description, size);
      return next;
    });
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const normalizedCells = fillEmptyRewards(
      cells.map((cell, position) => ({ ...cell, position }))
    );
    const now = Date.now();

    if (existing) {
      const updated: BingoCard = {
        ...existing,
        title: title.trim(),
        description: description.trim() || undefined,
        size,
        cells: normalizedCells,
        theme,
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
        isFrozen: false,
        createdAt: now,
        updatedAt: now,
      };
      addCard(created);
    }

    onSave();
  };

  const selectedCell = cells.find((cell) => cell.id === selectedCellId);
  const selectedLocked = selectedCell ? isCellCompleted(selectedCell.completedAt) : false;
  const pageTitle = existing ? 'Edit Bingo Card' : 'Create New Bingo Card';

  return (
    <div className={`${styles.editorContainer} ${selectedCell ? styles.panelOpen : ''}`}>
      <div className={styles.mainContent}>
        <h1>{pageTitle}</h1>

        {playStarted && (
          <p className={styles.frozenNotice}>
            Play has started. Completed cells stay as they are. Theme and open challenges can still change.
          </p>
        )}

        {!isPreview && (
          <div className={styles.topControls}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Japan Adventure"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional description"
              />
            </div>
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
          </div>
        )}

        <BingoCardSheet
          title={title}
          size={size}
          cells={cells}
          createdAt={existing?.createdAt}
          selectedCellId={selectedCellId}
          onCellClick={(cellId) => {
            if (!isPreview) {
              setSelectedCellId(cellId);
            }
          }}
          accentColor={theme.primaryColor}
          paperColor={theme.backgroundColor}
        />

        {themeOpen && (
          <div className={styles.themePanel} role="group" aria-label="Theme colors">
            {PASTEL_COLORS.map((color) => (
              <button
                type="button"
                key={color}
                className={theme.primaryColor === color ? styles.themeActive : undefined}
                style={{ backgroundColor: color }}
                aria-label={`Theme color ${color}`}
                onClick={() => handleThemeColor(color)}
              />
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setThemeOpen((open) => !open);
              setIsPreview(false);
            }}
          >
            <Palette size={16} />
            Theme
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={handleFillRewards}
          >
            <Gift size={16} />
            Fill Rewards
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setIsPreview((open) => !open);
              setThemeOpen(false);
              setSelectedCellId(null);
            }}
          >
            <Eye size={16} />
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!canSave}
          >
            <Pencil size={16} />
            {existing ? 'Save Changes' : 'Save Bingo Card'}
          </button>
        </div>
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
