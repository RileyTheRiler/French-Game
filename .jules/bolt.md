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
## 2024-05-08 - Debounce Large LocalStorage Saves in Contexts
**Learning:** Found a performance bottleneck where large Context states (like vocabulary and custom decks) were being saved synchronously to `localStorage` on every minor state update. This blocks the main thread during high-frequency updates, causing jank.
**Action:** Always wrap `localStorage.setItem` in a `setTimeout` (e.g., 1000ms) within `useEffect` when persisting large Context states, and clear the timeout to debounce the saves. Additionally, add a `beforeunload` event listener to ensure pending saves are committed if the user navigates away or closes the tab.
