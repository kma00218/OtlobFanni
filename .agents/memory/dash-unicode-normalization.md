---
name: Dash-like unicode normalization for user-typed codes
description: Mobile keyboards silently substitute lookalike dash characters for "-", breaking exact-string code lookups (order numbers, tracking codes, coupon codes, etc.)
---

Some mobile keyboards (notably iOS "smart punctuation") silently swap a
typed ASCII hyphen "-" for a visually identical unicode character — non-
breaking hyphen (U+2011), en dash (U+2013), em dash (U+2014), or minus
sign (U+2212) — even with `autoCorrect="off"` set on the input. Invisible
bidi/zero-width marks (U+200B-U+200F, U+202A-U+202E, U+2060, U+FEFF) can
also get inserted around RTL/LTR mixed text.

**Why:** A real user's valid order (format `GR-123456`) was reported as
"not found" when tracking, even though the record existed and manual
exact-string API calls succeeded. The mismatch was invisible in the UI
since the character renders identically to a normal hyphen.

**How to apply:** Any field where a user types or pastes a short
alphanumeric code that must exact-match a stored value (order numbers,
tracking codes, coupon/referral codes, etc.) should be normalized on
BOTH sides before comparison:
- collapse dash-like unicode variants to plain "-"
- strip invisible bidi/zero-width characters
- uppercase + trim whitespace

Apply normalization client-side (before sending) AND server-side
(defensively, in case other callers hit the API directly). See
`normalizeCode()` in `artifacts/api-server/src/routes/public.ts` and
`artifacts/otlob-fanni/src/pages/MyRequests.jsx` for the reference
implementation.
