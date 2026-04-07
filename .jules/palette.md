## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2026-04-07 - Accessible Custom Dialogs and Tabs
**Learning:** Custom interactive components like modals and tabbed interfaces require extensive ARIA roles (dialog, tablist, tab, tabpanel) and keyboard management to be usable by assistive technologies.
**Action:** When creating custom interactive widgets, strictly follow W3C ARIA Authoring Practices by applying appropriate roles, aria-selected/aria-controls bindings, and focus-visible rings to ensure robust accessibility without relying solely on semantic HTML elements.
