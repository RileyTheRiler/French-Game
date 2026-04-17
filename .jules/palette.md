## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2025-02-12 - Simulated Component Visual Tests Using Playwright
**Learning:** If the local dev server fails to run due to codebase-wide regressions or merge conflicts, you can successfully bypass it for isolated component UI/accessibility verification by using `page.set_content()` in Playwright to simulate the component HTML, while explicitly injecting the Tailwind CDN to ensure visual fidelity.
**Action:** Always inject `<script src="https://cdn.tailwindcss.com"></script>` into the HTML string passed to `page.set_content()` when verifying Tailwind-based components using Playwright outside of a running Vite environment.
