## 2024-05-23 - Critical Merge Conflicts Block Optimization
**Learning:** Performance optimization is impossible when the codebase is in a broken state due to unresolved merge conflicts. The `ProgressContext.jsx` file, a core part of the application state, was unparseable.
**Action:** Always check for `<<<<<<< HEAD` markers before attempting any optimization. Fixing the build is the first step to performance.

## 2024-05-23 - Sync LocalStorage Blocking Main Thread
**Learning:** The `ProgressContext` was writing to `localStorage` on every single state update (e.g., every XP gain). `localStorage` is synchronous and blocking. For a game with frequent updates (counters, animations), this causes frame drops.
**Action:** Implemented a debounce (1000ms) for persisting state to `localStorage`. This ensures high-frequency updates (like coin counting) don't thrash the disk/storage.

## 2024-05-23 - Context Providers & Broken Builds
**Learning:** `ProgressContext.jsx` contained severe syntax errors and duplicate code blocks from bad merges, preventing the app from building. Also, `vite-plugin-pwa` requires `workbox-window` as a dependency, which was missing, causing build failures.
**Action:** Prioritize fixing syntax errors and merge artifacts before attempting optimizations. For PWA builds, ensure `workbox-window` is in dependencies.
