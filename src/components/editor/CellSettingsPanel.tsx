import React from 'react';
import { BingoCell, Difficulty } from '../../types/bingo';
import styles from './CellSettingsPanel.module.scss';

interface CellSettingsPanelProps {
  cell: BingoCell;
  onChange: (updatedCell: BingoCell) => void;
  onClose: () => void;
}

export const CellSettingsPanel: React.FC<CellSettingsPanelProps> = ({
  cell,
  onChange,
  onClose,
}) => {
  const handleChange = (field: keyof BingoCell, value: any) => {
    onChange({ ...cell, [field]: value });
  };

  const handleRewardChange = (field: string, value: any) => {
    const updatedReward = { ...(cell.reward || { id: crypto.randomUUID(), title: '', isMystery: false }), [field]: value };
    onChange({ ...cell, reward: updatedReward });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Cell Settings</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            type="text"
            value={cell.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Cell title"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={cell.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Cell description"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Difficulty</label>
          <select
            value={cell.difficulty}
            onChange={(e) => handleChange('difficulty', e.target.value as Difficulty)}
          >
            <option value="NORMAL">Normal</option>
            <option value="HARD">Hard</option>
            <option value="GOLDEN">Golden</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={cell.photoRequired || false}
              onChange={(e) => handleChange('photoRequired', e.target.checked)}
            />
            Photo Required
          </label>
        </div>
        
        <div className={styles.divider} />
        
        <h4>Reward</h4>
        <div className={styles.formGroup}>
          <label>Reward Title</label>
          <input
            type="text"
            value={cell.reward?.title || ''}
            onChange={(e) => handleRewardChange('title', e.target.value)}
            placeholder="Reward title"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={cell.reward?.isMystery || false}
              onChange={(e) => handleRewardChange('isMystery', e.target.checked)}
            />
            Mystery Reward
          </label>
        </div>
      </div>
    </div>
  );
};
