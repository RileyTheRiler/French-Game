## 2026-03-15 - Added ARIA tabs to GrammarModal
**Learning:** The React linter flags `Date.now()` as an impure function when used inside `useMemo` or component render bodies, causing build-blocking errors. Also, mapping custom dot pagination controls without proper `role='tab'` and `aria-selected` breaks screen reader navigation.
**Action:** Use `new Date()` instead of `Date.now()` inside pure render/memo functions. Always apply the `tablist`/`tab` pattern to custom pagination dots.
