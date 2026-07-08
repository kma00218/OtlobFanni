---
name: Custom category icon resolution in /categories-by-city
description: Full approach for resolving admin-created custom categories to standard seeded ones for correct icon display
---

## The rule
Use a two-pass resolution in `/categories-by-city`:
1. **Pass 1 (exact)**: normalized Arabic name → canonical. Standard categories (`/^[a-z][a-z_]*$/.test(id)`) always beat custom ones.
2. **Pass 2 (word-level)**: if no exact match, check individual meaningful words (stripped of "ال" and filler words) against a word→standard map. Handles reversed word order like "إنترنت وشبكات" vs standard "شبكات وإنترنت".
3. **Skip unresolvable**: custom categories that can't be resolved AND have `iconName='more'` or null are dropped — never shown with mosaic icon.

**Why:** Admin-created categories differ from seeded standard ones in three ways that cause failures:
- `sortOrder=0` (DB default) beats seeded `sortOrder=5` — fixed by regex ID check
- `iconName != 'more'` (admin uploaded custom icon) — regex check handles this too
- Different word order in Arabic name ("إنترنت وشبكات" vs "شبكات وإنترنت") — fixed by word-level matching

**Standard ID discriminator:** `/^[a-z][a-z_]*$/.test(cat.id)` — all seeded IDs are pure lowercase letters + underscores (no digits). Admin IDs always contain digits: `k5`, `k12`, `custom_1782522673002`, UUIDs.

**How to apply:** Keep this two-pass logic in the `/categories-by-city` endpoint any time category icon resolution is needed. If new custom category names fail to resolve, add their meaningful words to the stop-word filter or check for normalization issues.
