## 2024-05-22 - Client-Side Hashing & Legacy Migration
**Vulnerability:** User passwords were stored in plaintext in `localStorage`.
**Learning:** Client-side apps without a backend often default to insecure storage. Migrating data on the client requires careful handling of "legacy" states (plaintext) vs "secure" states (hashed) during the first login after the fix.
**Prevention:** Always use `Web Crypto API` (PBKDF2/SHA-256) for any sensitive data, even in demos. Never store plaintext credentials.
# Sentinel Journal

## 2024-05-22 - Plaintext Password Storage
**Vulnerability:** User passwords were stored in plaintext in `localStorage` under `frenchApp_credentials`.
**Learning:** Even in client-side-only "simulation" apps, developers often default to plaintext storage for simplicity, underestimating the risk of XSS accessing these credentials.
**Prevention:** Always use client-side hashing (like PBKDF2 via Web Crypto API) before storing any credentials locally, even if there is no backend. This ensures that a compromised local storage (via XSS) does not yield usable passwords.

## 2024-05-23 - Unsafe Rich Text Rendering
**Vulnerability:** `dangerouslySetInnerHTML` was used in `SentenceBuilder.jsx` to render bold text (`**text**`) within feedback messages. The implementation used a simple regex replacement which failed to sanitize the remaining text, leaving it vulnerable to XSS if the input contained malicious HTML.
**Learning:** Using `dangerouslySetInnerHTML` for simple formatting (like bolding) is overkill and risky. Even with regex replacement for the "safe" parts, the "unsafe" parts remain exposed.
**Prevention:** Avoid `dangerouslySetInnerHTML`. Use a parsing function that splits the string into tokens and renders them as an array of React elements (e.g., `<span>` and `<strong>`). This ensures all content is properly escaped by React by default.

## 2026-01-25 - Duplicated Security Logic
**Vulnerability:** The `src/utils/crypto.js` file contained duplicated function definitions with conflicting signatures. The `verifyPassword` function was defined twice, with arguments swapped in the first definition versus the second.
**Learning:** In a module system, duplicate exports can lead to confusing behavior where one definition shadows another (usually the last one wins). This creates a dangerous ambiguity for security functions, where a developer might rely on the visible top definition's signature but the runtime executes the bottom one.
**Prevention:** Ensure strict linting rules (like `no-dupe-keys` or equivalent for module exports if available) are enabled. Always verify that the definition being read matches the one being executed.
