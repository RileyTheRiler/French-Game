1. Execute a `script.cjs` Node.js script to add aria-label attributes to the icon-only buttons in `src/components/Messaging/ChatInterface.jsx`.
2. Run `git diff src/components/Messaging/ChatInterface.jsx` to verify the unstaged modifications.
3. Run `rm script.cjs`.
4. Run `pnpm lint`.
5. Run `npx vitest run src/components/Messaging/ChatInterface.jsx`.
6. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
7. Submit the pull request with the title '🎨 Palette: [Add ARIA labels to chat interface]' and a description explicitly including the sections '💡 What', '🎯 Why', '📸 Before/After', and '♿ Accessibility'.
