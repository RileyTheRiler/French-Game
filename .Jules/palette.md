## 2026-01-05 - Handling ESLint False Positives in Legacy Configs
**Learning:** The ESLint flat config without specific React plugins may flag JSX component imports (like framer-motion's motion) as unused variables.
**Action:** Use inline eslint-disable comments sparingly for these specific false positives rather than reconfiguring the entire linter.
