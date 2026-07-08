import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable,
  adsTable, technicianApplicationsTable, companyApplicationsTable,
  adRequestsTable, serviceRequestsTable, reviewsTable,
  supplierApplicationsTable, updateReportsTable, proCredentialsTable,
  referralsTable, analyticsEventsTable, profileUpdateRequestsTable,
  dealsTable, generalRequestsTable, generalOffersTable, customerAccountsTable,
} from "@workspace/db/schema";
import crypto from "crypto";
import { eq, and, or, desc, inArray, ilike, sql, count } from "drizzle-orm";
import { expandSearchTerms } from "../lib/synonyms";
import { hashPin, verifyPin, signCustomerToken, verifyCustomerToken } from "../lib/customerAuth";
import { analyzeCustomerRequest } from "../lib/aiTags";

const router: IRouter = Router();

// ── Cities ──────────────────────────────────────────────────────────────────
router.get("/cities", async (_req, res): Promise<void> => {
  const cities = await db.select().from(citiesTable).orderBy(citiesTable.sortOrder);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json(cities);
});

// ── City Stats (counts per city across all entity types) ─────────────────────
router.get("/city-stats", async (_req, res): Promise<void> => {
  const [cities, techCounts, allCompanies, allSuppliers] = await Promise.all([
    db.select().from(citiesTable).orderBy(citiesTable.sortOrder),
    db.select({ cityId: techniciansTable.cityId, cnt: count() })
      .from(techniciansTable)
      .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true)))
      .groupBy(techniciansTable.cityId),
    db.select({ city: companyApplicationsTable.city })
      .from(companyApplicationsTable)
      .where(eq(companyApplicationsTable.status, 'published')),
    db.select({ city: supplierApplicationsTable.city })
      .from(supplierApplicationsTable)
      .where(eq(supplierApplicationsTable.status, 'published')),
  ]);

  const techMap: Record<string, number> = {};
  for (const t of techCounts) { if (t.cityId) techMap[t.cityId] = Number(t.cnt); }

  const result = cities.map(city => {
    const keys = [city.id, city.nameAr, city.nameEn].filter(Boolean);
    const companies = allCompanies.filter(c => keys.includes(c.city ?? '')).length;
    const suppliers = allSuppliers.filter(s => keys.includes(s.city ?? '')).length;
    const technicians = techMap[city.id] || 0;
    return { id: city.id, nameAr: city.nameAr, nameEn: city.nameEn, technicians, companies, suppliers, total: technicians + companies + suppliers };
  });

  res.set("Cache-Control", "public, max-age=180, stale-while-revalidate=300");
  res.json(result);
});

// ── Categories by City (with provider counts) ─────────────────────────────────
router.get("/categories-by-city", async (req, res): Promise<void> => {
  const { cityId } = req.query;
  if (!cityId || typeof cityId !== "string") {
    res.status(400).json({ error: "cityId required" });
    return;
  }

  // Resolve city names so we can match companies (stored by name, not id)
  const [cityRow] = await db.select({ nameAr: citiesTable.nameAr, nameEn: citiesTable.nameEn })
    .from(citiesTable).where(eq(citiesTable.id, cityId));
  const cityKeys = [cityId, cityRow?.nameAr, cityRow?.nameEn].filter(Boolean) as string[];

  // Load technicians + companies for this city, then compute category IDs client-side
  // to avoid SQL array parameterization issues with node-postgres
  const [techRows, compRows, categories] = await Promise.all([
    db.select({ categoryId: techniciansTable.categoryId, extraSpecialties: techniciansTable.extraSpecialties })
      .from(techniciansTable)
      .where(and(
        eq(techniciansTable.isApproved, true),
        eq(techniciansTable.isActive, true),
        eq(techniciansTable.cityId, cityId),
      )),
    db.select({ specialty: companyApplicationsTable.specialty, extraSpecialties: companyApplicationsTable.extraSpecialties })
      .from(companyApplicationsTable)
      .where(and(
        eq(companyApplicationsTable.status, "published"),
        inArray(companyApplicationsTable.city, cityKeys),
      )),
    db.select().from(categoriesTable),
  ]);

  // Collect all category IDs from every source
  const presentIds = new Set<string>();
  for (const t of techRows) {
    if (t.categoryId) presentIds.add(t.categoryId);
    if (Array.isArray(t.extraSpecialties)) t.extraSpecialties.forEach(s => s && presentIds.add(s));
  }
  for (const c of compRows) {
    if (c.specialty) presentIds.add(c.specialty);
    if (Array.isArray(c.extraSpecialties)) c.extraSpecialties.forEach(s => s && presentIds.add(s));
  }

  // Normalize Arabic text for fuzzy name matching:
  // handles ة↔ه, أ/إ/آ↔ا, ى↔ي, tashkeel removal, extra spaces
  function normalizeAr(s: string): string {
    return s.trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove harakat/diacritics
      .replace(/\s+/g, ' ');
  }

  // Build normalized-name → canonical (lowest sortOrder) map across ALL categories
  const normToCanonical = new Map<string, typeof categories[0]>();
  for (const cat of categories) {
    const key = normalizeAr(cat.nameAr);
    const existing = normToCanonical.get(key);
    if (!existing || (cat.sortOrder ?? 99) < (existing.sortOrder ?? 99)) {
      normToCanonical.set(key, cat);
    }
  }

  // For each present category ID, resolve to the canonical entry using normalized matching
  const deduped = new Map<string, { id: string; nameAr: string; nameEn: string | null; iconName: string | null; sortOrder: number }>();
  for (const catId of presentIds) {
    const cat = categories.find(c => c.id === catId);
    if (!cat) continue;
    const canonical = normToCanonical.get(normalizeAr(cat.nameAr)) ?? cat;
    const sortOrder = canonical.sortOrder ?? 99;
    const key = normalizeAr(canonical.nameAr);
    const existing = deduped.get(key);
    if (!existing || sortOrder < existing.sortOrder) {
      deduped.set(key, {
        id: canonical.id,
        nameAr: canonical.nameAr,
        nameEn: canonical.nameEn,
        iconName: canonical.iconName,
        sortOrder,
      });
    }
  }

  const result = [...deduped.values()].sort((a, b) => a.sortOrder - b.sortOrder);

  res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
  res.json(result);
});

// ── Providers Count (pre-submission preview) ──────────────────────────────────
router.get("/providers-count", async (req, res): Promise<void> => {
  const { cityId, categoryId } = req.query;
  const conditions = [
    eq(techniciansTable.isApproved, true),
    eq(techniciansTable.isActive, true),
  ];
  if (cityId && typeof cityId === "string") conditions.push(eq(techniciansTable.cityId, cityId));
  if (categoryId && typeof categoryId === "string") conditions.push(eq(techniciansTable.categoryId, categoryId));
  const [{ cnt }] = await db.select({ cnt: count() }).from(techniciansTable).where(and(...conditions));
  res.json({ count: Number(cnt) });
});

// ── AI Analyze Customer Request (public) ──────────────────────────────────────
router.post("/ai/analyze-request", async (req, res): Promise<void> => {
  const { description } = req.body;
  if (!description || typeof description !== "string" || description.trim().length < 5) {
    res.status(400).json({ error: "description too short" });
    return;
  }
  try {
    const tags = await analyzeCustomerRequest(description.trim());
    res.json({ tags });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[AI] analyze-request error:", msg);
    res.status(500).json({ error: "AI service error" });
  }
});

// ── Dynamic Sitemap ───────────────────────────────────────────────────────────
router.get("/sitemap.xml", async (_req, res): Promise<void> => {
  const [cities, techCounts, allCompanies, allSuppliers] = await Promise.all([
    db.select().from(citiesTable),
    db.select({ cityId: techniciansTable.cityId, cnt: count() })
      .from(techniciansTable)
      .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true)))
      .groupBy(techniciansTable.cityId),
    db.select({ city: companyApplicationsTable.city })
      .from(companyApplicationsTable)
      .where(or(eq(companyApplicationsTable.status, 'approved'), eq(companyApplicationsTable.status, 'published'))),
    db.select({ city: supplierApplicationsTable.city })
      .from(supplierApplicationsTable)
      .where(eq(supplierApplicationsTable.status, 'published')),
  ]);

  const techMap: Record<string, number> = {};
  for (const t of techCounts) { if (t.cityId) techMap[t.cityId] = Number(t.cnt); }

  const strongCities = cities.filter(city => {
    const keys = [city.id, city.nameAr, city.nameEn].filter(Boolean);
    const total = (techMap[city.id] || 0)
      + allCompanies.filter(c => keys.includes(c.city ?? '')).length
      + allSuppliers.filter(s => keys.includes(s.city ?? '')).length;
    return total >= 3;
  });

  const base = 'https://otlobfanni.ly';
  const staticUrls = [
    { loc: base,                    priority: '1.0', changefreq: 'daily'  },
    { loc: `${base}/categories`,    priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/city/libya`,    priority: '0.8', changefreq: 'daily'  },
    { loc: `${base}/suppliers`,     priority: '0.8', changefreq: 'daily'  },
    { loc: `${base}/join-us`,       priority: '0.6', changefreq: 'monthly'},
  ];
  const cityUrls = strongCities.map(c => ({
    loc: `${base}/city/${c.id}`, priority: '0.7', changefreq: 'daily',
  }));

  const allUrls = [...staticUrls, ...cityUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

// ── Categories ───────────────────────────────────────────────────────────────
router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(categoriesTable.sortOrder);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.json(categories);
});

// ── Check if WhatsApp number already registered ──────────────────────────────
router.get("/check-whatsapp", async (req, res): Promise<void> => {
  const raw = String(req.query.number || "").replace(/\D/g, "");
  if (raw.length < 7) { res.json({ available: true }); return; }

  const suffix = raw.slice(-9);

  const [inTechs] = await db
    .select({ id: techniciansTable.id })
    .from(techniciansTable)
    .where(sql`regexp_replace(${techniciansTable.whatsapp}, '[^0-9]', '', 'g') LIKE ${'%' + suffix}`)
    .limit(1);

  if (inTechs) { res.json({ available: false }); return; }

  const excludeId   = String(req.query.excludeId   || "");
  const excludeType = String(req.query.excludeType || "");

  const notRejected = (col: any) =>
    sql`${col} NOT IN ('rejected', 'deleted')`;
  const matchWa = (col: any) =>
    sql`regexp_replace(${col}, '[^0-9]', '', 'g') LIKE ${'%' + suffix}`;
  const notSelf = (col: any, type: string) =>
    excludeId && excludeType === type
      ? sql`${col} != ${excludeId}`
      : sql`1=1`;

  const [inTechApps] = await db
    .select({ id: technicianApplicationsTable.id })
    .from(technicianApplicationsTable)
    .where(and(matchWa(technicianApplicationsTable.whatsapp), notRejected(technicianApplicationsTable.status), notSelf(technicianApplicationsTable.id, 'tech_app')))
    .limit(1);
  if (inTechApps) { res.json({ available: false }); return; }

  const [inCompApps] = await db
    .select({ id: companyApplicationsTable.id })
    .from(companyApplicationsTable)
    .where(and(matchWa(companyApplicationsTable.whatsapp), notRejected(companyApplicationsTable.status), notSelf(companyApplicationsTable.id, 'company_app')))
    .limit(1);
  if (inCompApps) { res.json({ available: false }); return; }

  const [inSuppliers] = await db
    .select({ id: supplierApplicationsTable.id })
    .from(supplierApplicationsTable)
    .where(and(matchWa(supplierApplicationsTable.whatsapp), notRejected(supplierApplicationsTable.status), notSelf(supplierApplicationsTable.id, 'supplier_app')))
    .limit(1);

  res.json({ available: !inSuppliers });
});

// ── Popular categories (sorted by real demand: clicks + technician count) ─────
router.get("/categories/popular", async (_req, res): Promise<void> => {
  const limit = 14;

  // Get click counts per category from analytics (last 30 days)
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicks = await db
    .select({ ref: sql<string>`${analyticsEventsTable.ref}`, cnt: count() })
    .from(analyticsEventsTable)
    .where(sql`${analyticsEventsTable.event} = 'category_click' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
    .groupBy(analyticsEventsTable.ref);

  // Get technician count per category
  const techCounts = await db
    .select({ categoryId: techniciansTable.categoryId, cnt: count() })
    .from(techniciansTable)
    .where(and(eq(techniciansTable.isActive, true), eq(techniciansTable.isApproved, true)))
    .groupBy(techniciansTable.categoryId);

  const clickMap: Record<string, number> = {};
  clicks.forEach(r => { if (r.ref) clickMap[r.ref] = Number(r.cnt); });

  const techMap: Record<string, number> = {};
  techCounts.forEach(r => { if (r.categoryId) techMap[r.categoryId] = Number(r.cnt); });

  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(categoriesTable.sortOrder);

  // Score: clicks × 3 + technician count × 1, then sortOrder as tiebreaker
  const scored = categories
    .map(c => ({
      ...c,
      _score: (clickMap[c.id] ?? 0) * 3 + (techMap[c.id] ?? 0),
    }))
    .sort((a, b) => b._score - a._score || a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map(({ _score, ...c }) => c);

  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  res.json(scored);
});

// ── Public directory stats ───────────────────────────────────────────────────
router.get("/stats", async (_req, res): Promise<void> => {
  const [techs] = await db
    .select({ count: count() })
    .from(techniciansTable)
    .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true)));

  const [companies] = await db
    .select({ count: count() })
    .from(companyApplicationsTable)
    .where(or(eq(companyApplicationsTable.status, 'approved'), eq(companyApplicationsTable.status, 'published')));

  const [suppliers] = await db
    .select({ count: count() })
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.status, 'published'));

  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  res.json({
    technicians: Number(techs.count),
    companies:   Number(companies.count),
    suppliers:   Number(suppliers.count),
  });
});

// ── Category counts (active technicians per category) ────────────────────────
// Counts both primary categoryId AND entries in extraSpecialties, matching the
// same logic used by GET /technicians?category=X
router.get("/category-counts", async (_req, res): Promise<void> => {
  const rows = await db.execute<{ cat_id: string; cnt: string }>(sql`
    SELECT cat_id, COUNT(DISTINCT id) AS cnt
    FROM (
      SELECT id, category_id AS cat_id
      FROM technicians
      WHERE is_approved = true AND is_active = true AND category_id IS NOT NULL
      UNION ALL
      SELECT id, unnest(extra_specialties) AS cat_id
      FROM technicians
      WHERE is_approved = true AND is_active = true
      UNION ALL
      SELECT id, specialty AS cat_id
      FROM company_applications
      WHERE status = 'published' AND specialty IS NOT NULL AND specialty <> ''
      UNION ALL
      SELECT id, unnest(extra_specialties) AS cat_id
      FROM company_applications
      WHERE status = 'published'
    ) t
    GROUP BY cat_id
  `);

  const map: Record<string, number> = {};
  rows.rows.forEach(r => { if (r.cat_id) map[r.cat_id] = Number(r.cnt); });
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  res.json(map);
});

// ── Technicians (public directory) ───────────────────────────────────────────
router.get("/technicians", async (req, res): Promise<void> => {
  const { category, city_id } = req.query as Record<string, string>;

  // Libya = all cities, skip city filter
  const allLibya = city_id === 'libya';

  const conditions = [
    eq(techniciansTable.isApproved, true),
    eq(techniciansTable.isActive, true),
  ];

  if (category) {
    conditions.push(
      or(
        eq(techniciansTable.categoryId, category),
        sql`${category} = ANY(${techniciansTable.extraSpecialties})`
      )!
    );
  }
  if (city_id && !allLibya) {
    conditions.push(eq(techniciansTable.cityId, city_id));
  }

  const rows = await db
    .select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
    .where(and(...conditions))
    .orderBy(desc(techniciansTable.isFeatured), desc(techniciansTable.rating));

  const techs = rows.map(r => ({
    ...r.tech,
    city_name_ar: r.cityNameAr ?? '',
    city_name_en: r.cityNameEn ?? '',
    categoryAr: r.categoryAr ?? '',
    categoryEn: r.categoryEn ?? '',
    categoryIconName: r.categoryIconName ?? '',
  }));

  res.json(techs);
});

// ── Companies (public directory — published only) ──────────────────────────────
router.get("/companies", async (req, res): Promise<void> => {
  const { specialty, city } = req.query as Record<string, string>;

  const companyRows = await db
    .select({
      company: companyApplicationsTable,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    })
    .from(companyApplicationsTable)
    .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
    .where(eq(companyApplicationsTable.status, "published"))
    .orderBy(desc(companyApplicationsTable.createdAt));

  let companies = companyRows.map(r => ({
    ...r.company,
    categoryAr: r.categoryAr ?? r.company.specialty ?? '',
    categoryEn: r.categoryEn ?? r.company.specialty ?? '',
    categoryIconName: r.categoryIconName ?? '',
  }));

  if (specialty) companies = companies.filter(c =>
    c.specialty === specialty ||
    (Array.isArray(c.extra_specialties) && c.extra_specialties.includes(specialty)) ||
    (Array.isArray((c as any).extraSpecialties) && (c as any).extraSpecialties.includes(specialty))
  );

  if (city && city !== 'libya') {
    // city param may be a city ID (e.g. "c2") or a plain name — resolve to both Arabic + English names
    const [cityRow] = await db.select().from(citiesTable).where(eq(citiesTable.id, city));
    if (cityRow) {
      companies = companies.filter(c =>
        c.city === cityRow.nameAr ||
        c.city === cityRow.nameEn ||
        c.city === cityRow.id
      );
    } else {
      // fallback: treat city as a plain text match
      companies = companies.filter(c => c.city === city);
    }
  }

  res.json(companies);
});

// ── Single Company ────────────────────────────────────────────────────────────
router.get("/companies/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db
    .select({
      company: companyApplicationsTable,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    })
    .from(companyApplicationsTable)
    .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
    .where(and(eq(companyApplicationsTable.id, raw), inArray(companyApplicationsTable.status, ["approved", "published"])));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...row.company,
    categoryAr: row.categoryAr ?? row.company.specialty ?? '',
    categoryEn: row.categoryEn ?? row.company.specialty ?? '',
    categoryIconName: row.categoryIconName ?? '',
  });
});

// ── Libya keyword detection ───────────────────────────────────────────────────
const LIBYA_KEYWORDS = ['libya', 'lybia', 'libia', 'liby', 'lby', 'ليبيا', 'ليبا', 'ليب', 'كل ليبيا'];
function isLibyaQuery(q: string): boolean {
  const lower = q.toLowerCase().trim();
  return LIBYA_KEYWORDS.some(kw => kw.startsWith(lower) || lower.startsWith(kw));
}

// ── Global search: technicians + companies + cities ───────────────────────────
const SUPPLY_TYPES = [
  { id: 'workshop_tools',     ar: 'معدات ورش',           en: 'Workshop Tools'     },
  { id: 'electrical_tools',   ar: 'أدوات كهرباء',         en: 'Electrical Tools'   },
  { id: 'plumbing_supplies',  ar: 'مواد سباكة',           en: 'Plumbing Supplies'  },
  { id: 'ac_equipment',       ar: 'معدات تكييف',          en: 'AC Equipment'       },
  { id: 'security_cameras',   ar: 'كاميرات وأنظمة أمن',   en: 'Security Systems'   },
  { id: 'auto_parts',         ar: 'قطع غيار سيارات',      en: 'Auto Parts'         },
  { id: 'auto_tools',         ar: 'أدوات سيارات',         en: 'Auto Tools'         },
  { id: 'safety_equipment',   ar: 'معدات سلامة',          en: 'Safety Equipment'   },
  { id: 'building_materials', ar: 'مواد بناء وتشطيب',     en: 'Building Materials' },
  { id: 'other',              ar: 'أخرى',                en: 'Other'              },
];

router.get("/search", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (!q) { res.json({ technicians: [], companies: [], cities: [] }); return; }

  // Libya shortcut — return synthetic Libya entry + skip normal city/tech search
  if (isLibyaQuery(q)) {
    res.json({
      technicians: [],
      companies: [],
      cities: [{ id: 'libya', nameAr: 'كل ليبيا', nameEn: 'All Libya' }],
    });
    return;
  }

  const terms = expandSearchTerms(q);
  const techWhere = terms.flatMap(t => [
    ilike(techniciansTable.nameAr, `%${t}%`),
    ilike(techniciansTable.nameEn, `%${t}%`),
    ilike(techniciansTable.descriptionAr, `%${t}%`),
    ilike(techniciansTable.descriptionEn, `%${t}%`),
    ilike(citiesTable.nameAr, `%${t}%`),
    ilike(citiesTable.nameEn, `%${t}%`),
    ilike(categoriesTable.nameAr, `%${t}%`),
    ilike(categoriesTable.nameEn, `%${t}%`),
    sql`CAST(${techniciansTable.extraSpecialties} AS text) ILIKE ${'%' + t + '%'}`,
    sql`CAST(${techniciansTable.aiTags} AS text) ILIKE ${'%' + t + '%'}`,
  ]);
  const companyWhere = terms.flatMap(t => [
    ilike(companyApplicationsTable.companyName, `%${t}%`),
    ilike(companyApplicationsTable.contactName, `%${t}%`),
    ilike(companyApplicationsTable.description, `%${t}%`),
    ilike(companyApplicationsTable.city, `%${t}%`),
    ilike(categoriesTable.nameAr, `%${t}%`),
    ilike(categoriesTable.nameEn, `%${t}%`),
    sql`CAST(${(companyApplicationsTable as any).aiTags} AS text) ILIKE ${'%' + t + '%'}`,
  ]);
  const cityWhere = terms.flatMap(t => [
    ilike(citiesTable.nameAr, `%${t}%`),
    ilike(citiesTable.nameEn, `%${t}%`),
  ]);
  // Find supply type IDs whose Arabic or English label matches any search term
  const matchedTypeIds = SUPPLY_TYPES
    .filter(st => terms.some(t =>
      st.ar.includes(t) || t.includes(st.ar.split(' ')[0]) ||
      st.en.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(st.en.toLowerCase().split(' ')[0])
    ))
    .map(st => st.id);

  const supplierWhere = [
    ...terms.flatMap(t => [
      ilike(supplierApplicationsTable.businessName, `%${t}%`),
      ilike(supplierApplicationsTable.contactName, `%${t}%`),
      ilike(supplierApplicationsTable.description, `%${t}%`),
      ilike(supplierApplicationsTable.customSupplyType, `%${t}%`),
      ilike(supplierApplicationsTable.city, `%${t}%`),
      ilike(supplierApplicationsTable.area, `%${t}%`),
      sql`CAST(${(supplierApplicationsTable as any).aiTags} AS text) ILIKE ${'%' + t + '%'}`,
    ]),
    // Match by supply type label (Arabic or English)
    ...(matchedTypeIds.length > 0 ? [inArray(supplierApplicationsTable.supplyType, matchedTypeIds)] : []),
  ];

  const [techRows, companyRows, cityRows, supplierRows] = await Promise.all([
    db.select({
        tech: techniciansTable,
        cityNameAr: citiesTable.nameAr,
        cityNameEn: citiesTable.nameEn,
        categoryAr: categoriesTable.nameAr,
        categoryEn: categoriesTable.nameEn,
        categoryIconName: categoriesTable.iconName,
      })
      .from(techniciansTable)
      .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
      .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
      .where(and(
        eq(techniciansTable.isApproved, true),
        eq(techniciansTable.isActive, true),
        or(...techWhere),
      ))
      .orderBy(desc(techniciansTable.isFeatured), desc(techniciansTable.rating))
      .limit(50),

    db.select({
        company: companyApplicationsTable,
        categoryAr: categoriesTable.nameAr,
        categoryEn: categoriesTable.nameEn,
        categoryIconName: categoriesTable.iconName,
      })
      .from(companyApplicationsTable)
      .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
      .where(and(
        eq(companyApplicationsTable.status, "published"),
        or(...companyWhere),
      ))
      .limit(50),

    db.select().from(citiesTable)
      .where(or(...cityWhere))
      .orderBy(citiesTable.sortOrder)
      .limit(20),

    db.select({
        id: supplierApplicationsTable.id,
        businessName: supplierApplicationsTable.businessName,
        city: supplierApplicationsTable.city,
        supplyType: supplierApplicationsTable.supplyType,
        customSupplyType: supplierApplicationsTable.customSupplyType,
        logo: supplierApplicationsTable.logo,
      })
      .from(supplierApplicationsTable)
      .where(and(
        eq(supplierApplicationsTable.status, "published"),
        or(...supplierWhere),
      ))
      .limit(50),
  ]);

  res.json({
    technicians: techRows.map(r => ({
      id: r.tech.id,
      nameAr: r.tech.nameAr,
      nameEn: r.tech.nameEn,
      profilePhoto: r.tech.profilePhoto,
      categoryAr: r.categoryAr ?? '',
      categoryEn: r.categoryEn ?? '',
      categoryIconName: r.categoryIconName ?? '',
      cityNameAr: r.cityNameAr ?? '',
      cityNameEn: r.cityNameEn ?? '',
      extraSpecialties: r.tech.extraSpecialties ?? [],
    })),
    companies: companyRows.map(r => ({
      id: r.company.id,
      companyName: r.company.companyName,
      city: r.company.city,
      categoryAr: r.categoryAr ?? '',
      categoryEn: r.categoryEn ?? '',
      categoryIconName: r.categoryIconName ?? '',
      companyLogo: r.company.companyLogo,
      extra_specialties: (r.company as any).extra_specialties ?? [],
      specialty: r.company.specialty ?? '',
    })),
    cities: cityRows.map(c => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
    })),
    suppliers: supplierRows.map(s => ({
      id: s.id,
      businessName: s.businessName,
      city: s.city,
      supplyType: s.supplyType,
      customSupplyType: s.customSupplyType,
      logo: s.logo,
    })),
  });
});

// ── Smart Search ─────────────────────────────────────────────────────────────
// Keyword → category mapping for Arabic problem descriptions
const SMART_KEYWORD_MAP: { keywords: string[]; categories: string[] }[] = [
  { keywords: ['مكيف','تكييف','سبليت','بارد','تبريد','برودة','مكيفات','لا يبرد','ما يبرد'], categories: ['ac','car_ac'] },
  { keywords: ['كهرباء','كهربائي','كهربة','تمديد كهربائي','أسلاك','لوحة كهرباء','بريكر','فيوز','كابل','انقطع الكهرباء','ضوء','إضاءة'], categories: ['electricity','backup_power','battery_inverter'] },
  { keywords: ['سباكة','سباك','تسريب','حنفية','أنبوب','مجاري','حمام','مرحاض','بيارة','تصريف','مياه','ماء سرب'], categories: ['plumbing'] },
  { keywords: ['نجارة','نجار','خشب','مطبخ خشب','خزانة خشب','رف','أرفف خشبية'], categories: ['carpentry','furniture_install'] },
  { keywords: ['تركيب أثاث','أثاث','موبيليا','سرير','خزانة','طاولة تركيب'], categories: ['furniture_install'] },
  { keywords: ['دهان','طلاء','صبغ','دهانة','بوية','تشطيب','دهن'], categories: ['painting'] },
  { keywords: ['كاميرات','كاميرا','مراقبة','cctv','تصوير أمني','كاميرات مراقبة','نظام مراقبة'], categories: ['cctv','shop_cctv'] },
  { keywords: ['كاميرات محل','مراقبة محل','تجهيز محل'], categories: ['shop_cctv'] },
  { keywords: ['بلاط','سيراميك','أرضية','بلاطة','فرش أرضية','رخام'], categories: ['tiles'] },
  { keywords: ['ألمنيوم','زجاج','نافذة','شباك','بلوني','واجهة زجاجية','شبابيك'], categories: ['aluminum'] },
  { keywords: ['أقفال','قفل','مفتاح','باب','تكسير قفل','فتح باب','أبواب'], categories: ['locks'] },
  { keywords: ['ثلاجة','غسالة','تلفزيون','شاشة','ميكروويف','فرن','مجفف','تصليح جهاز'], categories: ['appliances'] },
  { keywords: ['سقف','أسطح','تسقيف','سطح','حرارة من السقف','عزل سقف'], categories: ['roofing'] },
  { keywords: ['غاز','بوتاجاز','أنابيب غاز','تأسيس غاز','غاز مركزي'], categories: ['gas'] },
  { keywords: ['إنذار','حريق','جرس إنذار','نظام إنذار','انذار'], categories: ['alarm'] },
  { keywords: ['مولد','مولدات','جنريتور','كهرباء احتياطية','طاقة احتياطية'], categories: ['generator_install','battery_inverter'] },
  { keywords: ['بطارية','انفرتر','inverter','اوبس','ups','طاقة شمسية','سولار','ألواح شمسية'], categories: ['battery_inverter'] },
  { keywords: ['مسبح','حوض سباحة','سباحة','بيسين'], categories: ['pool_cleaning'] },
  { keywords: ['خزان','صهريج','تنظيف خزان','خزان ماء'], categories: ['tank_cleaning'] },
  { keywords: ['حدائق','حديقة','أشجار','نباتات','عشب','نخيل','تنسيق حديقة'], categories: ['landscaping'] },
  { keywords: ['تنظيف منزل','تنظيف بيت','نظافة منزلية','خادمة','مساعدة منزلية'], categories: ['home_help'] },
  { keywords: ['تنظيف مكتب','تنظيف شركة','تنظيف مبنى','نظافة مكاتب'], categories: ['office_cleaning'] },
  { keywords: ['تنظيف','نظافة','كنس','مسح','تلميع'], categories: ['home_help','office_cleaning'] },
  { keywords: ['حشرات','صراصير','بق','نمل','فئران','قوارض','مكافحة حشرات'], categories: ['pest_control'] },
  { keywords: ['نقل أثاث','انتقال','عفش','نقل عفش','نقل أغراض'], categories: ['moving'] },
  { keywords: ['نقل ثقيل','شاحنة','حمل ثقيل'], categories: ['heavy_transport'] },
  { keywords: ['تحميل','تنزيل','نقل بضاعة'], categories: ['loading'] },
  { keywords: ['مصعد','أسانسير','ليفت'], categories: ['elevators'] },
  { keywords: ['خرسانة','بناء','أساسات','هيكل'], categories: ['concrete','contracting'] },
  { keywords: ['مقاولات','مقاول','إنشاء','تشييد','بناء منزل'], categories: ['contracting','eng_consultancy'] },
  { keywords: ['عزل مائي','رطوبة','تسريب ماء من الجدار'], categories: ['waterproof'] },
  { keywords: ['عزل حراري','حرارة شديدة','حرارة مبنى'], categories: ['thermal'] },
  { keywords: ['مضخة','مضخات مياه','ضخ مياه'], categories: ['pumps'] },
  { keywords: ['ميكانيك','سيارة لا تشتغل','محرك','سيارة عطلانة','تصليح سيارة'], categories: ['car_mechanic'] },
  { keywords: ['كهربائي سيارة','كهرباء سيارة','بطارية سيارة تالفة'], categories: ['auto_electrician','car_battery'] },
  { keywords: ['تكييف سيارة','مكيف سيارة'], categories: ['car_ac'] },
  { keywords: ['بنشر','إطار','عجلة','كاوتش','تغيير إطار'], categories: ['tire_repair'] },
  { keywords: ['تغيير زيت','فلتر زيت','صيانة سيارة'], categories: ['oil_change'] },
  { keywords: ['فحص سيارة','كمبيوتر سيارة','بلوتوث سيارة'], categories: ['car_diagnostics'] },
  { keywords: ['غسيل سيارة','تنظيف سيارة'], categories: ['car_wash'] },
  { keywords: ['لوحات','إعلان','يافطة','لافتة','بنر'], categories: ['signs'] },
  { keywords: ['موقع إلكتروني','تطبيق','برمجة','برنامج'], categories: ['software_dev'] },
  { keywords: ['سوشيال ميديا','صفحات','إدارة صفحة','تصميم منشورات'], categories: ['social_media_mgmt'] },
  { keywords: ['ماكينة قهوة','قهوة','اسبريسو'], categories: ['coffee_machine'] },
  { keywords: ['معدات مطعم','مطعم','مطبخ تجاري'], categories: ['restaurant_equipment','restaurant_staff'] },
  { keywords: ['معدات ثقيلة','حفار','جرافة','رافعة'], categories: ['heavy_equipment'] },
  { keywords: ['كسارة','مواد بناء','رمل','حصى'], categories: ['crusher_materials'] },
  { keywords: ['مساحة','تقسيم أرض','مسح أرض'], categories: ['surveying'] },
  { keywords: ['ونش','سحب سيارة','رفع سيارة'], categories: ['towing'] },
  { keywords: ['pos','نقطة بيع','كاشير'], categories: ['pos_systems'] },
  { keywords: ['بوابة','دخول ذكي','بصمة','access control'], categories: ['access_control'] },
];

const SUPPLIER_KEYWORDS = ['مستلزمات','قطع غيار','مواد بناء','توريد','جملة','بضاعة','قطع','حديد','رخام','أسمنت','بيع بالجملة','مورد','مواد','كميات كبيرة','بلاط بالجملة','أثاث بالجملة'];
const COMPANY_KEYWORDS  = ['شركة','مؤسسة','صيانة دورية','مجمع','مبنى كبير','برج','فندق','مستشفى','مجمع سكني','مول'];

function smartAnalyze(description: string): { categories: string[]; entityType: string; ambiguous: boolean } {
  const lower = description.toLowerCase().trim();
  const matchedCategories = new Set<string>();

  for (const { keywords, categories } of SMART_KEYWORD_MAP) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        categories.forEach(c => matchedCategories.add(c));
        break;
      }
    }
  }

  const isSupplier = SUPPLIER_KEYWORDS.some(kw => lower.includes(kw));
  const isCompany  = COMPANY_KEYWORDS.some(kw => lower.includes(kw));

  let entityType = 'technician';
  if (isSupplier) entityType = 'supplier';
  else if (isCompany) entityType = 'company';

  const ambiguous = matchedCategories.size === 0 && !isSupplier && !isCompany;

  return { categories: Array.from(matchedCategories), entityType, ambiguous };
}

// ── Phase 2: AI Tag-aware scoring ────────────────────────────────────────────

// Action-verb prefixes that identify a tag as describing a SERVICE (what the pro DOES)
const SERVICE_TAG_PREFIXES = [
  'تركيب','صيانة','إصلاح','تعبئة','تمديد','تأسيس','نصب','تنفيذ',
  'أعمال','إنشاء','تشغيل','فحص','تغيير','تصليح','طلاء','دهان',
  'تنظيف','مكافحة','نقل','تجهيز','توصيل','تصميم','برمجة','بيع',
  'توريد','إعادة','رفع','حفر','لحام','قص','تلييس','تسوية','عزل',
  'تركيبات','تشطيب','تفصيل','تجليد','تأجير','تحميل',
];

function isServiceTag(tag: string): boolean {
  const t = tag.trim();
  return SERVICE_TAG_PREFIXES.some(p => t.startsWith(p));
}

// Arabic stopwords to remove before matching query tokens against tags
const STOPWORDS = new Set([
  'في','من','على','إلى','عن','هل','أو','لا','ما','هذا','هذه',
  'إن','أن','و','أريد','أحتاج','عندي','عندنا','لدي','بدي','أبغى',
  'محتاج','ابي','ابغى','ودي','عايز','طلب','ممكن','مشكلة','مشكله',
  'يوجد','يوجد','عندي','منزل','بيت','شقة',
]);

/**
 * Split user query into meaningful Arabic tokens (≥2 chars, no stopwords).
 * These tokens are matched against AI tag strings.
 */
function tokenizeQuery(q: string): string[] {
  return q
    .split(/[\s،,\.؟?!،;]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * SERVICE tag score — decreasing points per matched service tag.
 * First match = 10 pts, second = 8, third = 6, then 5, 4, 3 …
 * Hard cap: 50 pts total.
 */
const SERVICE_TAG_WEIGHTS = [10, 8, 6, 5, 4, 3, 3, 2];

function serviceTagScore(tags: string[], tokens: string[]): number {
  if (!tokens.length) return 0;
  let matchCount = 0;
  let total = 0;
  for (const tag of tags) {
    if (!isServiceTag(tag)) continue;
    const tagLower = tag.toLowerCase();
    const hit = tokens.some(tok => tagLower.includes(tok));
    if (hit) {
      total += SERVICE_TAG_WEIGHTS[Math.min(matchCount, SERVICE_TAG_WEIGHTS.length - 1)];
      matchCount++;
      if (total >= 50) break;
    }
  }
  return Math.min(total, 50);
}

/**
 * MARKETING tag bonus — 1 pt per matched marketing tag, max 5.
 * Only helps distinguish profiles that are otherwise similarly scored.
 */
function marketingTagBonus(tags: string[], tokens: string[]): number {
  if (!tokens.length) return 0;
  let bonus = 0;
  for (const tag of tags) {
    if (isServiceTag(tag)) continue;
    const tagLower = tag.toLowerCase();
    if (tokens.some(tok => tagLower.includes(tok))) {
      bonus++;
      if (bonus >= 5) break;
    }
  }
  return bonus;
}

/** Description text match: 5 pts if any query token found in profile description. */
function descriptionScore(descAr: string | null | undefined, descEn: string | null | undefined, tokens: string[]): number {
  if (!tokens.length) return 0;
  const text = ((descAr ?? '') + ' ' + (descEn ?? '')).toLowerCase();
  return tokens.some(tok => tok.length >= 3 && text.includes(tok)) ? 5 : 0;
}

/** Full scoring for a technician row. */
function scoreTech(tech: any, catList: string[], tokens: string[]): number {
  const tags: string[] = Array.isArray(tech.aiTags) ? tech.aiTags : [];
  return (
    (catList.includes(tech.categoryId ?? '') ? 30 : 0) +
    serviceTagScore(tags, tokens) +
    marketingTagBonus(tags, tokens) +
    descriptionScore(tech.descriptionAr, tech.descriptionEn, tokens) +
    ((tech.rating ?? 0) * 4) +
    Math.min(Array.isArray(tech.workImages) ? tech.workImages.length : 0, 5) +
    (tech.isFeatured ? 5 : 0)
  );
}

/** Full scoring for a company row. */
function scoreComp(company: any, catList: string[], tokens: string[]): number {
  const tags: string[] = Array.isArray(company.aiTags) ? company.aiTags : [];
  return (
    (catList.includes(company.specialty ?? '') ? 30 : 0) +
    serviceTagScore(tags, tokens) +
    marketingTagBonus(tags, tokens) +
    descriptionScore(company.description, null, tokens) +
    ((parseFloat(company.rating) || 0) * 4) +
    Math.min(Array.isArray(company.workImages) ? company.workImages.length : 0, 5)
  );
}

/** Full scoring for a supplier row. */
function scoreSupp(supp: any, tokens: string[]): number {
  const tags: string[] = Array.isArray(supp.aiTags) ? supp.aiTags : [];
  return (
    serviceTagScore(tags, tokens) +
    marketingTagBonus(tags, tokens) +
    descriptionScore(supp.description, null, tokens) +
    ((supp.rating ?? 0) * 4)
  );
}

router.post("/smart-search", async (req, res): Promise<void> => {
  const { cityId, description, forceType } = req.body as { cityId?: string; description?: string; forceType?: string };
  if (!description?.trim()) { res.status(400).json({ error: "description required" }); return; }

  const { categories, entityType, ambiguous } = smartAnalyze(description.trim());
  if (ambiguous && !forceType) {
    res.json({ ambiguous: true, technicians: [], companies: [], suppliers: [] });
    return;
  }

  const resolvedType = forceType || entityType;
  const catList = categories.length > 0 ? categories : [];

  // Tokenize user query for AI-tag matching (Phase 2)
  const queryTokens = tokenizeQuery(description.trim());

  try {
    // Resolve city name (companies/suppliers store city as Arabic text)
    let cityNameAr: string | undefined;
    if (cityId) {
      const cityRow = await db.select({ nameAr: citiesTable.nameAr })
        .from(citiesTable).where(eq(citiesTable.id, cityId)).limit(1);
      cityNameAr = cityRow[0]?.nameAr;
    }

    // Always fetch all three types so results are enriched with whatever is relevant.
    // Only when the user explicitly picks a type (forceType) do we restrict.
    const fetchTechs = !forceType || forceType === 'technician' || forceType === 'all';
    const fetchComps = !forceType || forceType === 'company'    || forceType === 'all';
    const fetchSupps = !forceType || forceType === 'supplier'   || forceType === 'all';

    const [techRows, compRows, suppRows] = await Promise.all([
      fetchTechs
        ? db.select({
            tech: techniciansTable,
            cityNameAr: citiesTable.nameAr,
            cityNameEn: citiesTable.nameEn,
            categoryAr: categoriesTable.nameAr,
            categoryEn: categoriesTable.nameEn,
          })
          .from(techniciansTable)
          .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
          .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
          .where(and(
            eq(techniciansTable.isApproved, true),
            eq(techniciansTable.isActive, true),
            cityId ? eq(techniciansTable.cityId, cityId) : undefined,
            catList.length > 0 ? inArray(techniciansTable.categoryId, catList) : undefined,
          ))
          .limit(100)
        : Promise.resolve([]),

      fetchComps
        ? db.select({
            company: companyApplicationsTable,
            categoryAr: categoriesTable.nameAr,
            categoryEn: categoriesTable.nameEn,
          })
          .from(companyApplicationsTable)
          .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
          .where(and(
            eq(companyApplicationsTable.status, 'published'),
            cityNameAr ? ilike(companyApplicationsTable.city, `%${cityNameAr}%`) : undefined,
            catList.length > 0 ? inArray(companyApplicationsTable.specialty, catList) : undefined,
          ))
          .limit(50)
        : Promise.resolve([]),

      fetchSupps
        ? db.select({
            id:              supplierApplicationsTable.id,
            businessName:    supplierApplicationsTable.businessName,
            city:            supplierApplicationsTable.city,
            supplyType:      supplierApplicationsTable.supplyType,
            customSupplyType: supplierApplicationsTable.customSupplyType,
            logo:            supplierApplicationsTable.logo,
            aiTags:          (supplierApplicationsTable as any).aiTags,
            description:     supplierApplicationsTable.description,
            rating:          supplierApplicationsTable.rating,
          })
          .from(supplierApplicationsTable)
          .where(and(
            eq(supplierApplicationsTable.status, 'published'),
            cityNameAr ? ilike(supplierApplicationsTable.city, `%${cityNameAr}%`) : undefined,
          ))
          .limit(50)
        : Promise.resolve([]),
    ]);

    // ── Sort technicians: Phase 2 AI-tag-aware scoring ──────────────────────
    let techPool = techRows as any[];

    // Fallback: if category filter returned < 3, also fetch all technicians in the
    // city (no category restriction) and rank by AI tag score — ensures users
    // always see a useful set of results even in cities with few specialists.
    if (techPool.length < 3 && cityId && catList.length > 0) {
      const fallbackRows = await db.select({
          tech: techniciansTable,
          cityNameAr: citiesTable.nameAr,
          cityNameEn: citiesTable.nameEn,
          categoryAr: categoriesTable.nameAr,
          categoryEn: categoriesTable.nameEn,
        })
        .from(techniciansTable)
        .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
        .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
        .where(and(
          eq(techniciansTable.isApproved, true),
          eq(techniciansTable.isActive, true),
          eq(techniciansTable.cityId, cityId),
        ))
        .limit(100);

      // Merge: deduplicate by id, and only add fallback technicians that have
      // actual tag/description relevance (not just a high rating).
      const existingIds = new Set(techPool.map((r: any) => r.tech.id));
      for (const row of fallbackRows) {
        const t = (row as any).tech;
        if (existingIds.has(t.id)) continue;
        const tags: string[] = Array.isArray(t.aiTags) ? t.aiTags : [];
        const relevance =
          (catList.includes(t.categoryId ?? '') ? 30 : 0) +
          serviceTagScore(tags, queryTokens) +
          descriptionScore(t.descriptionAr, t.descriptionEn, queryTokens);
        if (relevance > 0) techPool.push(row);
      }
    }

    const sortedTechs = techPool
      .map(r => {
        const tech = r.tech;
        const tags: string[] = Array.isArray(tech.aiTags) ? tech.aiTags : [];
        const catMatch  = catList.includes(tech.categoryId ?? '');
        const svcScore  = serviceTagScore(tags, queryTokens);
        const mktScore  = marketingTagBonus(tags, queryTokens);
        const descMatch = descriptionScore(tech.descriptionAr, tech.descriptionEn, queryTokens) > 0;

        // matchLevel: 'exact' = category or service-tag hit; 'related' = only marketing/desc
        const matchLevel: 'exact' | 'related' = (catMatch || svcScore > 0) ? 'exact' : 'related';

        // matchReason: pick the most descriptive reason
        let matchReason = '';
        if (catMatch) matchReason = r.categoryAr ?? '';
        else if (svcScore > 0) {
          const hit = tags.find(t => {
            if (!isServiceTag(t)) return false;
            return queryTokens.some(tok => t.toLowerCase().includes(tok));
          });
          matchReason = hit ?? '';
        } else if (mktScore > 0) {
          const hit = tags.find(t => queryTokens.some(tok => t.toLowerCase().includes(tok)));
          matchReason = hit ?? '';
        } else if (descMatch) matchReason = 'وصف ذو صلة';

        return {
          ...r,
          _score: scoreTech(tech, catList, queryTokens),
          matchLevel,
          matchReason,
        };
      })
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 12)
      .map(r => ({
        id:           r.tech.id,
        nameAr:       r.tech.nameAr,
        nameEn:       r.tech.nameEn,
        profilePhoto: r.tech.profilePhoto,
        rating:       r.tech.rating ?? 0,
        categoryAr:   r.categoryAr ?? '',
        categoryEn:   r.categoryEn ?? '',
        cityNameAr:   r.cityNameAr ?? '',
        cityNameEn:   r.cityNameEn ?? '',
        matchLevel:   r.matchLevel,
        matchReason:  r.matchReason,
      }));

    // ── Sort companies: Phase 2 AI-tag-aware scoring ─────────────────────────
    const sortedComps = (compRows as any[])
      .map(r => ({ ...r, _score: scoreComp(r.company, catList, queryTokens) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4)
      .map(r => ({
        id:          r.company.id,
        companyName: r.company.companyName,
        companyLogo: r.company.companyLogo,
        rating:      parseFloat(r.company.rating) || 0,
        city:        r.company.city,
        categoryAr:  r.categoryAr ?? '',
        categoryEn:  r.categoryEn ?? '',
      }));

    // ── Sort suppliers: Phase 2 AI-tag-aware scoring ─────────────────────────
    const sortedSupps = (suppRows as any[])
      .map(r => ({ ...r, _score: scoreSupp(r, queryTokens) }))
      .filter(r => {
        // Require actual tag/description relevance — rating alone is not enough.
        // Suppliers use product/item tags (not service-verb tags), so also
        // include marketingTagBonus in the relevance check.
        const tags: string[] = Array.isArray(r.aiTags) ? r.aiTags : [];
        return (
          serviceTagScore(tags, queryTokens) +
          marketingTagBonus(tags, queryTokens) +
          descriptionScore(r.description, null, queryTokens)
        ) > 0;
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 4)
      .map(r => ({
        id:              r.id,
        businessName:    r.businessName,
        logo:            r.logo,
        city:            r.city,
        supplyType:      r.supplyType,
        customSupplyType: r.customSupplyType,
      }));

    res.json({
      ambiguous: false,
      entityType: resolvedType,
      technicians: sortedTechs,
      companies:   sortedComps,
      suppliers:   sortedSupps,
    });
  } catch (err) {
    console.error('[smart-search]', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ── Single Technician ─────────────────────────────────────────────────────────
// ── Technician name search ────────────────────────────────────────────────────
router.get("/technicians/search", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (!q) { res.json([]); return; }

  const terms = expandSearchTerms(q);
  const techWhere = terms.flatMap(t => [
    ilike(techniciansTable.nameAr, `%${t}%`),
    ilike(techniciansTable.nameEn, `%${t}%`),
    ilike(techniciansTable.descriptionAr, `%${t}%`),
    ilike(techniciansTable.descriptionEn, `%${t}%`),
    ilike(categoriesTable.nameAr, `%${t}%`),
    ilike(categoriesTable.nameEn, `%${t}%`),
    sql`CAST(${techniciansTable.extraSpecialties} AS text) ILIKE ${'%' + t + '%'}`,
    sql`CAST(${techniciansTable.aiTags} AS text) ILIKE ${'%' + t + '%'}`,
  ]);

  const rows = await db
    .select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
    .where(and(
      eq(techniciansTable.isApproved, true),
      eq(techniciansTable.isActive, true),
      or(...techWhere),
    ))
    .orderBy(desc(techniciansTable.isFeatured), desc(techniciansTable.rating))
    .limit(5);

  const results = rows.map(r => ({
    id: r.tech.id,
    nameAr: r.tech.nameAr,
    nameEn: r.tech.nameEn,
    profilePhoto: r.tech.profilePhoto,
    categoryAr: r.categoryAr ?? '',
    categoryEn: r.categoryEn ?? '',
    categoryIconName: r.categoryIconName ?? '',
    cityNameAr: r.cityNameAr ?? '',
    cityNameEn: r.cityNameEn ?? '',
  }));

  res.json(results);
});

router.get("/technicians/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db
    .select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
    .where(eq(techniciansTable.id, raw));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...row.tech,
    city_name_ar: row.cityNameAr ?? '',
    city_name_en: row.cityNameEn ?? '',
    categoryAr: row.categoryAr ?? '',
    categoryEn: row.categoryEn ?? '',
    categoryIconName: row.categoryIconName ?? '',
  });
});

// ── Create Service Request (lead) ─────────────────────────────────────────────
router.post("/service-requests", async (req, res): Promise<void> => {
  const { ownerId, ownerType, customerName, phone, whatsappPhone, callPhone, cityName, requestType, description, preferredDatetime, photoUrls } = req.body;
  if (!customerName || !ownerId || !ownerType) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const id = crypto.randomBytes(8).toString("hex");
  const [r] = await db.insert(serviceRequestsTable).values({
    id, ownerId, ownerType, customerName,
    phone:             phone || whatsappPhone || null,
    whatsappPhone:     whatsappPhone || null,
    callPhone:         callPhone || null,
    cityName:          cityName || null,
    requestType:       requestType || null,
    description:       description || null,
    preferredDatetime: preferredDatetime || null,
    photoUrls: Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : null,
    status: "new",
  }).returning();
  res.status(201).json(r);
});

// ── Get service requests for logged-in pro ─────────────────────────────────────
router.get("/service-requests/mine", async (req, res): Promise<void> => {
  const { entityType, entityId } = req.query as Record<string, string>;
  if (!entityType || !entityId) { res.status(400).json({ error: "Missing params" }); return; }
  const reqs = await db.select().from(serviceRequestsTable)
    .where(and(eq(serviceRequestsTable.ownerType, entityType), eq(serviceRequestsTable.ownerId, entityId)))
    .orderBy(desc(serviceRequestsTable.createdAt));
  res.json(reqs);
});

// ── Service Requests by IDs (public — user tracks own requests) ───────────────
router.get("/service-requests/by-ids", async (req, res): Promise<void> => {
  const raw = req.query.ids as string;
  if (!raw) { res.json([]); return; }
  const ids = raw.split(",").filter(Boolean);
  if (!ids.length) { res.json([]); return; }
  const reqs = await db.select().from(serviceRequestsTable).where(inArray(serviceRequestsTable.id, ids));
  res.json(reqs);
});

// ── Update own service request status (cancel / complete) ─────────────────────
router.patch("/service-requests/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  if (!['cancelled', 'completed', 'contacted'].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const [r] = await db.update(serviceRequestsTable).set({ status }).where(eq(serviceRequestsTable.id, raw)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

// ── Mark service request as read (pro opens details) ──────────────────────────
router.patch("/service-requests/:id/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const now = new Date();
  const [r] = await db.update(serviceRequestsTable)
    .set({ isRead: true, lastViewedAt: now })
    .where(eq(serviceRequestsTable.id, raw))
    .returning({ id: serviceRequestsTable.id });
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ok: true });
});

// ── Service Lifecycle ──────────────────────────────────────────────────────────

// Pro starts work → sets status to in_progress (no customer link/confirmation needed)
router.patch("/service-requests/:id/start-work", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { ownerName } = req.body;
  const now   = new Date();
  const [r] = await db.update(serviceRequestsTable)
    .set({ status: "in_progress", workStartedAt: now, ownerName: ownerName || null })
    .where(eq(serviceRequestsTable.id, raw))
    .returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

// Public — customer opens confirm link (no auth needed)
router.get("/service-confirm/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  const [r] = await db.select({
    id:            serviceRequestsTable.id,
    ownerName:     serviceRequestsTable.ownerName,
    ownerType:     serviceRequestsTable.ownerType,
    requestType:   serviceRequestsTable.requestType,
    categoryName:  serviceRequestsTable.categoryName,
    cityName:      serviceRequestsTable.cityName,
    status:        serviceRequestsTable.status,
    serviceAmount: serviceRequestsTable.serviceAmount,
    createdAt:     serviceRequestsTable.createdAt,
  }).from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.confirmationToken, token));
  if (!r) { res.status(404).json({ error: "الرابط غير صالح أو منتهي الصلاحية" }); return; }
  res.json({ ...r, token });
});

// Pro completes service (service_amount is required)
router.patch("/service-requests/:id/complete", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { serviceAmount, completionNotes } = req.body;
  if (!serviceAmount) { res.status(400).json({ error: "قيمة الخدمة مطلوبة" }); return; }
  const commission = (parseFloat(String(serviceAmount)) * 0.02).toFixed(2);
  const token = crypto.randomBytes(24).toString("hex");
  const [r] = await db.update(serviceRequestsTable)
    .set({
      status:             "awaiting_customer_confirmation",
      serviceAmount:      String(serviceAmount),
      completionNotes:    completionNotes || null,
      platformCommission: commission,
      confirmationToken:  token,
    })
    .where(eq(serviceRequestsTable.id, raw))
    .returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

// Customer confirms completion, disputes amount, or disputes completion
router.post("/service-confirm/:token/confirm-completed", async (req, res): Promise<void> => {
  const { token } = req.params;
  const { action, rating, comment, disputeAmount, disputeNote } = req.body;
  if (!action) { res.status(400).json({ error: "action required" }); return; }

  // Fetch the request first so we have all fields for auto-deal creation
  const [sr] = await db.select().from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.confirmationToken, token));
  if (!sr) { res.status(404).json({ error: "الرابط غير صالح" }); return; }

  const now = new Date();
  let updateFields: Record<string, unknown> = {};

  if (action === "confirm") {
    updateFields = {
      status:              "completed_confirmed",
      completedConfirmedAt: now,
      customerRating:      rating  ? String(rating)  : null,
      customerComment:     comment ? String(comment) : null,
    };
  } else if (action === "amount_dispute") {
    const note = [disputeAmount ? `القيمة الصحيحة: ${disputeAmount} د.ل` : '', disputeNote || ''].filter(Boolean).join(' — ')
    updateFields = { status: "amount_disputed", customerDisputeNote: note || null };
  } else if (action === "completion_dispute") {
    updateFields = { status: "completion_disputed", customerDisputeNote: disputeNote || null };
  } else {
    res.status(400).json({ error: "Invalid action" }); return;
  }

  await db.update(serviceRequestsTable)
    .set(updateFields)
    .where(eq(serviceRequestsTable.confirmationToken, token));

  // Auto-create a confirmed deal when customer confirms completion
  if (action === "confirm" && sr.ownerId && sr.ownerType) {
    const dealId = crypto.randomBytes(8).toString("hex");
    const serviceDate = now.toISOString().slice(0, 10);
    await db.insert(dealsTable).values({
      id:           dealId,
      proId:        sr.ownerId,
      proType:      sr.ownerType,
      proName:      sr.ownerName || null,
      userPhone:    sr.whatsappPhone || sr.phone || sr.callPhone || "",
      userName:     sr.customerName || null,
      serviceType:  sr.categoryName || sr.requestType || "خدمة",
      serviceValue: sr.serviceAmount ? String(sr.serviceAmount) : null,
      serviceDate,
      description:  sr.completionNotes || sr.description || null,
      proConfirmed: true,
      userConfirmed: true,
      status:       "confirmed",
      proPoints:    "10",
      userPoints:   "5",
      confirmedAt:  now,
      fromOrder:    true,
    }).onConflictDoNothing();
  }

  res.json({ ok: true });
});

// ── DEALS ─────────────────────────────────────────────────────────────────────

// Create a deal (pro initiates)
router.post("/deals", async (req, res): Promise<void> => {
  const { proId, proType, proName, userPhone, userName, serviceType, serviceValue, serviceDate, description } = req.body;
  if (!proId || !proType || !userPhone || !serviceType || !serviceDate) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const id = crypto.randomBytes(8).toString("hex");
  const confirmToken = crypto.randomBytes(16).toString("hex");
  const [deal] = await db.insert(dealsTable).values({
    id, proId, proType, proName: proName || null,
    userPhone, userName: userName || null,
    serviceType, serviceValue: serviceValue ? String(serviceValue) : null,
    serviceDate, description: description || null,
    proConfirmed: true, status: "pending", confirmToken,
  }).returning();
  res.status(201).json(deal);
});

// Get deal by confirm token (for user confirmation page)
router.get("/deals/confirm/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.confirmToken, token));
  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }
  res.json(deal);
});

// User confirms or disputes a deal
router.post("/deals/confirm/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  const { confirmed, userName } = req.body;
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.confirmToken, token));
  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }
  if (deal.userConfirmed !== null) { res.status(409).json({ error: "Already responded" }); return; }

  const status = confirmed ? "confirmed" : "disputed";
  const proPoints = confirmed ? "10" : "0";
  const userPoints = confirmed ? "5" : "0";
  const [updated] = await db.update(dealsTable).set({
    userConfirmed: confirmed,
    userName: userName || deal.userName,
    status,
    proPoints,
    userPoints,
    confirmToken: null,
    confirmedAt: new Date(),
  }).where(eq(dealsTable.id, deal.id)).returning();
  res.json(updated);
});

// Get my deals (pro)
router.get("/deals/mine", async (req, res): Promise<void> => {
  const { proId, proType } = req.query as Record<string, string>;
  if (!proId || !proType) { res.status(400).json({ error: "Missing params" }); return; }
  const deals = await db.select().from(dealsTable)
    .where(and(eq(dealsTable.proId, proId), eq(dealsTable.proType, proType)))
    .orderBy(desc(dealsTable.createdAt));
  res.json(deals);
});

// Delete a deal (manual deals only — auto-generated from orders are protected)
router.delete("/deals/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { proId, proType } = req.query as Record<string, string>;
  if (!proId || !proType) { res.status(400).json({ error: "Missing params" }); return; }
  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, id));
  if (!deal) { res.status(404).json({ error: "Deal not found" }); return; }
  if (deal.proId !== proId || deal.proType !== proType) { res.status(403).json({ error: "Forbidden" }); return; }
  if (deal.fromOrder) { res.status(403).json({ error: "لا يمكن حذف صفقة تم إنشاؤها تلقائياً من طلب مكتمل" }); return; }
  await db.delete(dealsTable).where(eq(dealsTable.id, id));
  res.json({ ok: true });
});

// ── Recently Joined ───────────────────────────────────────────────────────────
router.get("/recently-joined", async (_req, res): Promise<void> => {
  const [techRows, companyRows, supplierRows] = await Promise.all([
    db.select({
      id: techniciansTable.id,
      nameAr: techniciansTable.nameAr,
      nameEn: techniciansTable.nameEn,
      profilePhoto: techniciansTable.profilePhoto,
      cityId: techniciansTable.cityId,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
      createdAt: techniciansTable.createdAt,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true)))
    .orderBy(desc(techniciansTable.createdAt))
    .limit(10),

    db.select({
      id: companyApplicationsTable.id,
      companyName: companyApplicationsTable.companyName,
      companyLogo: companyApplicationsTable.companyLogo,
      city: companyApplicationsTable.city,
      createdAt: companyApplicationsTable.createdAt,
    })
    .from(companyApplicationsTable)
    .where(eq(companyApplicationsTable.status, "published"))
    .orderBy(desc(companyApplicationsTable.createdAt))
    .limit(10),

    db.select({
      id: supplierApplicationsTable.id,
      businessName: supplierApplicationsTable.businessName,
      logo: supplierApplicationsTable.logo,
      city: supplierApplicationsTable.city,
      supplyType: supplierApplicationsTable.supplyType,
      customSupplyType: supplierApplicationsTable.customSupplyType,
      createdAt: supplierApplicationsTable.createdAt,
    })
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.status, "published"))
    .orderBy(desc(supplierApplicationsTable.createdAt))
    .limit(10),
  ]);

  const techs = techRows.map(r => ({
    id: r.id, type: 'technician',
    nameAr: r.nameAr, nameEn: r.nameEn,
    photo: r.profilePhoto,
    cityAr: r.cityNameAr ?? '', cityEn: r.cityNameEn ?? '',
    createdAt: r.createdAt,
  }));
  const companies = companyRows.map(r => ({
    id: r.id, type: 'company',
    nameAr: r.companyName, nameEn: r.companyName,
    photo: r.companyLogo,
    cityAr: r.city ?? '', cityEn: r.city ?? '',
    createdAt: r.createdAt,
  }));
  const suppliers = supplierRows.map(r => ({
    id: r.id, type: 'supplier',
    nameAr: r.businessName, nameEn: r.businessName,
    photo: r.logo,
    cityAr: r.city ?? '', cityEn: r.city ?? '',
    supplyType: r.customSupplyType || r.supplyType || '',
    createdAt: r.createdAt,
  }));

  const all = [...techs, ...companies, ...suppliers]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 12);

  res.json(all);
});

// ── Ads (public, active by placement) ────────────────────────────────────────
router.get("/ads", async (req, res): Promise<void> => {
  const { placement } = req.query as Record<string, string>;
  const today = new Date().toISOString().split("T")[0];

  const ads = await db
    .select()
    .from(adsTable)
    .where(
      and(
        eq(adsTable.isActive, true),
        placement ? eq(adsTable.placement, placement) : undefined,
      )
    )
    .orderBy(adsTable.sortOrder, desc(adsTable.createdAt));

  const filtered = ads.filter(ad => {
    if (ad.endDate && ad.endDate < today) return false;
    if (ad.startDate && ad.startDate > today) return false;
    return true;
  });

  res.json(filtered);
});

// ── Technician Application (submit) ──────────────────────────────────────────
router.post("/technician-applications", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.id || !body.full_name || !body.phone || !body.city) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  let referredByName: string | null = null;
  let referredByType: string | null = null;
  if (body.referred_by) {
    const ref = body.referred_by;
    const { ambassadorsTable } = await import("@workspace/db/schema");
    const [ambRef] = await db.select({ name: ambassadorsTable.name }).from(ambassadorsTable).where(and(eq(ambassadorsTable.code, ref), eq(ambassadorsTable.isActive, true)));
    if (ambRef) { referredByName = ambRef.name; referredByType = "ambassador"; }
    else {
      const [techRef] = await db.select({ fullName: technicianApplicationsTable.fullName })
        .from(technicianApplicationsTable).where(or(eq(technicianApplicationsTable.requestNumber, ref), eq(technicianApplicationsTable.id, ref)));
      if (techRef) { referredByName = techRef.fullName; referredByType = "technician"; }
      else {
        const [compRef] = await db.select({ companyName: companyApplicationsTable.companyName })
          .from(companyApplicationsTable).where(or(eq(companyApplicationsTable.requestNumber, ref), eq(companyApplicationsTable.id, ref)));
        if (compRef) { referredByName = compRef.companyName; referredByType = "company"; }
        else {
          const [supRef] = await db.select({ businessName: supplierApplicationsTable.businessName })
            .from(supplierApplicationsTable).where(or(eq(supplierApplicationsTable.requestNumber, ref), eq(supplierApplicationsTable.id, ref)));
          if (supRef) { referredByName = supRef.businessName; referredByType = "supplier"; }
        }
      }
    }
  }

  const [app] = await db
    .insert(technicianApplicationsTable)
    .values({
      id:             body.id,
      fullName:       body.full_name,
      phone:          body.phone,
      whatsapp:       body.whatsapp || body.phone,
      nationalId:     body.national_id,
      city:           body.city,
      area:           body.area,
      address:        body.address,
      specialty:       body.specialty || body.category,
      extraSpecialties:     body.extra_specialties || [],
      customSpecialty:      body.custom_specialty || null,
      suggestedSpecialties: body.suggested_specialties || [],
      lat: body.lat != null ? parseFloat(body.lat) : null,
      lng: body.lng != null ? parseFloat(body.lng) : null,
      experience:     body.experience,
      type:           body.type,
      description:    body.description,
      certifications: body.certifications,
      priceFrom:      body.price_from,
      priceTo:        body.price_to,
      availableNow:   !!body.available_now,
      workingDays:    body.working_days || [],
      hoursFrom:      body.hours_from,
      hoursTo:        body.hours_to,
      emergency:      !!body.emergency,
      serviceRadius:  body.service_radius,
      email:          body.email || null,
      facebook:       body.facebook,
      instagram:      body.instagram,
      profilePhoto:   body.profile_photo,
      workImages:     body.work_images || [],
      idDocFront:     body.id_doc_front,
      idDocBack:      body.id_doc_back,
      workLicense:    body.work_license,
      referredBy:     body.referred_by || null,
      referredByName: referredByName,
      referredByType: referredByType,
      status:         "pending",
      requestNumber:  "OF-T-" + String(Date.now()).slice(-6),
    })
    .returning();

  res.status(201).json(app);
});

// ── Company Application (submit) ─────────────────────────────────────────────
router.post("/company-applications", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.id || !body.company_name || !body.phone || !body.city) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  let refByName: string | null = null;
  let refByType: string | null = null;
  if (body.referred_by) {
    const ref = body.referred_by;
    const { ambassadorsTable } = await import("@workspace/db/schema");
    const [ambRef] = await db.select({ name: ambassadorsTable.name }).from(ambassadorsTable).where(and(eq(ambassadorsTable.code, ref), eq(ambassadorsTable.isActive, true)));
    if (ambRef) { refByName = ambRef.name; refByType = "ambassador"; }
    else {
      const [techRef] = await db.select({ fullName: technicianApplicationsTable.fullName })
        .from(technicianApplicationsTable).where(or(eq(technicianApplicationsTable.requestNumber, ref), eq(technicianApplicationsTable.id, ref)));
      if (techRef) { refByName = techRef.fullName; refByType = "technician"; }
      else {
        const [compRef] = await db.select({ companyName: companyApplicationsTable.companyName })
          .from(companyApplicationsTable).where(or(eq(companyApplicationsTable.requestNumber, ref), eq(companyApplicationsTable.id, ref)));
        if (compRef) { refByName = compRef.companyName; refByType = "company"; }
        else {
          const [supRef] = await db.select({ businessName: supplierApplicationsTable.businessName })
            .from(supplierApplicationsTable).where(or(eq(supplierApplicationsTable.requestNumber, ref), eq(supplierApplicationsTable.id, ref)));
          if (supRef) { refByName = supRef.businessName; refByType = "supplier"; }
        }
      }
    }
  }

  const [app] = await db
    .insert(companyApplicationsTable)
    .values({
      id:             body.id,
      companyName:    body.company_name,
      contactName:    body.contact_name,
      phone:          body.phone,
      whatsapp:       body.whatsapp || body.phone,
      commercialReg:  body.commercial_reg,
      city:           body.city,
      area:           body.area,
      address:        body.address,
      specialty:        body.specialty || 'more_services',
      extraSpecialties:     body.extra_specialties || [],
      customSpecialty:      body.custom_specialty || null,
      suggestedSpecialties: body.suggested_specialties || [],
      lat: body.lat != null ? parseFloat(body.lat) : null,
      lng: body.lng != null ? parseFloat(body.lng) : null,
      yearsActive:     body.years_active,
      description:    body.description,
      certifications: body.certifications,
      priceFrom:      body.price_from,
      priceTo:        body.price_to,
      availableNow:   !!body.available_now,
      workingDays:    body.working_days || [],
      hoursFrom:      body.hours_from,
      hoursTo:        body.hours_to,
      emergency:      !!body.emergency,
      serviceRadius:  body.service_radius,
      email:          body.email || null,
      facebook:       body.facebook,
      instagram:      body.instagram,
      companyLogo:    body.company_logo,
      workImages:     body.work_images || [],
      commercialDoc:  body.commercial_doc,
      workLicense:    body.work_license,
      referredBy:     body.referred_by || null,
      referredByName: refByName,
      referredByType: refByType,
      status:         "pending",
      requestNumber:  "OF-C-" + String(Date.now()).slice(-6),
    })
    .returning();

  res.status(201).json(app);
});

// ── Application Status (public tracking) ─────────────────────────────────────
router.get("/status/:requestNumber", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.requestNumber) ? req.params.requestNumber[0] : req.params.requestNumber;
  // Normalise: uppercase + replace digit-zero with letter-O so "0F-T-123" == "OF-T-123"
  // Only fix a leading "0" typed instead of the letter "O" (e.g. "0F-T-123" → "OF-T-123")
  // Do NOT replace all zeros — numeric parts of the request number contain real zeros
  const reqNum = raw.toUpperCase().replace(/^0F-/, 'OF-');

  const [techApp] = await db
    .select({
      id: technicianApplicationsTable.id,
      status: technicianApplicationsTable.status,
      fullName: technicianApplicationsTable.fullName,
      createdAt: technicianApplicationsTable.createdAt,
      requestNumber: technicianApplicationsTable.requestNumber,
      specialty: technicianApplicationsTable.specialty,
      customSpecialty: technicianApplicationsTable.customSpecialty,
      city: technicianApplicationsTable.city,
      rejectionReason: technicianApplicationsTable.rejectionReason,
    })
    .from(technicianApplicationsTable)
    .where(eq(technicianApplicationsTable.requestNumber, reqNum));

  if (techApp) {
    const [cityRow] = await db
      .select({ nameAr: citiesTable.nameAr, nameEn: citiesTable.nameEn })
      .from(citiesTable)
      .where(eq(citiesTable.id, techApp.city));
    const [techRecord] = await db
      .select({ id: techniciansTable.id })
      .from(techniciansTable)
      .where(eq(techniciansTable.applicationId, techApp.id));
    res.json({ type: "technician", ...techApp, cityName: cityRow?.nameAr || null, technicianId: techRecord?.id || null });
    return;
  }

  const [compApp] = await db
    .select({
      id: companyApplicationsTable.id,
      status: companyApplicationsTable.status,
      companyName: companyApplicationsTable.companyName,
      createdAt: companyApplicationsTable.createdAt,
      requestNumber: companyApplicationsTable.requestNumber,
      specialty: companyApplicationsTable.specialty,
      customSpecialty: companyApplicationsTable.customSpecialty,
      city: companyApplicationsTable.city,
      rejectionReason: companyApplicationsTable.rejectionReason,
    })
    .from(companyApplicationsTable)
    .where(eq(companyApplicationsTable.requestNumber, reqNum));

  if (compApp) {
    const [cityRow] = await db
      .select({ nameAr: citiesTable.nameAr, nameEn: citiesTable.nameEn })
      .from(citiesTable)
      .where(eq(citiesTable.id, compApp.city));
    res.json({ type: "company", fullName: compApp.companyName, ...compApp, cityName: cityRow?.nameAr || null });
    return;
  }

  const [supApp] = await db
    .select({
      id: supplierApplicationsTable.id,
      status: supplierApplicationsTable.status,
      businessName: supplierApplicationsTable.businessName,
      createdAt: supplierApplicationsTable.createdAt,
      requestNumber: supplierApplicationsTable.requestNumber,
      supplyType: supplierApplicationsTable.supplyType,
      customSupplyType: supplierApplicationsTable.customSupplyType,
      city: supplierApplicationsTable.city,
      rejectionReason: supplierApplicationsTable.rejectionReason,
    })
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.requestNumber, reqNum));

  if (supApp) {
    res.json({ type: "supplier", fullName: supApp.businessName, ...supApp });
    return;
  }

  res.status(404).json({ error: "Request not found" });
});

// ── Status by phone ───────────────────────────────────────────────────────────
router.get("/status-by-phone/:phone", async (req, res): Promise<void> => {
  const phone = (req.params.phone as string).replace(/\D/g, '');
  if (!phone || phone.length < 7) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const techApps = await db
    .select({
      id: technicianApplicationsTable.id,
      status: technicianApplicationsTable.status,
      fullName: technicianApplicationsTable.fullName,
      createdAt: technicianApplicationsTable.createdAt,
      requestNumber: technicianApplicationsTable.requestNumber,
    })
    .from(technicianApplicationsTable)
    .where(ilike(technicianApplicationsTable.phone, `%${phone.slice(-9)}%`))
    .orderBy(desc(technicianApplicationsTable.createdAt));

  const compApps = await db
    .select({
      id: companyApplicationsTable.id,
      status: companyApplicationsTable.status,
      companyName: companyApplicationsTable.companyName,
      createdAt: companyApplicationsTable.createdAt,
      requestNumber: companyApplicationsTable.requestNumber,
    })
    .from(companyApplicationsTable)
    .where(ilike(companyApplicationsTable.phone, `%${phone.slice(-9)}%`))
    .orderBy(desc(companyApplicationsTable.createdAt));

  const techAppIds = techApps.map(r => r.id);
  const techRecords = techAppIds.length > 0
    ? await db.select({ id: techniciansTable.id, applicationId: techniciansTable.applicationId })
        .from(techniciansTable)
        .where(inArray(techniciansTable.applicationId, techAppIds))
    : [];
  const techIdMap = Object.fromEntries(techRecords.map(t => [t.applicationId, t.id]));

  const supApps = await db
    .select({
      id: supplierApplicationsTable.id,
      status: supplierApplicationsTable.status,
      businessName: supplierApplicationsTable.businessName,
      createdAt: supplierApplicationsTable.createdAt,
      requestNumber: supplierApplicationsTable.requestNumber,
    })
    .from(supplierApplicationsTable)
    .where(ilike(supplierApplicationsTable.phone, `%${phone.slice(-9)}%`))
    .orderBy(desc(supplierApplicationsTable.createdAt));

  const results = [
    ...techApps.map(r => ({ type: "technician", fullName: r.fullName,       ...r, technicianId: techIdMap[r.id] || null })),
    ...compApps.map(r => ({ type: "company",    fullName: r.companyName,     ...r })),
    ...supApps.map(r  => ({ type: "supplier",   fullName: r.businessName,    ...r })),
  ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

  if (results.length === 0) {
    res.status(404).json({ error: "No applications found for this phone number" });
    return;
  }

  res.json(results);
});

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get("/technicians/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.technicianId, id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(30);
  res.json(reviews);
});

router.post("/technicians/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { reviewer_name, rating, comment } = req.body;

  if (!reviewer_name?.trim() || !rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ error: "reviewer_name and rating (1-5) are required" });
    return;
  }

  const reviewId = "rev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const [review] = await db.insert(reviewsTable).values({
    id:           reviewId,
    technicianId: id,
    reviewerName: reviewer_name.trim(),
    rating:       Number(rating),
    comment:      comment?.trim() || null,
  }).returning();

  const allRatings = await db
    .select({ rating: reviewsTable.rating })
    .from(reviewsTable)
    .where(eq(reviewsTable.technicianId, id));
  const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
  await db.update(techniciansTable).set({
    rating:       Math.round(avg * 10) / 10,
    reviewsCount: allRatings.length,
  }).where(eq(techniciansTable.id, id));

  res.status(201).json(review);
});

// ── Company Reviews ────────────────────────────────────────────────────────────
router.get("/companies/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.companyId, id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(30);
  res.json(reviews);
});

router.post("/companies/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { reviewer_name, rating, comment } = req.body;

  if (!reviewer_name?.trim() || !rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ error: "reviewer_name and rating (1-5) are required" });
    return;
  }

  const reviewId = "crev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const [review] = await db.insert(reviewsTable).values({
    id:           reviewId,
    companyId:    id,
    reviewerName: reviewer_name.trim(),
    rating:       Number(rating),
    comment:      comment?.trim() || null,
  }).returning();

  const allRatings = await db
    .select({ rating: reviewsTable.rating })
    .from(reviewsTable)
    .where(eq(reviewsTable.companyId, id));
  const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
  await db.update(companyApplicationsTable).set({
    rating:       String(Math.round(avg * 10) / 10),
    reviewsCount: allRatings.length,
  }).where(eq(companyApplicationsTable.id, id));

  res.status(201).json(review);
});

// ── Supplier Reviews ──────────────────────────────────────────────────────────
router.get("/suppliers/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.supplierId, id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(30);
  res.json(reviews);
});

router.post("/suppliers/:id/reviews", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { reviewer_name, rating, comment } = req.body;

  if (!reviewer_name?.trim() || !rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ error: "reviewer_name and rating (1-5) are required" });
    return;
  }

  const reviewId = "srev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const [review] = await db.insert(reviewsTable).values({
    id:           reviewId,
    supplierId:   id,
    reviewerName: reviewer_name.trim(),
    rating:       Number(rating),
    comment:      comment?.trim() || null,
  }).returning();

  const allRatings = await db
    .select({ rating: reviewsTable.rating })
    .from(reviewsTable)
    .where(eq(reviewsTable.supplierId, id));
  const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
  await db.update(supplierApplicationsTable).set({
    rating:       Math.round(avg * 10) / 10,
    reviewsCount: allRatings.length,
  }).where(eq(supplierApplicationsTable.id, id));

  res.status(201).json(review);
});

// ── Ad Request (submit) ───────────────────────────────────────────────────────
router.post("/ad-requests", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.id || !body.company_name || !body.phone) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [req_] = await db
    .insert(adRequestsTable)
    .values({
      id:                  body.id,
      companyName:         body.company_name,
      contactName:         body.contact_name,
      phone:               body.phone,
      whatsapp:            body.whatsapp,
      city:                body.city || null,
      businessType:        body.business_type || null,
      adTitle:             body.ad_title || null,
      adDescription:       body.ad_description || null,
      requestedPlacement:  body.requested_placement || null,
      websiteOrSocialLink: body.website_or_social_link || null,
      notes:               body.notes || null,
      imagePreview:        body.image_preview || body.imagePreview || null,
      status:              "pending",
    })
    .returning();

  res.status(201).json(req_);
});

// ── Referral Stats ────────────────────────────────────────────────────────────
router.get("/referral-stats/:referrerId", async (req, res): Promise<void> => {
  const referrerId = Array.isArray(req.params.referrerId) ? req.params.referrerId[0] : req.params.referrerId;

  const [techStats] = await db.select({
    registered: sql<number>`count(*)::int`,
    accepted:   sql<number>`(count(*) filter (where ${technicianApplicationsTable.status} in ('approved', 'published')))::int`,
  }).from(technicianApplicationsTable).where(eq(technicianApplicationsTable.referredBy, referrerId));

  const [compStats] = await db.select({
    registered: sql<number>`count(*)::int`,
    accepted:   sql<number>`(count(*) filter (where ${companyApplicationsTable.status} in ('approved', 'published')))::int`,
  }).from(companyApplicationsTable).where(eq(companyApplicationsTable.referredBy, referrerId));

  res.json({
    registered: (techStats?.registered ?? 0) + (compStats?.registered ?? 0),
    accepted:   (techStats?.accepted   ?? 0) + (compStats?.accepted   ?? 0),
  });
});

// ── Update / Report (Public POST) ─────────────────────────────────────────────
router.post("/update-reports", async (req, res): Promise<void> => {
  const {
    entity_type, entity_id, entity_name, city,
    requester_name, requester_phone, request_type, notes, photos,
    profile_photo, work_photos,
  } = req.body;

  if (!entity_type || !entity_id || !request_type) {
    res.status(400).json({ error: "entity_type, entity_id, request_type are required" });
    return;
  }

  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(updateReportsTable).values({
    id,
    entityType:     entity_type,
    entityId:       String(entity_id),
    entityName:     entity_name || "",
    city:           city || "",
    requesterName:  requester_name || null,
    requesterPhone: requester_phone || null,
    requestType:    request_type,
    notes:          notes || null,
    photos:         Array.isArray(photos) ? photos : [],
    profilePhoto:   profile_photo || null,
    workPhotos:     Array.isArray(work_photos) ? work_photos : [],
    status:         "new",
  });

  res.status(201).json({ ok: true, id });
});

// ── Pro Account Login ─────────────────────────────────────────────────────────
router.post("/pro/login", async (req, res): Promise<void> => {
  const { whatsapp, password } = req.body;
  if (!whatsapp || !password) { res.status(400).json({ error: "whatsapp and password required" }); return; }
  // Normalise to the 9-digit local form (no leading 0, no country code)
  let digits = whatsapp.replace(/[\s\-\(\)\+]/g, "");
  if (digits.startsWith("00218")) digits = digits.slice(5);
  else if (digits.startsWith("218"))  digits = digits.slice(3);
  if (digits.startsWith("0"))         digits = digits.slice(1);
  // Try all common stored formats: 09XXXXXXXX, 9XXXXXXXX, +2189XXXXXXXX, 2189XXXXXXXX
  const candidates = [`0${digits}`, digits, `+218${digits}`, `218${digits}`];
  const [cred] = await db.select().from(proCredentialsTable).where(inArray(proCredentialsTable.whatsapp, candidates));
  if (!cred) { res.status(401).json({ error: "Invalid credentials" }); return; }
  // If passwordPlain is non-empty the user has not yet created their own PIN
  if (cred.passwordPlain && cred.passwordPlain.length > 0) {
    res.status(403).json({ error: "PIN_NOT_SET" }); return;
  }
  const hash = crypto.createHash("sha256").update(String(password)).digest("hex");
  if (hash !== cred.passwordHash) { res.status(401).json({ error: "Invalid credentials" }); return; }
  res.json({ entityType: cred.entityType, entityId: cred.entityId, displayName: cred.displayName });
});

// ── Pro: Get own profile (no status restriction) ─────────────────────────────
router.get("/pro/me", async (req, res): Promise<void> => {
  const { entityType, entityId } = req.query as { entityType?: string; entityId?: string };
  if (!entityType || !entityId) { res.status(400).json({ error: "entityType and entityId required" }); return; }
  let profile: Record<string, unknown> | null = null;
  if (entityType === 'technician') {
    const [row] = await db.select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    }).from(techniciansTable)
      .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
      .leftJoin(categoriesTable, eq(techniciansTable.categoryId, categoriesTable.id))
      .where(or(eq(techniciansTable.id, entityId), eq(techniciansTable.applicationId, entityId)))
      .limit(1);
    if (row) profile = { ...row.tech, cityNameAr: row.cityNameAr, cityNameEn: row.cityNameEn, categoryAr: row.categoryAr, categoryEn: row.categoryEn, categoryIconName: row.categoryIconName };
  } else if (entityType === 'company') {
    const [row] = await db.select({
      company: companyApplicationsTable,
      categoryAr: categoriesTable.nameAr,
      categoryEn: categoriesTable.nameEn,
      categoryIconName: categoriesTable.iconName,
    }).from(companyApplicationsTable)
      .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
      .where(eq(companyApplicationsTable.id, entityId));
    if (row) profile = { ...row.company, categoryAr: row.categoryAr, categoryEn: row.categoryEn, categoryIconName: row.categoryIconName };
  } else if (entityType === 'supplier') {
    const [row] = await db.select().from(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, entityId));
    if (row) profile = row as Record<string, unknown>;
  } else {
    res.status(400).json({ error: "Invalid entityType" }); return;
  }
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json(profile);
});

// ── Pro: Change password ──────────────────────────────────────────────────────
router.post("/pro/change-password", async (req, res): Promise<void> => {
  const { entityType, entityId, currentPassword, newPassword } = req.body;
  if (!entityType || !entityId || !currentPassword || !newPassword) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  if (String(newPassword).length < 4) { res.status(400).json({ error: "كلمة المرور قصيرة جداً" }); return; }
  const [cred] = await db.select().from(proCredentialsTable)
    .where(and(eq(proCredentialsTable.entityType, entityType as any), eq(proCredentialsTable.entityId, entityId)));
  if (!cred) { res.status(404).json({ error: "Account not found" }); return; }
  const currentHash = crypto.createHash("sha256").update(String(currentPassword)).digest("hex");
  if (currentHash !== cred.passwordHash) { res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" }); return; }
  const newHash = crypto.createHash("sha256").update(String(newPassword)).digest("hex");
  await db.update(proCredentialsTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(proCredentialsTable.id, cred.id));
  res.json({ success: true });
});

// ── Pro: Submit profile update request ───────────────────────────────────────
router.post("/pro/request-update", async (req, res): Promise<void> => {
  const { entityType, entityId, changes } = req.body;
  if (!entityType || !entityId || !changes || typeof changes !== "object") {
    res.status(400).json({ error: "entityType, entityId, and changes are required" }); return;
  }
  const validTypes = ["technician", "company", "supplier"];
  if (!validTypes.includes(entityType)) { res.status(400).json({ error: "Invalid entityType" }); return; }

  // Cancel any existing pending request
  await db.update(profileUpdateRequestsTable)
    .set({ status: "cancelled" })
    .where(and(
      eq(profileUpdateRequestsTable.entityType, entityType),
      eq(profileUpdateRequestsTable.entityId, entityId),
      eq(profileUpdateRequestsTable.status, "pending"),
    ));

  const id = `pur_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await db.insert(profileUpdateRequestsTable).values({
    id, entityType, entityId: String(entityId), changes, status: "pending",
  });
  res.status(201).json({ ok: true, id });
});

// ── Pro: Get pending request ──────────────────────────────────────────────────
router.get("/pro/pending-request", async (req, res): Promise<void> => {
  const { entityType, entityId } = req.query as { entityType?: string; entityId?: string };
  if (!entityType || !entityId) { res.status(400).json({ error: "entityType and entityId required" }); return; }
  const [row] = await db.select().from(profileUpdateRequestsTable)
    .where(and(
      eq(profileUpdateRequestsTable.entityType, entityType),
      eq(profileUpdateRequestsTable.entityId, entityId),
    ))
    .orderBy(desc(profileUpdateRequestsTable.createdAt))
    .limit(1);
  res.json(row || null);
});

// ── Phone standardization helper ─────────────────────────────────────────────
function libyanPhone(input: string | null | undefined): string | null {
  if (!input) return null
  let n = String(input).replace(/[\s\-\(\)\.]/g, '')
  if (n.startsWith('+218')) n = n.slice(4)
  else if (n.startsWith('00218')) n = n.slice(5)
  else if (n.startsWith('218') && n.length === 12) n = n.slice(3)
  else if (n.startsWith('0')) n = n.slice(1)
  if (!/^\d{9}$/.test(n)) return null
  return '+218' + n
}

// ── Pro: Direct profile update (text fields only, no approval needed) ─────────
router.patch("/pro/profile", async (req, res): Promise<void> => {
  const { entityType, entityId, fields } = req.body
  if (!entityType || !entityId || !fields || typeof fields !== 'object') {
    res.status(400).json({ error: "entityType, entityId, fields required" }); return
  }
  const validTypes = ["technician", "company", "supplier"]
  if (!validTypes.includes(entityType)) { res.status(400).json({ error: "Invalid entityType" }); return }

  const f = { ...fields }

  // Standardize phone numbers
  if (f.phone !== undefined && f.phone !== '') {
    const std = libyanPhone(f.phone)
    if (!std) { res.status(400).json({ error: "رقم الهاتف غير صحيح. أدخل 9 أرقام فقط بدون صفر في البداية (مثال: 921101010)" }); return }
    f.phone = std
  }
  if (f.whatsapp !== undefined && f.whatsapp !== '') {
    const std = libyanPhone(f.whatsapp)
    if (!std) { res.status(400).json({ error: "رقم الواتساب غير صحيح. أدخل 9 أرقام فقط بدون صفر في البداية (مثال: 921101010)" }); return }
    f.whatsapp = std
  }

  if (entityType === 'technician') {
    const ALLOWED = ['nameAr', 'phone', 'whatsapp', 'cityId', 'descriptionAr', 'extraSpecialties']
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED) { if (f[key] !== undefined) updates[key] = f[key] }
    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "لا توجد حقول للتحديث" }); return }
    await db.update(techniciansTable).set(updates as any)
      .where(or(eq(techniciansTable.id, entityId), eq(techniciansTable.applicationId, entityId)))

  } else if (entityType === 'company') {
    const ALLOWED = ['contactName', 'companyName', 'phone', 'whatsapp', 'city', 'description', 'extraSpecialties']
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED) { if (f[key] !== undefined) updates[key] = f[key] }
    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "لا توجد حقول للتحديث" }); return }
    await db.update(companyApplicationsTable).set(updates as any).where(eq(companyApplicationsTable.id, entityId))

  } else if (entityType === 'supplier') {
    const ALLOWED = ['contactName', 'businessName', 'phone', 'whatsapp', 'city', 'description']
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED) { if (f[key] !== undefined) updates[key] = f[key] }
    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "لا توجد حقول للتحديث" }); return }
    await db.update(supplierApplicationsTable).set(updates as any).where(eq(supplierApplicationsTable.id, entityId))
  }

  res.json({ ok: true })
})

// ── Submit Referral (public) ─────────────────────────────────────────────────
router.post("/referrals", async (req, res): Promise<void> => {
  const { type, name, phone, specialty, city, notes } = req.body;
  const validTypes = ["technician", "company", "supplier"];
  if (!type || !validTypes.includes(type)) { res.status(400).json({ error: "invalid type" }); return; }
  if (!name || !name.trim()) { res.status(400).json({ error: "name required" }); return; }
  if (!phone || !phone.trim()) { res.status(400).json({ error: "phone required" }); return; }
  const [row] = await db.insert(referralsTable).values({
    type, name: name.trim(), phone: phone.trim(),
    specialty: specialty?.trim() || null,
    city: city?.trim() || null,
    notes: notes?.trim() || null,
  }).returning();
  res.json(row);
});

// ── Pro: Activate / Reset PIN ─────────────────────────────────────────────────
router.post("/pro/activate", async (req, res): Promise<void> => {
  const { whatsapp, pin } = req.body;
  if (!whatsapp || !pin) { res.status(400).json({ error: "whatsapp and pin required" }); return; }
  const pinStr = String(pin);
  if (!/^\d{4}$/.test(pinStr)) { res.status(400).json({ error: "PIN يجب أن يكون 4 أرقام فقط" }); return; }

  let digits = String(whatsapp).replace(/[\s\-\(\)\+]/g, "");
  if (digits.startsWith("00218")) digits = digits.slice(5);
  else if (digits.startsWith("218")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  const candidates = [`0${digits}`, digits, `+218${digits}`, `218${digits}`];

  const [cred] = await db.select().from(proCredentialsTable).where(inArray(proCredentialsTable.whatsapp, candidates));

  if (!cred) {
    const [tech] = await db.select({ id: techniciansTable.id }).from(techniciansTable)
      .where(inArray(techniciansTable.whatsapp, candidates)).limit(1);
    if (!tech) {
      const [company] = await db.select({ id: companyApplicationsTable.id }).from(companyApplicationsTable)
        .where(inArray(companyApplicationsTable.whatsapp, candidates)).limit(1);
      if (!company) {
        const [supplier] = await db.select({ id: supplierApplicationsTable.id }).from(supplierApplicationsTable)
          .where(inArray(supplierApplicationsTable.whatsapp, candidates)).limit(1);
        if (!supplier) {
          res.status(404).json({ error: "هذا الرقم غير مسجل في منصة اطلب فني" }); return;
        }
      }
    }
    res.status(404).json({ error: "لم يتم تفعيل حسابك بعد، تواصل مع الإدارة" }); return;
  }

  const pinHash = crypto.createHash("sha256").update(pinStr).digest("hex");
  await db.update(proCredentialsTable)
    .set({ passwordHash: pinHash, passwordPlain: "", updatedAt: new Date() })
    .where(eq(proCredentialsTable.id, cred.id));

  res.json({ success: true, entityType: cred.entityType, entityId: cred.entityId, displayName: cred.displayName });
});

// ══════════════════════════════════════════════════════════════════════════
// General Requests & Offers (طلبات عامة وعروض) — additive marketplace flow
// ══════════════════════════════════════════════════════════════════════════

function normalizeWa(whatsapp: string) {
  let digits = String(whatsapp || "").replace(/[\s\-\(\)\+]/g, "");
  if (digits.startsWith("00218")) digits = digits.slice(5);
  else if (digits.startsWith("218")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}
function waCandidates(whatsapp: string) {
  const digits = normalizeWa(whatsapp);
  return [`0${digits}`, digits, `+218${digits}`, `218${digits}`];
}
// ── Customer-account auth middleware ───────────────────────────────────────────
function requireCustomerAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const accountId = verifyCustomerToken(token);
  if (!accountId) { res.status(401).json({ error: "يجب تسجيل الدخول" }); return; }
  (req as any).customerAccountId = accountId;
  next();
}

// ── Customer account: register ─────────────────────────────────────────────────
router.post("/customer-accounts/register", async (req, res): Promise<void> => {
  const { name, whatsapp, username, pin } = req.body;
  if (!name?.trim() || !whatsapp?.trim() || !username?.trim() || !pin) {
    res.status(400).json({ error: "جميع الحقول مطلوبة" }); return;
  }
  if (!/^\d{6}$/.test(String(pin))) { res.status(400).json({ error: "الرمز السري يجب أن يكون 6 أرقام" }); return; }
  const cleanUsername = String(username).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
    res.status(400).json({ error: "اسم المستخدم يجب أن يكون بين 3 و20 حرف/رقم إنجليزي (a-z, 0-9, _)" });
    return;
  }
  if (normalizeWa(whatsapp).length !== 9) {
    res.status(400).json({ error: "رقم الواتساب غير مكتمل، يجب أن يتكون من 9 أرقام بعد 218+" });
    return;
  }

  const waList = waCandidates(whatsapp);
  const [existingWa] = await db.select().from(customerAccountsTable).where(inArray(customerAccountsTable.whatsapp, waList));
  if (existingWa) { res.status(409).json({ error: "رقم الواتساب مسجل بحساب بالفعل، سجل الدخول بدلاً من ذلك" }); return; }
  const [existingUser] = await db.select().from(customerAccountsTable).where(eq(customerAccountsTable.username, cleanUsername));
  if (existingUser) { res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل، اختر اسماً آخر" }); return; }

  const id = crypto.randomBytes(8).toString("hex");
  const [acc] = await db.insert(customerAccountsTable).values({
    id,
    name: String(name).trim(),
    whatsapp: String(whatsapp).trim(),
    username: cleanUsername,
    pinHash: hashPin(String(pin)),
  }).returning();

  const token = signCustomerToken(acc.id);
  res.status(201).json({ token, id: acc.id, name: acc.name, username: acc.username });
});

// ── Customer account: login ────────────────────────────────────────────────────
router.post("/customer-accounts/login", async (req, res): Promise<void> => {
  const { username, pin } = req.body;
  if (!username?.trim() || !pin) { res.status(400).json({ error: "اسم المستخدم والرمز السري مطلوبان" }); return; }
  const cleanUsername = String(username).trim().toLowerCase();
  const [acc] = await db.select().from(customerAccountsTable).where(eq(customerAccountsTable.username, cleanUsername));
  if (!acc || !verifyPin(String(pin), acc.pinHash)) {
    res.status(401).json({ error: "اسم المستخدم أو الرمز السري غير صحيح" });
    return;
  }
  const token = signCustomerToken(acc.id);
  res.json({ token, id: acc.id, name: acc.name, username: acc.username });
});

// ── Customer account: current session info ─────────────────────────────────────
router.get("/customer-accounts/me", requireCustomerAuth, async (req: any, res): Promise<void> => {
  const [acc] = await db.select({
    id: customerAccountsTable.id, name: customerAccountsTable.name,
    username: customerAccountsTable.username, whatsapp: customerAccountsTable.whatsapp,
  }).from(customerAccountsTable).where(eq(customerAccountsTable.id, req.customerAccountId));
  if (!acc) { res.status(404).json({ error: "الحساب غير موجود" }); return; }
  res.json(acc);
});

// ── Create a general request (requires a logged-in customer account) ──────────
router.post("/general-requests", requireCustomerAuth, async (req: any, res): Promise<void> => {
  const { cityId, cityName, categoryId, categoryName, title, description, photoUrls } = req.body;

  const [acc] = await db.select().from(customerAccountsTable).where(eq(customerAccountsTable.id, req.customerAccountId));
  if (!acc) { res.status(404).json({ error: "الحساب غير موجود" }); return; }

  // Soft rate-limit: >=5 requests from the same account within the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ value: recentCount }] = await db.select({ value: count() }).from(generalRequestsTable)
    .where(and(eq(generalRequestsTable.customerAccountId, acc.id), sql`${generalRequestsTable.createdAt} > ${oneHourAgo}`));
  if (Number(recentCount) >= 5) {
    res.status(429).json({ error: "لقد نشرت عدة طلبات خلال وقت قصير، الرجاء الانتظار قليلاً قبل نشر طلب جديد" });
    return;
  }

  const id = crypto.randomBytes(8).toString("hex");
  const orderNumber = "OF-" + String(Date.now()).slice(-5);

  const [r] = await db.insert(generalRequestsTable).values({
    id, orderNumber,
    customerAccountId: acc.id,
    customerName: acc.name,
    whatsapp: acc.whatsapp,
    cityId: cityId || null,
    cityName: cityName || null,
    categoryId: categoryId || null,
    categoryName: categoryName || null,
    title: title || null,
    description: description || null,
    photoUrls: Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : null,
    status: "open",
  }).returning();

  res.status(201).json({ id: r.id, orderNumber: r.orderNumber });
});

// ── Customer's own requests + offers ("طلباتي") ────────────────────────────────
router.get("/general-requests/mine", requireCustomerAuth, async (req: any, res): Promise<void> => {
  const rows = await db.select().from(generalRequestsTable)
    .where(eq(generalRequestsTable.customerAccountId, req.customerAccountId))
    .orderBy(desc(generalRequestsTable.createdAt));

  const withOffers = await Promise.all(rows.map(async (reqRow) => {
    const offers = await db.select().from(generalOffersTable)
      .where(eq(generalOffersTable.requestId, reqRow.id))
      .orderBy(desc(generalOffersTable.createdAt));

    // Hide contact details of providers unless their offer has been selected
    const safeOffers = await Promise.all(offers.map(async (o) => {
      if (o.status !== "selected") {
        return { id: o.id, providerName: o.providerName, providerPhoto: o.providerPhoto, providerRating: o.providerRating, cityName: o.cityName, price: o.price, etaText: o.etaText, note: o.note, status: o.status, createdAt: o.createdAt };
      }
      let whatsappOut: string | null = null;
      if (o.entityType === "technician") {
        const [t] = await db.select({ whatsapp: techniciansTable.whatsapp }).from(techniciansTable).where(eq(techniciansTable.id, o.entityId));
        whatsappOut = t?.whatsapp || null;
      } else if (o.entityType === "company") {
        const [c] = await db.select({ whatsapp: companyApplicationsTable.whatsapp }).from(companyApplicationsTable).where(eq(companyApplicationsTable.id, o.entityId));
        whatsappOut = c?.whatsapp || null;
      }
      return { ...o, providerWhatsapp: whatsappOut };
    }));

    return { request: reqRow, offers: safeOffers };
  }));

  res.json(withOffers);
});

// ── List open requests for a pro (matches city + category) ────────────────────
router.get("/general-requests/for-pro", async (req, res): Promise<void> => {
  const { cityId, cityName, categoryId, categoryName } = req.query as Record<string, string>;
  const conditions = [eq(generalRequestsTable.status, "open")];
  const cityConds = [] as any[];
  if (cityId) cityConds.push(eq(generalRequestsTable.cityId, cityId));
  if (cityName) cityConds.push(eq(generalRequestsTable.cityName, cityName));
  if (cityConds.length) conditions.push(or(...cityConds)!);
  const catConds = [] as any[];
  if (categoryId) catConds.push(eq(generalRequestsTable.categoryId, categoryId));
  if (categoryName) catConds.push(eq(generalRequestsTable.categoryName, categoryName));
  if (catConds.length) conditions.push(or(...catConds)!);

  const rows = await db.select({
    id:           generalRequestsTable.id,
    orderNumber:  generalRequestsTable.orderNumber,
    cityName:     generalRequestsTable.cityName,
    categoryName: generalRequestsTable.categoryName,
    title:        generalRequestsTable.title,
    description:  generalRequestsTable.description,
    photoUrls:    generalRequestsTable.photoUrls,
    status:       generalRequestsTable.status,
    createdAt:    generalRequestsTable.createdAt,
  }).from(generalRequestsTable)
    .where(and(...conditions))
    .orderBy(desc(generalRequestsTable.createdAt))
    .limit(100);

  res.json(rows);
});

// ── Pro submits (or updates) an offer on a request ─────────────────────────────
router.post("/general-requests/:id/offers", async (req, res): Promise<void> => {
  const requestId = req.params.id;
  const { entityType, entityId, price, etaText, note } = req.body;
  if (!entityType || !entityId || !price) { res.status(400).json({ error: "بيانات العرض ناقصة" }); return; }

  const [reqRow] = await db.select().from(generalRequestsTable).where(eq(generalRequestsTable.id, requestId));
  if (!reqRow) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  if (reqRow.status !== "open") { res.status(409).json({ error: "تم إغلاق هذا الطلب بالفعل" }); return; }

  let providerName = "", providerPhoto: string | null = null, providerRating: string | null = null, cityName: string | null = null;
  if (entityType === "technician") {
    const [t] = await db.select().from(techniciansTable).where(eq(techniciansTable.id, entityId));
    if (t) { providerName = t.nameAr; providerPhoto = t.profilePhoto; providerRating = t.rating != null ? String(t.rating) : null; }
  } else if (entityType === "company") {
    const [c] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, entityId));
    if (c) { providerName = c.companyName; providerPhoto = c.companyLogo; providerRating = c.rating != null ? String(c.rating) : null; cityName = c.city; }
  }

  const [existing] = await db.select().from(generalOffersTable)
    .where(and(eq(generalOffersTable.requestId, requestId), eq(generalOffersTable.entityType, entityType), eq(generalOffersTable.entityId, entityId)));

  let offer;
  if (existing) {
    [offer] = await db.update(generalOffersTable)
      .set({ price: String(price), etaText: etaText || null, note: note || null })
      .where(eq(generalOffersTable.id, existing.id)).returning();
  } else {
    const id = crypto.randomBytes(8).toString("hex");
    [offer] = await db.insert(generalOffersTable).values({
      id, requestId, entityType, entityId,
      providerName, providerPhoto, providerRating, cityName,
      price: String(price), etaText: etaText || null, note: note || null,
      status: "pending",
    }).returning();
  }

  res.status(201).json(offer);
});

// ── Pro's own submitted offers (to know which requests they already offered on) ─
router.get("/general-requests/my-offers", async (req, res): Promise<void> => {
  const { entityType, entityId } = req.query as Record<string, string>;
  if (!entityType || !entityId) { res.status(400).json({ error: "Missing params" }); return; }
  const rows = await db.select().from(generalOffersTable)
    .where(and(eq(generalOffersTable.entityType, entityType), eq(generalOffersTable.entityId, entityId)))
    .orderBy(desc(generalOffersTable.createdAt));
  res.json(rows);
});

// ── Customer selects an offer → assigns request + feeds it into the existing
//    execution lifecycle by creating a normal service_request row ─────────────
router.post("/general-requests/:id/select-offer", requireCustomerAuth, async (req: any, res): Promise<void> => {
  const requestId = req.params.id;
  const { offerId } = req.body;
  if (!offerId) { res.status(400).json({ error: "بيانات ناقصة" }); return; }

  const [reqRow] = await db.select().from(generalRequestsTable)
    .where(and(eq(generalRequestsTable.id, requestId), eq(generalRequestsTable.customerAccountId, req.customerAccountId)));
  if (!reqRow) {
    console.warn("[select-offer 404]", { requestId, customerAccountId: req.customerAccountId });
    res.status(404).json({ error: "الطلب غير موجود" }); return;
  }
  if (reqRow.status !== "open") { res.status(409).json({ error: "تم اختيار عرض مسبقاً على هذا الطلب" }); return; }

  const [offer] = await db.select().from(generalOffersTable).where(eq(generalOffersTable.id, offerId));
  if (!offer || offer.requestId !== requestId) {
    console.warn("[select-offer offer-404]", { requestId, offerId, foundOffer: offer ? offer.requestId : null });
    res.status(404).json({ error: "العرض غير موجود" }); return;
  }

  await db.update(generalOffersTable).set({ status: "selected" }).where(eq(generalOffersTable.id, offer.id));
  await db.update(generalOffersTable).set({ status: "rejected" })
    .where(and(eq(generalOffersTable.requestId, requestId), sql`${generalOffersTable.id} != ${offer.id}`));
  await db.update(generalRequestsTable).set({ status: "assigned", assignedOfferId: offer.id }).where(eq(generalRequestsTable.id, requestId));

  // Feed into the existing direct-request execution cycle (unchanged logic)
  const srId = crypto.randomBytes(8).toString("hex");
  const [sr] = await db.insert(serviceRequestsTable).values({
    id: srId,
    ownerId: offer.entityId,
    ownerType: offer.entityType,
    ownerName: offer.providerName || null,
    customerName: reqRow.customerName,
    phone: reqRow.whatsapp,
    whatsappPhone: reqRow.whatsapp,
    callPhone: reqRow.whatsapp,
    cityId: reqRow.cityId,
    cityName: reqRow.cityName,
    requestType: "طلب عام (عرض مقبول)",
    categoryId: reqRow.categoryId,
    categoryName: reqRow.categoryName,
    description: `${reqRow.description || ""}\n\nالسعر المتفق عليه: ${offer.price}${offer.etaText ? ` — ${offer.etaText}` : ""}`.trim(),
    photoUrls: reqRow.photoUrls,
    status: "new",
  }).returning();

  res.status(201).json({ success: true, serviceRequestId: sr.id });
});

export default router;
