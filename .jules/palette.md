## 2024-05-17 - Missing Switch Roles
**Learning:** Custom switch toggles built with `button` and animated `div` elements are entirely opaque to screen readers without proper ARIA attributes.
**Action:** Ensure custom toggle elements always include `role="switch"`, `aria-checked`, and `aria-label` to provide accurate context and state for keyboard and screen reader users.
