## 2024-05-23 - Client-Side Plain Text Password Storage
**Vulnerability:** Passwords were stored in `localStorage` in plain text.
**Learning:** Even in client-side only applications or demos, storing credentials in plain text is a dangerous habit that can leak into production mental models.
**Prevention:** Always hash passwords before storage, even if the storage is local. Use `crypto.subtle` for standard Web Crypto API hashing.
