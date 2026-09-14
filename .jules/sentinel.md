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

## 2025-02-14 - Timing Attack & Duplicate Logic
**Vulnerability:** `verifyPassword` used a non-constant time comparison (`===`) for hash verification, allowing potential timing attacks. Additionally, duplicate function definitions in `src/utils/crypto.js` created ambiguity and risk of using an insecure version.
**Learning:** Copy-paste errors or bad merges can leave dangerous duplicates in utility files. Simple string comparison for hashes leaks timing information about the validity of the hash.
**Prevention:** Always use a constant-time comparison function (like `crypto.timingSafeEqual` or a manual implementation) for secrets. Ensure linting rules catch duplicate declarations to prevent ambiguous code.

## 2025-02-14 - Unsafe DOM Manipulation in Debug Scripts
**Vulnerability:** `innerHTML` was used in `src/main_debug.jsx` and `src/main_debug_dynamic.jsx` to render arbitrary strings and error messages into the DOM. This pattern created a direct Cross-Site Scripting (XSS) vulnerability if the inputs (like error messages containing user-controllable data or paths) were manipulated to include malicious HTML payloads.
**Learning:** Even in utility, debug, or developer-only entry points, using `innerHTML` to append untrusted strings or variables directly into the DOM is risky. It bypasses React's built-in escaping mechanisms.
**Prevention:** Avoid `innerHTML` entirely when handling dynamic content. Use safe DOM APIs such as `document.createElement()`, set the text using `.textContent`, and append the element using `appendChild()`, or rely on standard React component rendering where content is escaped by default.
