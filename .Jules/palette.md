# Palette's Journal

## 2026-02-16 - Custom Range Inputs Needs Context
**Learning:** Screen readers announce range inputs only as numeric values by default. For settings like "Difficulty" where values map to concepts (Beginner, Intermediate), `aria-valuetext` is critical.
**Action:** When implementing custom sliders, always map the numeric value to a descriptive string in `aria-valuetext`.
