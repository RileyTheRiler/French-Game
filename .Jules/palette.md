# Palette's Journal

## 2025-02-18 - Accessible Custom Sliders
**Learning:** Custom range inputs (where the real input is hidden) often lose focus visibility. Using the Tailwind `peer` class on the input and `peer-focus-visible` on the custom thumb allows for accessible focus rings without JavaScript.
**Action:** Use `peer` + `peer-focus-visible` for all custom form controls where the interactive element is a sibling of the visual element.
