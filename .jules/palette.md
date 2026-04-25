## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-05-25 - WritingPad Tool Accessibility
**Learning:** Tools that use arrays to map to `div` or `<button>` tags without text inside (like Color Pickers and Size Selectors) lack structural grouping roles and accessible labels for screen readers.
**Action:** Always wrap lists of visual configurations in `role="group"` with an `aria-label`. For the children controls, provide an explicit `aria-label`, update `aria-pressed` or `aria-selected` based on state, and use `aria-hidden="true"` on inner visual blocks to ensure screen readers announce purpose instead of structure.
