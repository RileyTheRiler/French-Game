## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Grouping Custom Interactive Controls
**Learning:** Custom interactive visual controls (like color swatches or stroke width selectors) rendered as individual buttons lack semantic grouping for screen reader navigation, making it difficult to understand their relationship.
**Action:** Wrap related custom controls in a container with `role="group"` and provide a descriptive `aria-label`. Apply `aria-hidden="true"` to purely decorative internal elements (e.g. the colored blocks within a swatch) to avoid redundant or noisy announcements, while adding proper `aria-label`s on the interactive container.
