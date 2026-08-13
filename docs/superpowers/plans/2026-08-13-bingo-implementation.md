# Bingo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only Bingo challenge app with photo memories and custom themes.

**Architecture:** Layered Hexagonal Architecture. React for UI, Zustand for metadata persistence, IndexedDB for photo storage. Pure functional engine for Bingo logic.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, idb-keyval.

## Global Constraints
- No backend; all data in LocalStorage/IndexedDB.
- Mobile-first responsive design.
- Image compression before storage.
- Manual JSON backup/restore.

---

### Task 1: Foundation & Types
**Files:**
- Create: `src/types/bingo.ts`
- Modify: `package.json`, `tailwind.config.js`

- [ ] **Step 1: Scaffold Vite project**
Run: `npm create vite@latest . -- --template react-ts` (force in current dir)
- [ ] **Step 2: Install dependencies**
Run: `npm install zustand idb-keyval framer-motion lucide-react clsx tailwind-merge`
- [ ] **Step 3: Define types**
Write `BingoCard`, `BingoCell`, `BingoTheme`, `Difficulty` interfaces to `src/types/bingo.ts` (as specified in Design Doc).
- [ ] **Step 4: Setup Tailwind**
Initialize tailwind and configure `content` paths.

---

### Task 2: Storage & Image Services
**Files:**
- Create: `src/services/storage.ts`

- [ ] **Step 1: Implement `compressImage`**
Use Canvas API to resize and convert to JPEG (0.7 quality).
- [ ] **Step 2: Implement `photoStorage`**
Wrapper for `idb-keyval` (save, get, delete).
- [ ] **Step 3: Implement `backupSystem`**
Function to aggregate LocalStorage and IDB data into a downloadable JSON/Base64 blob.

---

### Task 3: State & Logic
**Files:**
- Create: `src/core/engine.ts`
- Create: `src/store/useBingoStore.ts`

- [ ] **Step 1: Implement `checkBingo`**
Logic to detect rows, columns, diagonals for N x N grids.
- [ ] **Step 2: Setup Zustand store**
Use `persist` middleware. Actions: `addCard`, `completeCell`, `updateTheme`, `resetCard`.
- [ ] **Step 3: Hook logic to store**
Create `useBingoLogic` hook to bridge store and engine.

---

### Task 4: Bingo Grid UI
**Files:**
- Create: `src/components/bingo/BingoGrid.tsx`
- Create: `src/components/bingo/BingoCell.tsx`

- [ ] **Step 1: Build `BingoCell`**
States: Incomplete, Completed (with photo), Golden. Animations via Framer Motion.
- [ ] **Step 2: Build `BingoGrid`**
Responsive CSS Grid based on `card.size`.
- [ ] **Step 3: Build `ThemeWrapper`**
Component that applies `BingoTheme` values (colors, fonts) via CSS variables.

---

### Task 5: Creation & Play Views
**Files:**
- Create: `src/views/HomeView.tsx`
- Create: `src/views/EditorView.tsx`
- Create: `src/views/PlayView.tsx`

- [ ] **Step 1: Home View**
List of active Bingos, Template selector.
- [ ] **Step 2: Editor View**
Form to add challenges, set difficulties, and pick themes. "Freeze" logic.
- [ ] **Step 3: Play View**
Completion Modal with camera input. Reward overlay.

---

### Task 6: Memories & Export
**Files:**
- Create: `src/views/MemoriesView.tsx`

- [ ] **Step 1: Memories Gallery**
Masonry-style grid of all `photoId`s from all cards.
- [ ] **Step 2: Backup UI**
"Export All" button in settings/home.
- [ ] **Step 3: Final Polishing**
"BINGO!" celebration particles using Framer Motion.
