---
name: Order number vs tracking code confusion
description: Users repeatedly typed the order number into the tracking-code field; a warning message did not fix it — accepting both values solved it.
---

Non-technical users could not reliably distinguish between a human-readable order number (e.g. `GR-432139`) and a separate random tracking code (e.g. `238Q2K`) shown at the same time on the same confirmation screen.

**Why:** A validation error explaining "this looks like an order number, not the tracking code" did not stop the recurring bug reports — users kept typing the order number anyway. The two fields conceptually compete for the same mental slot ("the thing that identifies my order").

**How to apply:** When a UI presents two similar-looking identifiers for the same entity and expects users to remember which one goes where, prefer making the system accept either value (with the same authorization check, e.g. matching phone number) over adding clearer error messages/hints. Removing the distinction from the user's perspective is more robust than better labeling.
