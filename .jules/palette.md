## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2025-01-22 - Accessible Carousel Pagination
**Learning:** When using custom small UI elements like dots or small dashes for pagination (like in tip carousels), sighted users can visually identify their purpose, but screen readers just announce "button" and lack context.
**Action:** Always add descriptive labels (e.g., "Go to slide 1") and use an active state indicator on the currently active pagination dot to give screen reader users context of both purpose and active state.
