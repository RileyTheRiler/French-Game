## 2024-05-22 - [Secure Password Storage]
**Vulnerability:** Plain text password storage in localStorage.
**Learning:** `AuthContext.jsx` was storing user credentials directly in `localStorage` without any hashing, exposing them to anyone with access to the browser storage or via XSS.
**Prevention:** Implemented client-side hashing using Web Crypto API (SHA-256) with a random salt before storage. While client-side hashing doesn't replace server-side security, it provides defense-in-depth for this client-side-heavy application.
