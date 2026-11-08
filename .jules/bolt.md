## 2024-11-08 - [Grammar Lesson View Memoization]
**Learning:** Extracting conditional data loading into `useMemo` hooks is safe but requires placing the hook above conditionals, which may result in minor memory retention for lifecycle (unless conditionally rendered component entirely unmounts).
**Action:** Always verify if moving conditional data generation to root level hook overhead outweighs the conditional rendering cost.
