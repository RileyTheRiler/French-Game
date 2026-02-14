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

## 2024-05-23 - Timing Attack on User Enumeration
**Vulnerability:** The login endpoint (in `AuthContext`) threw an error immediately if the user was not found, but performed a slow PBKDF2 verification if the user existed. This timing difference allowed an attacker to enumerate valid email addresses.
**Learning:** Even client-side authentication logic can leak information via timing differences. Duplicated code in utility files (`crypto.js`) can mask which implementation is active, leading to critical bugs where security fixes might be bypassed or incorrect signatures used.
**Prevention:** Ensure constant-time execution paths for authentication failures. Always verify a dummy hash if the user is not found. Strictly lint utility files to prevent duplicate declarations that cause ambiguous behavior.
