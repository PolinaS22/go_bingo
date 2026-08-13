# Bingo Foundation & Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Vite React TS project, install core dependencies, and define initial Bingo types.

**Architecture:** Client-side React application with Tailwind for styling, Zustand for state management, and IndexedDB for persistence.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, Zustand, idb-keyval, Framer Motion, Lucide React, clsx, tailwind-merge.

## Global Constraints
- Framework: React + Vite
- Language: TypeScript
- CSS: Tailwind CSS
- State: Zustand
- Storage: idb-keyval
- Icons: Lucide React
- Utilities: clsx, tailwind-merge
- Animation: Framer Motion

---

### Task 1: Scaffolding and Dependencies

**Files:**
- Create: Project structure via Vite
- Modify: `package.json`

- [ ] **Step 1: Scaffold Vite project**
Run: `npm create vite@latest . -- --template react-ts`
Expected: Project files created in current directory.

- [ ] **Step 2: Install dependencies**
Run: `npm install zustand idb-keyval framer-motion lucide-react clsx tailwind-merge`
Expected: `package.json` updated with new dependencies.

- [ ] **Step 3: Install Tailwind and PostCSS**
Run: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
Expected: `tailwind.config.js` and `postcss.config.js` created.

- [ ] **Step 4: Verify project builds**
Run: `npm run build`
Expected: Build success.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore: scaffold project and install dependencies"
```

### Task 2: Tailwind Configuration

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Configure Tailwind content paths**
Update `tailwind.config.js`:
```javascript
/** @type {import{import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 2: Add Tailwind directives to CSS**
Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Commit**
```bash
git add tailwind.config.js src/index.css
git commit -m "feat: setup tailwind css"
```

### Task 3: Core Types Definition

**Files:**
- Create: `src/types/bingo.ts`

- [ ] **Step 1: Define core interfaces**
Write to `src/types/bingo.ts`:
```typescript
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BingoCell {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
}

export interface BingoTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface BingoCard {
  id: string;
  title: string;
  cells: BingoCell[];
  difficulty: Difficulty;
  theme: BingoTheme;
  createdAt: number;
  completedAt?: number;
}
```

- [ ] **Step 2: Verify types compile**
Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**
```bash
git add src/types/bingo.ts
git commit -m "feat: add core bingo types"
```
