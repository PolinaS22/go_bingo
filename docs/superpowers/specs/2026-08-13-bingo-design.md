# Bingo Application Design Specification

## 1. Overview
Bingo is a frontend-only web application where users create, customize, and complete challenge-based Bingo cards. It transforms a standard task list into a visual memory board by integrating photo uploads, rewards, and playful animations.

## 2. Goals & Constraints
- **Self-contained:** No backend; all data persists in the browser (LocalStorage + IndexedDB).
- **Mobile-first:** Optimized for touch interaction and camera usage.
- **Visual & Collectible:** High focus on themes, animations, and a "Memories" gallery.
- **Data Safety:** Manual backup/export system to mitigate browser data clearing.

## 3. Architecture
- **Framework:** React 18 + Vite.
- **State:** Zustand (Card metadata, progress, theme unlocks).
- **Storage:**
    - `LocalStorage`: Bingo metadata, settings, and UI state.
    - `IndexedDB` (via `idb-keyval`): Binary image data (Photos).
- **Logic:** Pure functional "Bingo Engine" for line detection.

## 4. Data Models

### 4.1 BingoCard
```typescript
interface BingoCard {
  id: string;
  title: string;
  description: string;
  size: 2 | 3 | 4 | 5; // Resulting in 4, 9, 16, 25 cells
  cells: BingoCell[];
  theme: BingoTheme;
  isFrozen: boolean; // Locked after starting
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 BingoCell
```typescript
interface BingoCell {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  difficulty: 'NORMAL' | 'HARD' | 'GOLDEN';
  customBackground?: Background;
  reward?: Reward;
  completedAt?: string;
  photoId?: string; // Reference to IndexedDB
}
```

### 4.3 BingoTheme
```typescript
interface BingoTheme {
  primaryColor: string;
  background: Background;
  fontFamily: string;
  borderRadius: number;
  cellStyle: 'glass' | 'solid' | 'bordered';
  unlockedFeatures: string[]; // List of feature IDs unlocked via Golden challenges
}
```

## 5. Core Features

### 5.1 The Bingo Engine
Line detection logic will handle:
- Rows, Columns, and Diagonals.
- Different win conditions: "Any Line" vs "Full House".
- Progress calculation (percentage and completed counts).

### 5.2 Storage & Media
- Standard `<input type="file" capture="environment">` for photo acquisition.
- Clientside image compression using Canvas API before saving to IndexedDB.
- `Memory Manager`: Utility to generate `Blob URLs` for display and clean them up on unmount.

### 5.3 Rewards & Progression
- **Simple Rewards:** Info modals with text and external links.
- **Interactive Rewards:** Golden challenges unlock new themes (e.g., "Neon", "Retro") or special UI effects.
- **Celebrations:** Framer Motion particle effects on line/card completion.

### 5.4 Backup & Export
- **JSON Export:** Downloads a JSON file containing all metadata.
- **Memories Backup:** A hybrid export that includes card data and base64-encoded images for portability.

## 6. Implementation Plan
1. **Foundation:** Project scaffolding, Type definitions, Theme system.
2. **Persistence:** Zustand + IndexedDB integration.
3. **Editor:** Card creation wizard, grid sizing, content population.
4. **Gameplay:** Grid rendering, completion modals, camera logic.
5. **Logic:** Bingo detection, reward triggers, progress tracking.
6. **Polish:** Framer Motion animations, "Memories" masonry gallery, Export/Import tools.

## 7. Risk Mitigation
- **Memory Management:** Auto-revoke Blob URLs to prevent browser crashes.
- **Responsiveness:** Dynamic font sizing and grid padding to ensure 5x5 grids are usable on small screens.
- **Data Persistence:** Explicit warnings about browser cache clearing and prominent "Backup" buttons.
