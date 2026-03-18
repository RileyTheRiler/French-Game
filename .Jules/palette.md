## 2024-03-18 - Dynamic ARIA Labels for Playback Controls
**Learning:** Interactive playback controls, especially play/pause toggles, must have dynamic `aria-label` attributes to ensure screen readers always communicate the correct current state/action.
**Action:** Always verify that icon-only buttons, especially those toggling state (like play/pause), include an appropriate `aria-label` or `aria-expanded` attribute reflecting the active UI state.
