## 2024-05-23 - Client-side Password Hashing Strategy
**Vulnerability:** Passwords were stored in plaintext in localStorage.
**Learning:** Even in client-side-only apps (localStorage db), storing plaintext passwords is a critical risk (XSS/device access).
**Prevention:** Implemented SHA-256 + Salt using Web Crypto API. Added legacy migration strategy: on login, check for plaintext, verify, then hash and update storage. This avoids breaking existing users while securing them on next login.
