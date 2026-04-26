## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2026-04-26 - Interactive Custom Tools Accessibility
**Learning:** Custom interactive elements like color swatches and stroke width selectors are often implemented as standard buttons without contextual grouping, making them difficult for screen reader users to understand sequentially.
**Action:** Always wrap related custom interactive controls in a container with `role="group"` and an overarching `aria-label`. Additionally, use `aria-pressed` to denote active selection states and ensure `focus-visible` utility classes provide clear keyboard focus rings.
