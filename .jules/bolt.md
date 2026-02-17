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
## 2024-05-23 - Dictionary List Optimization
**Learning:** React context updates trigger re-renders in all consumers. If a context value (like `vocabulary`) is a dependency of a computed value (like `now`) passed to list items, every context update (even single item change) changes the computed value, causing ALL list items to re-render even if memoized.
**Action:** When using `React.memo` for list items, ensure all props are stable. For time-dependent props like `now`, consider initializing once with `useState` (if staleness is acceptable for the session) or using a context-independent time source to prevent cascading re-renders on unrelated data changes.
## 2024-05-23 - Massive Lint & Conflict Resolution
**Learning:** React 18+ strict mode and modern linters are extremely sensitive to "synchronous setState in effect". Even for initialization, it's safer to use lazy state initialization (`useState(() => value)`) or `useMemo` for derived state, rather than `useEffect` + `setState`. Also, `const` functions inside `useImperativeHandle` or `useEffect` must be hoisted to avoid TDZ errors in strict linting environments.
**Action:** Always prefer derived state (`useMemo`) over syncing state with effects. When using `useImperativeHandle`, define helper functions outside or before the hook.
