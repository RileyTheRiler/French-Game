## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.

## 2025-02-12 - Custom Modal Accessibility
**Learning:** Custom modals (like DictionaryModal) frequently lack robust structural ARIA attributes. Providing role='dialog', aria-modal='true', and aria-labelledby linking to the title ensures screen readers correctly announce the modal boundary. Tabs inside these modals also need explicit role='tablist', role='tab', and role='tabpanel' relationships.
**Action:** Proactively structure custom dialogs and tabs with full ARIA relationships instead of relying on generic divs and buttons. Ensure all icon-only buttons inside them receive aria-labels and focus-visible styling for robust keyboard accessibility.
