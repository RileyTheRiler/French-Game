## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2026-04-21 - Tablist Accessibility
**Learning:** React tab components in this app often lack proper ARIA relationship attributes (tablist, tab, tabpanel, aria-controls, aria-labelledby) which are critical for screen reader users to navigate complex settings modals. Focus rings () are also crucial for keyboard users to see which tab is active.
**Action:** When refactoring custom tab components, always verify and add complete ARIA tab semantics and distinct keyboard focus indicators () that don't rely solely on color changes.
## 2024-05-18 - Tablist Accessibility
**Learning:** React tab components in this app often lack proper ARIA relationship attributes (tablist, tab, tabpanel, aria-controls, aria-labelledby) which are critical for screen reader users to navigate complex settings modals. Focus rings (`focus-visible:ring-2`) are also crucial for keyboard users to see which tab is active.
**Action:** When refactoring custom tab components, always verify and add complete ARIA tab semantics and distinct keyboard focus indicators (`focus-visible`) that don't rely solely on color changes.
