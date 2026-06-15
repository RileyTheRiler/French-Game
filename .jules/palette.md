## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-06-15 - Icon Button Accessibility in Modals and Lists
**Learning:** Icon-only buttons used for secondary actions (like closing a modal or deleting items in a list) often lack context for screen reader users and sighted keyboard users if they do not include descriptive labels and focus indicators.
**Action:** Always provide descriptive ARIA labels to icon-only buttons. When modifying native HTML button elements in this application, include Tailwind utility classes for focus indicators, and retain or add title attributes so that sighted mouse users have a hover tooltip.
