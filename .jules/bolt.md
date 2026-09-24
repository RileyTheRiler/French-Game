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
## 2026-09-24 - Schwartzian Transform and Memory Optimization for Arrays
**Learning:** Sorting functions like getDueWords called computePriority directly inside sort, resulting in O(N log N) recalculations of priority and recalculating expensive mathematical and date functions each time. Also discovered memory optimizations can be done by deferring object spreading to only the relevant elements instead of applying it to all N elements.
**Action:** Use Schwartzian Transform to map the words and their priority first, before sorting by priority, saving O(N log N) overhead. Defer expensive object spreads and mutations (like hydrateWord) until after slicing limits have been applied to save O(N) memory allocations.
