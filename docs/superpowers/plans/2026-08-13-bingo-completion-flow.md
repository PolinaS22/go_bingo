# Bingo Completion Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the completion flow for Bingo cells, including photo upload, compression, reward display, and line completion celebrations.

**Architecture:** Option A (Single `CompletionModal` for both completing and viewing cells), utilizing `framer-motion` for animations and IndexedDB for photo storage. Detection of new bingo lines in `PlayView` to trigger celebrations.

**Tech Stack:** React, TypeScript, SCSS Modules, Zustand, Framer Motion, idb-keyval.

## Global Constraints
- Use SCSS Modules.
- Mimic existing styles.
- TDD where possible.
- Use `framer-motion` for animations.

---

### Task 1: Scaffolding and types

**Files:**
- Create: `src/components/bingo/CompletionModal.tsx`
- Create: `src/components/bingo/CompletionModal.module.scss`

**Interfaces:**
- `CompletionModalProps`: `{ cell: BingoCell; onClose: () => void; onComplete: (photoId?: string) => void; }`

- [ ] **Step 1: Create `CompletionModal.tsx`.**

```tsx
import React, { useState, useEffect } from 'react';
import { BingoCell } from '../../types/bingo';
import { compressImage, savePhoto, getPhoto } from '../../services/storage';
import styles from './CompletionModal.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletionModalProps {
  cell: BingoCell;
  onClose: () => void;
  onComplete: (photoId?: string) => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ cell, onClose, onComplete }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    if (cell.isCompleted && cell.photoId) {
      getPhoto(cell.photoId).then((blob) => {
        if (blob) {
          url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        }
      });
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [cell.isCompleted, cell.photoId]);

  const handleComplete = async () => {
    let photoId = undefined;
    if (selectedFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(selectedFile);
        photoId = crypto.randomUUID();
        await savePhoto(photoId, compressed);
      } catch (e) {
        console.error('Photo processing failed', e);
      } finally {
        setIsCompressing(false);
      }
    }
    onComplete(photoId);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{cell.title}</h2>
        <div className={styles.content}>
            {cell.description && <p className={styles.description}>{cell.description}</p>}
            
            {cell.reward && (
                <div className={styles.rewardSection}>
                    <h4>Reward</h4>
                    <p className={styles.rewardTitle}>
                        {cell.reward.isMystery && !cell.isCompleted ? '🎁 Mystery Reward' : cell.reward.title}
                    </p>
                    {(!cell.reward.isMystery || cell.isCompleted) && cell.reward.description && (
                        <p className={styles.rewardDesc}>{cell.reward.description}</p>
                    )}
                </div>
            )}

            {!cell.isCompleted ? (
              <div className={styles.actionArea}>
                <div className={styles.uploadBox}>
                    <label>
                        {selectedFile ? selectedFile.name : 'Choose Photo (Required if marked)'}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                            hidden
                        />
                    </label>
                </div>
                <button 
                  className={styles.completeBtn}
                  disabled={isCompressing || (cell.photoRequired && !selectedFile)} 
                  onClick={handleComplete}
                >
                  {isCompressing ? 'Processing...' : 'Complete Challenge'}
                </button>
              </div>
            ) : (
              <div className={styles.previewArea}>
                {photoUrl ? (
                    <img src={photoUrl} className={styles.photo} alt="Memory" />
                ) : (
                    <div className={styles.photoPlaceholder}>No photo uploaded</div>
                )}
                <button className={styles.closeBtn} onClick={onClose}>Done</button>
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};
```

- [ ] **Step 2: Create `CompletionModal.module.scss`.**

```scss
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  color: #1a1a1a;

  h2 { margin: 0 0 16px; font-size: 1.5rem; }
}

.closeButton {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.description { color: #555; line-height: 1.5; }

.rewardSection {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 12px;
    padding: 16px;

    h4 { margin: 0 0 8px; color: #0369a1; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .rewardTitle { font-weight: bold; margin: 0; }
    .rewardDesc { margin: 4px 0 0; font-size: 0.9rem; color: #666; }
}

.actionArea, .previewArea {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.uploadBox {
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover { border-color: #3b82f6; }
    label { cursor: pointer; display: block; width: 100%; }
}

.completeBtn, .closeBtn {
    background: #3b82f6;
    color: #fff;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.9; }
    &:disabled { background: #d1d5db; cursor: not-allowed; }
}

.photo {
    width: 100%;
    border-radius: 12px;
    max-height: 320px;
    object-fit: cover;
}
```

- [ ] **Step 3: Commit.**

---

### Task 2: Update Engine and Logic

**Files:**
- Modify: `src/core/engine.ts`
- Modify: `src/store/useBingoLogic.ts`

- [ ] **Step 1: Enhance `engine.ts` to return line counts.**

```ts
// Add this to src/core/engine.ts
export const getBingoLines = (completedPositions: number[], size: number): number => {
  const completedSet = new Set(completedPositions);
  let lines = 0;

  // Rows
  for (let r = 0; r < size; r++) {
    let complete = true;
    for (let c = 0; c < size; c++) {
      if (!completedSet.has(r * size + c)) { complete = false; break; }
    }
    if (complete) lines++;
  }

  // Columns
  for (let c = 0; c < size; c++) {
    let complete = true;
    for (let r = 0; r < size; r++) {
      if (!completedSet.has(r * size + c)) { complete = false; break; }
    }
    if (complete) lines++;
  }

  // Diagonals
  let d1 = true, d2 = true;
  for (let i = 0; i < size; i++) {
    if (!completedSet.has(i * size + i)) d1 = false;
    if (!completedSet.has(i * size + (size - 1 - i))) d2 = false;
  }
  if (d1) lines++;
  if (d2) lines++;

  return lines;
};
```

- [ ] **Step 2: Update `useBingoLogic.ts` to include `completedLineCount`.**

---

### Task 3: Integration and Celebrations in PlayView

**Files:**
- Modify: `src/views/PlayView.tsx`
- Create: `src/components/bingo/RewardPopup.tsx`
- Create: `src/components/bingo/RewardPopup.module.scss`

- [ ] **Step 1: Create `RewardPopup.tsx`.**
- [ ] **Step 2: Update `PlayView.tsx` with modal triggers and celebration logic.**
- [ ] **Step 3: Implement BINGO Line Toast/Celebration.**

---

### Task 4: Verification

- [ ] **Step 1: Run tests.**
- [ ] **Step 2: Manual verification of photo upload and compression.**
- [ ] **Step 3: Verification of mystery reward reveal.**
