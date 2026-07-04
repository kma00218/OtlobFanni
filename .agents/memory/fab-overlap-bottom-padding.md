---
name: Fixed FAB overlap on new full-page routes
description: New full-page routes need enough bottom padding to clear the app's fixed floating buttons, or bottom-of-form buttons get overlapped/misclicked.
---

The otlob-fanni app renders several `position: fixed` floating buttons (install prompt, search, my-requests) globally at the bottom of the viewport on every route. Any new page's scrollable content must reserve enough bottom padding (e.g. `pb-40` or more) so its own bottom-anchored buttons (form submit, CTAs) don't end up visually underneath these fixed elements.

**Why:** A new page used only `pb-10`, and e2e testing showed clicking the page's own submit button actually triggered the fixed Install FAB sitting on top of it — a silent misclick, not a validation error, so it was easy to miss without browser-based e2e testing.

**How to apply:** When adding a new full-page route to this app, check existing pages for their bottom padding convention and match/exceed it. Verify with an e2e click test on the bottom-most interactive element, not just a visual screenshot.
