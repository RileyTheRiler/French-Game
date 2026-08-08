## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-10-27 - Interactive Subtitles Keyboard Accessibility
**Learning:** Interactive tokens within subtitle overlays were implemented as `<span>` elements with `onClick` handlers, making them inaccessible to keyboard and screen reader users.
**Action:** Convert interactive text tokens that act as buttons into semantic `<button>` elements. Apply reset classes (`appearance-none`, `bg-transparent`, `border-none`, `text-left`) and focus rings (`focus-visible:ring-2`) to preserve the inline text appearance while providing full accessibility.
