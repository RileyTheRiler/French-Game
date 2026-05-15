## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Interactive Tool Containers Accessibility
**Learning:** Groups of interactive controls, like color swatches or stroke width selectors, need explicit groupings so screen readers can interpret them collectively rather than as isolated elements. Inner visual elements of controls can also clutter screen reader announcements.
**Action:** Apply `role="group"` and `aria-label` to the container `div` of related interactive elements. Ensure inner decorative elements like the actual colored circle or width indicator have `aria-hidden="true"` while the wrapper button possesses the `aria-label` and `aria-pressed` state.
