## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2024-05-25 - Focus-Visible Utility for Custom Tabs
**Learning:** Custom interactive components like tabs and preset selectors (`<button>`) in modals (e.g. `GoalSettingsModal`) often lack visible focus indicators out-of-the-box when styled with Tailwind, which breaks keyboard accessibility.
**Action:** Always append `focus:outline-none focus-visible:ring-2 focus-visible:ring-[theme-color]` to these elements. Using `focus-visible` ensures mouse users aren't disrupted while keyboard users get clear navigation cues. For elements where offset is problematic, use `focus-visible:ring-inset`.
