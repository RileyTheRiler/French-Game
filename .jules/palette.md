## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Standardizing Dialog and Tablist ARIA
**Learning:** Custom modal and tab implementations in this application (such as in `DictionaryModal`) frequently lack the semantic HTML structure needed by screen readers. Specifically, modals are missing `role="dialog"` and `aria-modal="true"`, and custom tabs lack `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls`.
**Action:** When implementing or refactoring custom dialogs and tabs, proactively add `role="dialog"`, `aria-modal="true"`, and link the title via `aria-labelledby`. Ensure tabs correctly establish `tablist`, `tab`, and `tabpanel` relationships for robust accessibility.
