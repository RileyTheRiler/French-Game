## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-05-24 - Interactive Element Accessibility
**Learning:** Found that `DictionaryModal.jsx` had icon-only buttons (`Volume2` for playing audio and a close button `svg`) without accessible names, which would make them unreadable for screen reader users. The application relies on many contextual modal components.
**Action:** When adding accessible names to icon-only interactive elements in modals, use `aria-label` on the `<button>` and add `aria-hidden="true"` to the inner decorative icons (like Lucide React icons).
