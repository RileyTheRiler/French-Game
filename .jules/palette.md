# Palette's Journal - Critical UX/A11y Learnings

## 2025-01-08 - Accessible Toggle Buttons
**Learning:** Found pattern where toggle buttons (switches) were missing `role="switch"` and `aria-checked` attributes, making them confusing for screen reader users. Some also lacked visual feedback during async operations.
**Action:** Always check toggle/switch components for proper ARIA roles and add loading states for async toggles.
