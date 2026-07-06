---
name: Customer account system for general service requests
description: "My Requests" (general marketplace requests) uses username+PIN customer accounts, replacing the earlier anonymous whatsapp+tracking-code lookup.
---

The general service request marketplace ("طلباتي" / My Requests) requires a logged-in `customer_accounts` record (name, unique `whatsapp`, unique `username`, `pinHash`) before a customer can submit a request or view offers. There is no OTP/WhatsApp verification API in use — auth is username + 6-digit PIN only, checked with scrypt-hashed PINs and an HMAC-signed bearer token.

**Why:** The product owner explicitly rejected OTP/WhatsApp-API verification (cost/complexity) and rejected self-service PIN recovery (no email/SMS channel to verify identity safely). Admin-assisted PIN reset was chosen as the recovery path instead.

**How to apply:**
- `general_requests.customerAccountId` is NOT NULL and is the only way to associate a request with its owner — there is no more `trackingCode` column or whatsapp+code lookup endpoint.
- Forgotten PIN has no self-service recovery; only an admin can reset it via `POST /admin/customer-accounts/:id/reset-pin` (admin routes in this app are currently unauthenticated by design, matching the existing admin pattern — not a gap introduced by this feature).
- Frontend session token is stored in `localStorage` under `otlobCustomerSession`; `api.js` has a separate `authRequest()` helper (Bearer header) alongside the plain `get/post/patch/put/del` helpers used for public/admin routes.
