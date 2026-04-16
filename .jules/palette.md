## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Accessible Pagination Dots
**Learning:** Interactive pagination dots in modals and carousels often lack screen reader support and visible focus states, making them inaccessible to keyboard and assistive technology users.
**Action:** Always wrap pagination dots in a `role="tablist"` container, assign `role="tab"`, `aria-selected`, and descriptive `aria-label`s to each dot, and provide a clear visual focus state using `focus-visible` utility classes combined with `outline-none`.
