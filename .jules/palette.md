## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Interactive Canvas Controls Accessibility
**Learning:** Custom visual controls for drawing apps (like color swatches and stroke width selectors) are often implemented as colored divs inside buttons without text, making them invisible to screen readers. Grouping them semantically is also frequently missed.
**Action:** Always wrap groups of related custom controls in a container with grouping semantics and an overarching label. For the individual buttons, apply a descriptive label and ensure internal decorative visual elements are explicitly hidden. Ensure all icon-only utility buttons have both a descriptive label and visually hidden internal elements.
