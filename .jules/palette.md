## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-05-17 - Accessible Grouping for Interactive Canvas Controls
**Learning:** When creating custom toolbars (like color palettes and stroke width selectors) for canvas-based interactive elements, screen readers often treat them as disconnected lists of buttons without context. Wrapping them in a semantic group with an overarching descriptive label is necessary to provide clear navigation context to assistive technologies.
**Action:** Always wrap sequences of related custom interactive controls (e.g., color swatches, brush sizes) in a container with grouping semantics and an overarching accessible label to ensure logical screen reader navigation.
