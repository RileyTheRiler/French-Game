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
## 2025-03-30 - Fix Insecure JSON Parsing in SyncContext
**Vulnerability:** Uncaught exceptions and unhandled promise rejections from malformed or malicious JSON uploads in `SyncContext.jsx`'s `importData` method.
**Learning:** `JSON.parse` will throw a `SyntaxError` if given malformed input. When user-provided files are parsed without a `try...catch` block, the raw error stack traces can be exposed or the application can crash. Furthermore, a valid JSON array or primitive might be parsed but cause `TypeError`s when attempting to access properties like `.progress`.
**Prevention:** Always wrap `JSON.parse` in a `try...catch` block when handling user input. Catch `SyntaxError`s specifically to return safe, generic error messages (e.g., 'Invalid file format') and prevent information leakage. Verify the parsed result is a valid non-null object before property access.
