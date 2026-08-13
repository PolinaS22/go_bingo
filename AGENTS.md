# Bingo — Agent Rules

These rules apply to every change in this repository. Prefer a small correct fix over a large speculative rewrite.

## Product

Bingo is a frontend-only app: users create challenge cards, complete cells (optionally with photos), unlock rewards, and keep memories. Persistence is LocalStorage (Zustand persist) + IndexedDB (photos). There is no backend.

Do not add a server, auth, a new state library, a router, or a CSS framework unless the user explicitly asks.

## TypeScript — non-negotiable

- `strict` is on. Keep it on. Do not weaken `tsconfig.json`.
- Ban `any`, `as any`, `as unknown as T`, `@ts-ignore`, `@ts-nocheck`, and `@ts-expect-error` unless the user explicitly requests an exception.
- Type values at the source. Do not cast to silence the compiler.
- Prefer `BingoTheme | undefined` over `theme as any`. Prefer a `BackupPayload` type over `(data: any)`.
- Generic handlers must be typed:

```ts
// BAD
const handleChange = (field: keyof BingoCell, value: any) => {}

// GOOD
function patchCell<K extends keyof BingoCell>(field: K, value: BingoCell[K]) {}
```

- Tests: type mocks. Never `(useBingoStore as any).mockReturnValue(...)`. Use `vi.mocked(useBingoStore)` and objects that satisfy the real types (or a typed test factory).
- Do not keep duplicate fields “for backward compatibility” (`title` + `text`, `isCompleted` + `completedAt` on the same meaning). One field, one meaning. Migrate existing data if needed.
- Enable and respect unused-symbol discipline: no unused imports, props, store actions in UI, or state.
- `as` is allowed only for proven DOM/`FileReader` results after a runtime check, not as a substitute for a type.

## Domain model — single source of truth

Canonical types live in `src/types/bingo.ts`. Specs under `docs/` are historical; if code and spec disagree, fix types + code together and then update the spec. Do not invent a third variant.

Required consistency:

- `BingoCell.position` is a required `number` (0 .. size²-1) and is set at cell creation. The engine keys off this index. Never leave it optional or unset.
- Completion is one representation. Prefer `completedAt: number | undefined` (timestamp) or `isCompleted: boolean`, not both. Store, UI, and engine must use the same one.
- Cell label is `title`. Do not write `text` as a shadow copy of `title`.
- `BingoCard.size` is `2 | 3 | 4 | 5`.
- `isFrozen` means “play has started, editor cannot mutate cells”. If you touch play/editor, honor it or remove it from the type. Do not leave dead flags.
- Themes: either the card owns `theme`, or the store owns `themes` + `currentThemeId`. Not both half-wired.

When creating a card, every cell must be a complete `BingoCell` (id, title, difficulty, position). Do not push partial objects.

## Application logic

User flows that must remain true:

1. Home lists cards → selecting a card sets `currentCardId` and opens Play.
2. Editor creates **or** edits a card. “New” creates. Opening an existing card updates via `updateCard`, it does not `addCard` a duplicate.
3. Play completes a cell through one path: UI → store action → derived bingo state. Do not call `completeCell` from the view **and** keep an unused `toggleCell` that does the same thing.
4. Bingo lines use `src/core/engine.ts` and `useBingoLogic`. Do not hardcode `const isBingo = false`.
5. Line celebration and full-card celebration are distinct. Do not render two “BINGO!” overlays for the same event.
6. Photos: compress → IndexedDB → store only `photoId`. Revoke blob URLs on unmount / before replacing. Never leave `URL.createObjectURL` without `revokeObjectURL`.
7. Backup import validates a typed payload, writes only this app’s keys, then updates Zustand state. Do not dump arbitrary `localStorage` keys. Do not use `window.location.reload()` as a state-sync strategy.

Store actions (`updateCard`, `deleteCard`, `resetCard`, …) exist to be used by UI. Do not add store API that no screen can reach.

Validate before save: non-empty title, `cells.length === size * size`, every cell has `position`.

## React / structure

- Named exports for components (`export const HomeView`), one style. Do not mix default and named exports for views.
- Do not use `Math.random()` during render (particles, keys). Compute once (`useMemo` / `useRef`) or use a deterministic seed.
- Derive display state (`currentCard`, line count) in hooks; keep Zustand for persisted data and commands.
- Props must match callers. If `HomeView` declares `onPlay: (id: string) => void`, App must pass that signature — or change the type. Do not rely on ignored extra arguments.
- Optional theme: `ThemeWrapper` accepts `BingoTheme | undefined` and applies defaults internally. Callers must not cast.

## Tests

- Tests must match the current UI. Do not assert labels that the screen does not render (e.g. Editor “Difficulty” when difficulty lives on the cell panel).
- Mock at the boundary you intend. If a view uses `useBingoLogic`, either mock that hook or provide a store mock that satisfies everything the real hook reads.
- Cover engine functions with pure unit tests; do not only snapshot views.

## What you must not do

- Do not “fix” types by widening them (`unknown`, `Record<string, any>`, empty interfaces).
- Do not add backward-compat aliases instead of migrating the model.
- Do not leave `// Simplified for now`, `// Added for logic`, or TODO stubs in shipped paths.
- Do not install or reference ESLint in scripts unless ESLint is a real dependency with a config.
- Do not add Tailwind utility classes to new UI while the app is SCSS-module based, and do not add `tailwind-merge` usage unless Tailwind utilities are actually used.
- Do not expand scope: no new features (theme unlocks, routing, camera capture) while fixing types/logic unless the user asked.
- Do not rewrite the folder structure or swap Zustand/Framer/Vite for another stack.
- Do not commit secrets, generated backups, or photo blobs.
- Do not use `git commit --amend` or force-push unless the user asked.
- Do not update git config.
- Do not silence failing tests; fix the product or the test.

## When fixing, order of work

1. Canonical types in `src/types/bingo.ts`.
2. Engine + store (positions, completion, backup type).
3. Views/components to match types (no casts).
4. Tests typed and aligned with UI.
5. Only then optional polish.
