## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-06-16 - Missing Accessibility Labels on Modal Close Buttons
**Learning:** Multiple modal components across the application utilize an icon-only button component for the close action but fail to pass an accessibility label attribute. This represents a codebase-specific pattern that makes these critical navigational elements inaccessible to screen reader users.
**Action:** When implementing or refactoring modal components, ensure the close button component is always provided with a descriptive accessibility label attribute to maintain keyboard and screen reader accessibility.
