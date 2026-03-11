## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-05-19 - DictionaryModal Dialog Accessibility
**Learning:** Custom modal and tab implementations in React often lack native semantic roles, making them invisible or confusing to screen readers. For example, `DictionaryModal.jsx` had multiple tabs (`vocab`, `saved`, `grammar`) but no `role="tablist"` or `aria-selected` attributes, and icon-only buttons (like the `Volume2` audio play button) had no `aria-label`.
**Action:** When creating or modifying custom dialogs and tabs, proactively add standard ARIA attributes: `role="dialog"`, `aria-modal="true"`, and link the title via `aria-labelledby` for dialogs. Ensure tabs correctly establish `tablist`, `tab`, and `tabpanel` relationships (with `aria-selected` and `aria-controls`) for robust screen reader accessibility. Ensure icon-only buttons always have a descriptive `aria-label`.
