# BingoCell Rich Property Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the `BingoCell` component to support icons, titles, descriptions, difficulty-based styling, custom backgrounds, and photo backgrounds for completed cells.

**Architecture:** Update `BingoCell.tsx` to conditionally render new fields and apply dynamic styles. Use CSS variables and classes in `BingoCell.module.scss` for difficulty and custom styles. Use Framer Motion for state transitions.

**Tech Stack:** React, Framer Motion, SCSS Modules, idb-keyval (via storage service).

## Global Constraints
- Use CSS-based animations for the GOLDEN cell glow.
- Support NORMAL, HARD, and GOLDEN difficulties.
- Integrate with `getPhoto` from `src/services/storage.ts`.
- Maintain backward compatibility for `cell.text` and `cell.isCompleted`.

---

### Task 1: Update Styling and Animations in SCSS

**Files:**
- Modify: `src/components/bingo/BingoCell.module.scss`

**Interfaces:**
- Produces: `.difficultyNormal`, `.difficultyHard`, `.difficultyGolden`, `.glowAnimation`, `.hasCustomBackground`, `.photoBackground`

- [ ] **Step 1: Define Animations and Difficulty Classes**

```scss
@keyframes goldenGlow {
  0% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.4); border-color: #fbbf24; }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); border-color: #f59e0b; }
  100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.4); border-color: #fbbf24; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.difficultyNormal {
  border-color: var(--primary-color, #e2e8f0);
}

.difficultyHard {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.difficultyGolden {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
  animation: goldenGlow 3s infinite ease-in-out;
  
  .text, .title {
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.hasCustomBackground {
  background-size: cover;
  background-position: center;
}

.photoBackground {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.6;
}

.cell {
  // Ensure relative for absolute photo
  position: relative;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.icon {
  font-size: 1.5rem;
}

.title {
  font-weight: 700;
  font-size: 0.9rem;
}

.description {
  font-size: 0.75rem;
  opacity: 0.8;
}
```

- [ ] **Step 2: Apply changes to `src/components/bingo/BingoCell.module.scss`**

- [ ] **Step 3: Commit styling**

```bash
git add src/components/bingo/BingoCell.module.scss
git commit -m "style: add difficulty and rich property styles to BingoCell"
```

---

### Task 2: Implement Rich Property Logic in BingoCell Component

**Files:**
- Modify: `src/components/bingo/BingoCell.tsx`

**Interfaces:**
- Consumes: `getPhoto` from `../../services/storage`

- [ ] **Step 1: Update Imports and Component Logic**

```tsx
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { BingoCell as BingoCellType } from '../../types/bingo'
import { getPhoto } from '../../services/storage'
import styles from './BingoCell.module.scss'

interface BingoCellProps {
  cell: BingoCellType
  onClick: (id: string) => void
  isGolden?: boolean // Legacy or override
}

export const BingoCell: React.FC<BingoCellProps> = ({ cell, onClick, isGolden }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const isCompleted = cell.isCompleted || !!cell.completedAt
  const effectiveDifficulty = isGolden ? 'GOLDEN' : cell.difficulty || 'NORMAL'

  useEffect(() => {
    if (isCompleted && cell.photoId) {
      getPhoto(cell.photoId).then((blob) => {
        if (blob) {
          setPhotoUrl(URL.createObjectURL(blob))
        }
      })
    }
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [isCompleted, cell.photoId])

  const customStyle: React.CSSProperties = {}
  if (cell.customBackground) {
    if (cell.customBackground.type === 'color' || cell.customBackground.type === 'gradient') {
      customStyle.background = cell.customBackground.value
    } else if (cell.customBackground.type === 'image') {
      customStyle.backgroundImage = `url(${cell.customBackground.value})`
    }
  } else if (cell.customImage) {
    customStyle.backgroundImage = `url(${cell.customImage})`
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(styles.cell, {
        [styles.completed]: isCompleted,
        [styles.difficultyNormal]: effectiveDifficulty === 'NORMAL',
        [styles.difficultyHard]: effectiveDifficulty === 'HARD',
        [styles.difficultyGolden]: effectiveDifficulty === 'GOLDEN',
        [styles.hasCustomBackground]: !!(cell.customBackground || cell.customImage),
      })}
      style={customStyle}
      onClick={() => onClick(cell.id)}
    >
      {photoUrl && isCompleted && (
        <img src={photoUrl} className={styles.photoBackground} alt="" />
      )}
      
      <div className={styles.content}>
        {cell.icon && <span className={styles.icon}>{cell.icon}</span>}
        {cell.title && <span className={styles.title}>{cell.title}</span>}
        <span className={styles.text}>{cell.text || cell.description}</span>
      </div>

      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={styles.overlay}
          >
            <div className={styles.checkMark}>✓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

- [ ] **Step 2: Apply changes to `src/components/bingo/BingoCell.tsx`**

- [ ] **Step 3: Commit implementation**

```bash
git add src/components/bingo/BingoCell.tsx
git commit -m "feat: implement rich properties and photo background in BingoCell"
```

---

### Task 3: Verification

- [ ] **Step 1: Check for TypeScript errors**
Run: `npx tsc --noEmit`

- [ ] **Step 2: Verify existing tests**
Run: `npm test` (if applicable)

- [ ] **Step 3: Manual check (visual check requires user feedback or browser)**
Confirm logic covers all difficulty cases and property rendering.
