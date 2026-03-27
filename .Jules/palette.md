## 2024-03-27 - Accessible Pagination Dots
**Learning:** Interactive pagination dots (like in GrammarModal) are often implemented as empty buttons without accessible names or keyboard focus indicators, making them invisible to screen readers and difficult to navigate via keyboard.
**Action:** Always provide a `role="tablist"` container, assign each dot `role="tab"`, track active state with `aria-selected`, provide descriptive labels, and add focus-visible utility classes for clear keyboard navigation.
