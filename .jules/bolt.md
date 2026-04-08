## 2024-05-23 - Critical Merge Conflicts Block Optimization
**Learning:** Performance optimization is impossible when the codebase is in a broken state due to unresolved merge conflicts. The `ProgressContext.jsx` file, a core part of the application state, was unparseable.
**Action:** Always check for `<<<<<<< HEAD` markers before attempting any optimization. Fixing the build is the first step to performance.

## 2024-05-23 - Sync LocalStorage Blocking Main Thread
**Learning:** The `ProgressContext` was writing to `localStorage` on every single state update (e.g., every XP gain). `localStorage` is synchronous and blocking. For a game with frequent updates (counters, animations), this causes frame drops.
**Action:** Implemented a debounce (1000ms) for persisting state to `localStorage`. This ensures high-frequency updates (like coin counting) don't thrash the disk/storage.
# Bolt's Journal

## 2024-05-22 - Context Memoization & Merge Conflicts
**Learning:** Found critical contexts (`VocabularyContext`, `ProgressContext`) with massive merge conflicts and missing memoization. The `ToastContext` also lacks memoization for its value, causing unnecessary re-renders in all consumers whenever a toast is triggered.
**Action:** When fixing merge conflicts in Context Providers, always enforce `useMemo` on the `value` prop to prevent performance regressions. Broken builds hide performance metrics.
## 2026-04-08 - Component Memoization vs Children Prop
**Learning:** Wrapping React UI components (like Button or Card) that accept `children` in `React.memo()` is an anti-pattern. Because JSX children create new object references on every render, the shallow comparison always fails, adding overhead without preventing re-renders.
**Action:** Avoid using `React.memo()` on components that heavily use the `children` prop unless the children are guaranteed to be primitives or statically memoized.

## 2026-04-08 - Sync LocalStorage Blocking Main Thread
**Learning:** The `VocabularyContext` was writing to `localStorage` synchronously on every state update. For an app with frequent updates, this blocks the main thread and drops frames.
**Action:** Implemented a debounce (1000ms) for persisting state to `localStorage`. This ensures high-frequency updates don't thrash the disk/storage, matching the pattern in `ProgressContext`.
