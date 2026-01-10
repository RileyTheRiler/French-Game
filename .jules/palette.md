## 2024-05-22 - Icon-Only Buttons Accessibility
**Learning:** Many icon-only buttons in the main menu (and potentially other areas) lacked `aria-label` attributes, making them inaccessible to screen readers. This is a common pattern in UI-heavy applications using libraries like `lucide-react`.
**Action:** Always add `aria-label` to buttons that only contain an icon. Use descriptive text (e.g., "Settings", "Shop") or dynamic text (e.g., "Shop, 50 coins") for better context.

## 2024-05-22 - Widespread Merge Conflicts
**Learning:** The repository contained extensive unresolved merge conflicts across core components (`VocabularyContext`, `ProgressContext`) and data files (`grammar.js`, `achievements.js`). This indicates a potential process issue or a recent bad merge.
**Action:** Always run a build check (`npm run build`) before starting work on a new feature to ensure the codebase is stable. Resolving these conflicts was prerequisite to verifying any new changes.
