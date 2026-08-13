import React, { useState, useEffect } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { Difficulty, BingoTheme, BingoCell, BingoCard } from '../types/bingo';
import { CellSettingsPanel } from '../components/editor/CellSettingsPanel';
import styles from './EditorView.module.scss';

export const EditorView: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { addCard } = useBingoStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState(5);
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const defaultTheme: BingoTheme = {
    primaryColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: 8,
    cellStyle: 'solid',
    globalBackground: { type: 'color', value: '#f3f4f6' }
  };

  // Initialize cells based on size
  useEffect(() => {
    setCells((prevCells) => {
      const newCellsCount = size * size;
      const updatedCells = [...prevCells].slice(0, newCellsCount);

      for (let i = updatedCells.length; i < newCellsCount; i++) {
        updatedCells.push({
          id: crypto.randomUUID(),
          title: `Cell ${i + 1}`,
          difficulty: 'NORMAL',
          photoRequired: false,
        });
      }
      return updatedCells;
    });
  }, [size]);

  const handleCellClick = (id: string) => {
    setSelectedCellId(id);
  };

  const handleCellChange = (updatedCell: BingoCell) => {
    setCells(cells.map(c => c.id === updatedCell.id ? updatedCell : c));
  };

  const handleCreate = () => {
    const newCard: BingoCard = {
      id: crypto.randomUUID(),
      title,
      description,
      size,
      cells,
      theme: defaultTheme,
      isFrozen: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCard(newCard);
    onSave();
  };

  const selectedCell = cells.find(c => c.id === selectedCellId);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.mainContent}>
        <h1>Create New Bingo Card</h1>
        <div className={styles.topControls}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bingo title"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="size">Grid Size</label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
            >
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
              <option value={5}>5x5</option>
            </select>
          </div>
        </div>

        <div 
          className={styles.grid} 
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {cells.map((cell) => (
            <div
              key={cell.id}
              className={`${styles.cell} ${selectedCellId === cell.id ? styles.selected : ''}`}
              onClick={() => handleCellClick(cell.id)}
            >
              <span className={styles.cellTitle}>{cell.title}</span>
              <span className={styles.cellDifficulty}>{cell.difficulty}</span>
            </div>
          ))}
        </div>

        <button className={styles.saveButton} onClick={handleCreate}>
          Save Bingo Card
        </button>
      </div>

      {selectedCell && (
        <CellSettingsPanel
          cell={selectedCell}
          onChange={handleCellChange}
          onClose={() => setSelectedCellId(null)}
        />
      )}
    </div>
  );
};
