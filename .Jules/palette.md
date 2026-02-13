## 2024-05-23 - Modal Form Feedback
**Learning:** Auth forms inside modals (like Settings) often lack `aria-live` feedback for errors and clear loading indicators, making the state change invisible to screen readers.
**Action:** Always wrap inline form errors in `role="alert"` and use `aria-busy` on the submit button during async operations.
