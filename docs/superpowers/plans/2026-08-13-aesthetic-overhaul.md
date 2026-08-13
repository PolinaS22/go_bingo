# Implementation Plan: "Whimsical Garden Pop" Aesthetic Overhaul

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the application's visual design into a high-aesthetic blend of Cottage Core (cozy, organic, vintage) and Girly Pop (bright, soft pinks, sparkles, glassmorphism).

**Architecture:**
- **Design Tokens:** Centralized variables for colors, shadows, and glass effects.
- **Watercolor Engine:** Deterministic, CSS-only background generator for cells.
- **Enhanced Visuals:** Advanced SCSS for glassmorphism and Framer Motion for organic celebrations.

**Tech Stack:** React, SCSS Modules, Framer Motion, Lucide Icons.

## Global Constraints
- Use SCSS Modules for all styles.
- Replace \$ink with \$deep-mocha (#4A3728) for softer readability.
- Retain all functional logic (Bingo detection, store persistence).

---

### Task 1: Aesthetic Tokens & Global Background
**Files:**
- Modify: `src/styles/tokens.scss`
- Modify: `src/App.module.scss`

- [ ] **Step 1: Define the new palette**
Update `tokens.scss` with variables:
\`\`\`scss
\$cottage-rose: #FFD1DC;
\$vintage-sage: #B2AC88;
\$lavender-blush: #FFF0F5;
\$bubblegum-pink: #FF69B4;
\$deep-mocha: #4A3728;
\$glass-bg: rgba(255, 255, 255, 0.65);
\$card-shadow: 0 20px 50px rgba(255, 182, 193, 0.25);
\`\`\`
- [ ] **Step 2: Apply global background**
Update `App.module.scss` to use a soft gradient (\$lavender-blush to white) and a subtle noise texture overlay.

### Task 2: Watercolor Grid & Glass Cells
**Files:**
- Modify: `src/components/bingo/BingoGrid.module.scss`
- Modify: `src/components/bingo/BingoCell.module.scss`
- Modify: `src/components/bingo/BingoCell.tsx`

- [ ] **Step 1: Redesign BingoGrid**
Increase `gap` to `16px`, remove inner borders, and add `padding: 20px`.
- [ ] **Step 2: Implement Glassmorphism in BingoCell**
Apply `border-radius: 24px`, `backdrop-filter: blur(12px)`, and a thin white border.
- [ ] **Step 3: Build the Watercolor Logic**
In `BingoCell.tsx`, create a deterministic function using `cell.id` to pick one of 6 pastel radial gradients (Watercolor spots).
- [ ] **Step 4: Update BingoCell styles**
Apply the watercolor spot as a `background-image` with low opacity behind the content.

### Task 3: Golden Shimmer & Animations
**Files:**
- Modify: `src/components/bingo/BingoCell.module.scss`

- [ ] **Step 1: Create the Golden Shimmer animation**
Implement a `@keyframes shimmer` that moves a golden light across the cell's border.
- [ ] **Step 2: Update Golden Difficulty styles**
Replace the static background with a soft golden glow and the shimmer effect.

### Task 4: Whimsical Celebrations & Polish
**Files:**
- Modify: `src/components/bingo/BingoCelebration.tsx`
- Modify: `src/components/bingo/BingoGrid.module.scss`

- [ ] **Step 1: Redesign the "Bingo!" line**
Replace the current "Stamp" style with an organic, flowing line (simulating a silk ribbon or vine).
- [ ] **Step 2: Update Particles**
Modify the celebration logic to use SVG paths for "Petals" and "Sparkles" instead of squares.
- [ ] **Step 3: Theming Modals**
Update `CompletionModal` and `RewardPopup` to match the glass/rounded aesthetic.
