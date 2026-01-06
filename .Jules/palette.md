## 2024-05-24 - Accessibility in Loading States
**Learning:** Loading spinners and states often get missed by screen readers. Adding `role="status"` (for inline) or `role="alert"` (for full screen) with `aria-live` ensures users know something is happening.
**Action:** Always check `LoadingState` components for `role` and `aria-live` attributes. Ensure decorative spinners have `aria-hidden="true"`.
