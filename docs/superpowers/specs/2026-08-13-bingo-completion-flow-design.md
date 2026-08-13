# Design Spec: Bingo Completion Flow

## Goal
Implement a detailed completion flow for the Bingo game, including photo uploads, reward handling, and line/card completion celebrations.

## Architecture
- **View**: `PlayView.tsx` will be the primary coordinator.
- **Components**:
    - `CompletionModal`: Handles cell interaction (viewing or completing).
    - `RewardPopup`: Congratulates the user when a reward is unlocked.
    - `BingoGrid`: Enhanced to support line completion celebrations.
- **Store**: Uses `useBingoStore` and `useBingoLogic` for state and business logic.
- **Storage**: Uses `storage.ts` (IndexedDB) for photo persistence and compression.

## User Flow
1. **Cell Click**: User clicks a cell in the grid.
2. **Modal Open**: `CompletionModal` opens.
3. **Completion**:
    - If `photoRequired` is true, user must upload a photo.
    - User clicks "Complete".
    - Image is compressed and saved to IndexedDB.
    - Store is updated.
4. **Verification**:
    - Check for line completion.
    - Check for card completion.
5. **Celebration**:
    - "BINGO!" animation for line completion.
    - "Reward Unlocked" popup if the cell has a reward.

## Implementation Details
- **Photo Compression**: Use `compressImage` from `storage.ts`.
- **Styling**: SCSS Modules for all new components.
- **Animations**: `framer-motion` for transitions and celebrations.
- **Bingo Logic**: Update `checkBingo` or `useBingoLogic` to detect newly completed lines that haven't been celebrated yet.

## Components

### CompletionModal
- Displays cell details (title, description).
- Shows reward information (hides mystery rewards until completed).
- Provides photo upload input if not completed.
- Displays uploaded photo if completed.
- "Complete" button logic:
    - Disabled if `photoRequired` and no file selected.
    - Triggers compression, saving, and store update.

### RewardPopup
- Simple modal overlay.
- Displays reward title and description.
- "Collect" button to dismiss.

## Celebrations
- **Line Bingo**: Full-screen overlay with particles.
- **Card Bingo**: Existing logic in `BingoGrid`.

## Data Schema Changes
No changes to `BingoCell` or `BingoCard` types are required as they already include the necessary fields (`photoId`, `photoRequired`, `reward`).
