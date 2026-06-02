---
name: Icon name mapping rules
description: iconName in services.js, seed.ts, and DB must match PNG filenames in public/icons/categories/
---

## Rule
Every category's `iconName` must exactly match the PNG filename (without extension) in `artifacts/otlob-fanni/public/icons/categories/`.

**Why:** Three sources of truth exist — `services.js` (static fallback), `seed.ts` (DB seed), and the actual PNG files. If any diverge, icons break in production.

**How to apply:**
- When adding a new category, run: `ls artifacts/otlob-fanni/public/icons/categories/` to get valid names.
- `id !== iconName` is valid (e.g., `locks` category has `iconName: 'locks'`, not `locks_doors`).
- After fixing seed.ts, always restart the API server so the seed re-runs and updates DB values.
- Home.jsx `remainingCats` must include `iconName` in the `.map()` or non-popular categories lose their icon.
