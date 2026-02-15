## 2024-05-23 - Accessibility in Complex Modals
**Learning:** Adding `role="dialog"` and `aria-modal="true"` to modals is standard, but complex modals with tabs (like `DictionaryModal`) need explicit `role="tablist"`, `role="tab"`, and `role="tabpanel"` structures to be navigable by screen readers. Merely changing visibility isn't enough; focus management and semantic roles are crucial.
**Action:** When creating tabbed interfaces in modals, always implement the full ARIA tab pattern and ensure focus is trapped within the modal but can move between tabs efficiently.

## 2024-05-23 - Merge Conflict Resolution in Contexts
**Learning:** React Context files are high-traffic areas prone to merge conflicts. Duplicate state declarations (e.g., `audioEnabled` in `ProgressContext`) can silently break the app or cause weird bugs.
**Action:** When merging context files, always verify state initialization and `Provider` value construction. Use `useMemo` for context values to prevent unnecessary re-renders, especially when combining logic from multiple branches.
