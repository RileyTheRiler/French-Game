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

## 2024-05-24 - Timing Attacks on Password Verification
**Vulnerability:** The `verifyPassword` function used strict equality (`===`) to compare the computed hash with the stored hash. This is vulnerable to timing attacks, where an attacker can deduce the hash one byte at a time by measuring how long the comparison takes.
**Learning:** Even in client-side environments, timing attacks are a theoretical risk, especially if the verification logic is reused in other contexts (like server-side validation). Standard equality operators fail fast on the first mismatched byte, leaking information about the hash content.
**Prevention:** Implement and use a `constantTimeEqual` function that iterates through the entire string regardless of where the mismatch occurs. Use bitwise XOR (`^`) to accumulate differences.
