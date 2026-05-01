## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Custom Visual Controls Accessibility
**Learning:** Custom interactive elements representing visual choices (like color swatches or stroke widths) are often implemented without proper semantic grouping, making them challenging for screen reader users to understand contextually.
**Action:** When building groups of related interactive visual elements, always wrap them in a container with `role="group"` and an overarching `aria-label`. Apply explicit `aria-label` attributes to the individual interactive containers (e.g., the button wrapping the swatch), manage their active state using `aria-pressed`, and explicitly apply `aria-hidden="true"` to the internal decorative colored `div`s or SVG icons to prevent redundant announcements.
