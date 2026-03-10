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

## 2025-03-10 - O(N) vs O(N log N) Sorting Optimization in SRS Utils
**Learning:** The previous implementation of `sortByReviewPriority` computed priority scores inside the `.sort()` comparator. Because sorting has a time complexity of O(N log N), this caused `calculateRetentionProbability` to be called repeatedly and unnecessarily for the same items, degrading performance linearly as the user's vocabulary size grows.
**Action:** Use a Schwartzian transform pattern (map-sort-map) to evaluate the priority of each card exactly once (O(N) operation) prior to sorting. Also, extract the `now = Date.now()` evaluation outside loops to prevent expensive, repeated time lookups on batch SRS calculations.
