import React, { useState } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { Difficulty, BingoTheme } from '../types/bingo';
import styles from './EditorView.module.scss';

export const EditorView: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const { addCard } = useBingoStore();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const defaultTheme: BingoTheme = {
    id: 'default',
    name: 'Default',
    primaryColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  };

  const handleCreate = () => {
    const newCard = {
      id: crypto.randomUUID(),
      title,
      difficulty,
      cells: [], // Will be filled by engine/logic usually
      theme: defaultTheme,
      size: 5,
      createdAt: Date.now(),
    };
    addCard(newCard as any);
    onSave();
  };

  return (
    <div className={styles.container}>
      <h1>Create New Bingo Card</h1>
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
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <button className={styles.saveButton} onClick={handleCreate}>
        Save Bingo Card
      </button>
    </div>
  );
};
