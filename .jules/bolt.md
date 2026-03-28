## 2024-05-23 - Critical Merge Conflicts Block Optimization
**Learning:** Performance optimization is impossible when the codebase is in a broken state due to unresolved merge conflicts. The `ProgressContext.jsx` file, a core part of the application state, was unparseable.
**Action:** Always check for `<<<<<<< HEAD` markers before attempting any optimization. Fixing the build is the first step to performance.

## 2024-05-23 - Sync LocalStorage Blocking Main Thread
**Learning:** The `ProgressContext` was writing to `localStorage` on every single state update (e.g., every XP gain). `localStorage` is synchronous and blocking. For a game with frequent updates (counters, animations), this causes frame drops.
**Action:** Implemented a debounce (1000ms) for persisting state to `localStorage`. This ensures high-frequency updates (like coin counting) don't thrash the disk/storage.

## 2024-05-24 - Testing Context Memoization with Vitest
**Learning:** When testing Context Provider memoization, mocking consumed hooks (like `useProgress` used inside `VocabularyContext`) with `vi.fn()` inside `vi.mock` creates a new function reference on every render, breaking memoization and causing false positives in performance tests.
**Action:** Use `vi.hoisted(() => ({ mockFn: vi.fn() }))` to create stable mock references that persist across test renders.
