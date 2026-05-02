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

## 2024-05-02 - React Context Optimization
**Learning:** Found an unmemoized context `value` in `CommunityContext.jsx` causing unnecessary component re-renders for consumers calling `useCommunity()`. Also learned that my previous ESLint fixes caused issues due to hallucinations of eslint rules (`react-hooks/immutability`), and the importance of checking lint rules before writing disable comments. Additionally, a newly generated `pnpm-lock.yaml` file was inadvertently added which must be prevented.
**Action:** Always wrap Context Provider `value` objects in `useMemo` specifically when the context contains multiple distinct properties/functions, explicitly listing their dependency arrays. Never hallucinate ESLint rules, and always remove unwanted `pnpm-lock.yaml` changes if they are out of scope.
