# Bingo Editor Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Bingo Editor to support per-cell configuration with a dynamic grid UI.

**Architecture:** 
- Centralized state in `EditorView` for the "draft" card.
- Componentized `CellSettingsPanel` for cell-specific edits.
- Responsive grid layout using CSS Grid and SCSS Modules.
- Preservation logic for grid resizing.

**Tech Stack:** React, Zustand, SCSS Modules.

## Global Constraints
- Use SCSS Modules for styling.
- Follow existing `Difficulty` types: `NORMAL`, `HARD`, `GOLDEN`.
- Ensure `crypto.randomUUID()` is used for new IDs.

---

### Task 1: Update Store and Types
**Files:**
- Modify: `src/store/useBingoStore.ts`
- Modify: `src/types/bingo.ts`

- [ ] **Step 1: Verify types in `src/types/bingo.ts`**
- [ ] **Step 2: Add updateCard action to `src/store/useBingoStore.ts`**
- [ ] **Step 3: Commit changes**

### Task 2: Create CellSettingsPanel Component
**Files:**
- Create: `src/components/editor/CellSettingsPanel.tsx`
- Create: `src/components/editor/CellSettingsPanel.module.scss`

**Interfaces:**
- Consumes: `BingoCell` object, `onChange` callback, `onClose` callback.
- Produces: Updated `BingoCell` properties.

- [ ] **Step 1: Create the directory `src/components/editor/`**
- [ ] **Step 2: Implement `CellSettingsPanel.tsx` with form fields for cell properties.**
- [ ] **Step 3: Implement styling in `CellSettingsPanel.module.scss`**
- [ ] **Step 4: Commit changes**

### Task 3: Refactor EditorView for Grid Layout
**Files:**
- Modify: `src/views/EditorView.tsx`
- Modify: `src/views/EditorView.module.scss`

- [ ] **Step 1: Update `EditorView.tsx` to include grid size selection and cell grid rendering.**
- [ ] **Step 2: Implement resize logic to preserve top-left cells.**
- [ ] **Step 3: Add styling for the grid and cell selection.**
- [ ] **Step 4: Commit changes**

### Task 4: Integration and Verification
- [ ] **Step 1: Connect CellSettingsPanel to EditorView.**
- [ ] **Step 2: Verify Save functionality by checking the store state.**
- [ ] **Step 3: Run build/lint check.**
- [ ] **Step 4: Final commit.**
