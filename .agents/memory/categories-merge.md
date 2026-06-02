---
name: DB + Static categories merge pattern
description: How to correctly merge DB categories with static services.js categories across the app
---

## The rule
Always use `useAllCategories()` hook (src/hooks/useAllCategories.js) instead of importing `categories` directly from `../data/services`.

**Why:** DB categories (from api.categories()) and static categories (services.js) overlap but are not identical. DB uses snake_case fields (name_ar, section_id, icon_name); static uses camelCase (nameAr, sectionId, iconName). The hook normalizes both and deduplicates by id.

**How to apply:** Replace `import { sections, categories } from '../data/services'` with `import { sections } from '../data/services'` + `import { useAllCategories } from '../hooks/useAllCategories'`, then call `const categories = useAllCategories()` at the top of the component.

**Pages already fixed:** AllSpecialties, Join, JoinCompany, CityTechnicians, Home, Section, Technicians, Companies, SpecialtyAccordion.

**Filter pattern for sections:** `categories.filter(c => (c.sectionId || c.section_id) === section.id)`
