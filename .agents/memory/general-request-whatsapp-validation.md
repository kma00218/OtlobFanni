---
name: General request WhatsApp number missing length validation
description: The "New Request" (general marketplace request) form let customers submit an incomplete WhatsApp number, silently corrupting the record used later for self-service tracking.
---

`LibyaPhoneInput` only enforces a `maxLength={9}` on its input (a UI cap), it does not enforce a minimum. The general-request creation form (`MyRequests.jsx` NewRequest) only checked the fields were non-empty, not that the WhatsApp number had the full 9 local digits after `+218`. A customer could submit e.g. 5-7 digits and the record would save with a truncated `whatsapp` value.

**Why:** Later, when the same customer tries to self-track their request by typing their *real* full WhatsApp number, the normalized digits won't match the truncated value stored in the DB, and tracking silently returns "not found" with no way to tell the number was wrong at creation time, not at lookup time.

**How to apply:** Any form writing to `general_requests.whatsapp` (or similar customer-identifying phone fields used for later lookup) must validate exactly 9 local digits before submit, matching what `RequestFormModal.jsx` already does — and the backend route should reject malformed numbers too (defense in depth), since a single unvalidated client is enough to corrupt lookups permanently.
