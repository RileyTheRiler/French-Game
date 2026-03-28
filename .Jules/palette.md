## 2024-05-18 - Added standard ARIA tab roles to Goal Settings Modal
**Learning:** Custom tab interfaces often lack inherent semantic meaning and keyboard navigation cues for screen readers. Connecting tab controls to their respective panels via `aria-controls` and `aria-labelledby` ensures structural clarity.
**Action:** Whenever building custom tabs or modal navigation, implement standard ARIA tab roles (`tablist`, `tab`, `tabpanel`), track state with `aria-selected`, and ensure active tabs have `focus-visible` outline styles for keyboard users.
