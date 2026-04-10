## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2025-04-10 - DictionaryModal ARIA Support
**Learning:** Custom tabs in modals require complex ARIA relationships (`tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`) to be understandable by screen readers. Simple `onClick` divs are entirely opaque to assistive technology.
**Action:** Always implement full tablist structural patterns when building custom tab navigation instead of relying on basic click handlers.
