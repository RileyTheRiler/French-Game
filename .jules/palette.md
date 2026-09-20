## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Dialog and Tooltip Accessibility
**Learning:** Found several floating modals, tooltips, and interactive buttons without proper ARIA attributes, causing accessibility issues for screen readers. Modals (like `EtymologyMap.jsx` and the success screen in `WritingPad.jsx`) were missing `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`, while tooltips lacked `role="tooltip"`. Additionally, icon-only and color/width selection buttons were missing descriptive `aria-label`s.
**Action:** Always ensure floating dialogs and modals use the correct ARIA attributes to map their titles properly for screen readers. For icon-only actions or visual selections (like choosing a color or stroke width), explicitly provide a descriptive `aria-label` to communicate the button's purpose to assistive technologies.
