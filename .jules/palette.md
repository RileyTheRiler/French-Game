## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - ARIA Labels on Interactive UI Controls
**Learning:** Found multiple instances where interactive controls relying solely on color or shape (like stroke width buttons, color pickers, and tool toggles in the WritingPad component) lacked accessible names, making them completely opaque to screen reader users.
**Action:** When implementing custom visual controls (like color swatches or size selectors), always add explicit `aria-label` attributes to the interactive `<button>` containers and apply `aria-hidden="true"` to the internal decorative elements (such as colored divs or SVGs).
