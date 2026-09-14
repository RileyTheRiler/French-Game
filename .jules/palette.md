## 2024-05-23 - Interactive Cards Accessibility
**Learning:** The application frequently implements interactive cards (e.g., in Video Library) as `div` elements with `onClick` handlers, which are inaccessible to keyboard users.
**Action:** Convert these `div` containers to `<button>` elements. Apply `w-full`, `text-left`, `appearance-none`, and `focus:outline-none focus-visible:ring-2` classes to maintain the original layout and visual design while providing native keyboard support and focus management.

## 2024-05-24 - Polymorphic Interactive Components
**Learning:** Manually converting every clickable `div` to a button is tedious and prone to regression. A centralized solution is better.
**Action:** Modify core UI components (like `Card`) to be polymorphic. If `onClick` is detected, automatically render a `<button>` with accessibility resets (`text-left`, `appearance-none`) and focus rings. This enforces accessibility by default across the app.
## 2024-09-14 - Robust Regex Replacements in CJS Scripts
**Learning:** When using `.cjs` scripts with `String.prototype.replace()` to modify React components, exact string or literal regex matches often fail silently due to subtle, inconsistent whitespace or newline formatting variations in the source code.
**Action:** Use robust regular expressions with flexible whitespace matching (e.g., `[\s\S]*?` or `\s+`) instead of exact string matching, and always verify that the target files were actually modified (e.g., using `git diff`) before staging changes.
