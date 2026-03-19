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
## 2026-03-19 - Schwartzian Transform for SRS Sorting
**Learning:** Sorting arrays of complex objects using expensive calculations (like `computePriority` or `calculateRetentionProbability`) directly within the `.sort()` callback executes those O(N) calculations O(N log N) times, causing severe performance bottlenecks as vocabulary grows. Furthermore, using object spread (`...word`) during pre-computation mapping creates excessive memory allocation and garbage collection overhead.
**Action:** When sorting arrays based on derived, expensive-to-calculate values, always use a Schwartzian transform (map-sort-map). Map the array to lightweight objects containing a reference to the original item and the pre-computed sort key (e.g., `{ word, priorityScore }`), sort based on the key, and then map back to the original items.
