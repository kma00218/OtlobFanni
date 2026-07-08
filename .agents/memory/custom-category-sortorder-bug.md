---
name: Custom category isStandard discriminator
description: How to reliably tell seeded standard categories apart from admin-created custom ones in /categories-by-city
---

## The rule
Use `/^[a-z][a-z_]*$/.test(cat.id)` to identify standard (seeded) categories.

**Why:** All seeded category IDs are purely lowercase letters + underscores (`carpentry`, `electricity`, `car_ac`). Admin-created custom categories ALWAYS contain digits in their IDs (`k5`, `k12`, `custom_1782522673002`, UUIDs). Previous checks like `iconName !== 'more'` and `sortOrder < 90` failed because admins can assign custom icon names and the DB default `sortOrder=0` for admin categories beats seeded `sortOrder=5`.

**How to apply:** In the `normToCanonical` building loop in `/categories-by-city`, always prefer a category where `isStandard(cat)` is true over one where it is false. Use sortOrder only as a tiebreaker between two categories of the same tier (both standard or both custom).
