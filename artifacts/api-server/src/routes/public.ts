import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable,
  adsTable, technicianApplicationsTable, companyApplicationsTable,
  adRequestsTable, serviceRequestsTable, reviewsTable,
  supplierApplicationsTable, updateReportsTable, proCredentialsTable,
  referralsTable, analyticsEventsTable,
} from "@workspace/db/schema";
import crypto from "crypto";
import { eq, and, or, desc, inArray, ilike, sql, count } from "drizzle-orm";
import { expandSearchTerms } from "../lib/synonyms";

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
      .where(eq(techniciansTable.status, 'published'))
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

// ── Dynamic Sitemap ───────────────────────────────────────────────────────────
router.get("/sitemap.xml", async (_req, res): Promise<void> => {
  const [cities, techCounts, allCompanies, allSuppliers] = await Promise.all([
    db.select().from(citiesTable),
    db.select({ cityId: techniciansTable.cityId, cnt: count() })
      .from(techniciansTable)
      .where(eq(techniciansTable.status, 'published'))
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
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
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
    .where(eq(companyApplicationsTable.status, 'approved'));

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
router.get("/category-counts", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ categoryId: techniciansTable.categoryId, cnt: count() })
    .from(techniciansTable)
    .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true)))
    .groupBy(techniciansTable.categoryId);

  const map: Record<string, number> = {};
  rows.forEach(r => { if (r.categoryId) map[r.categoryId] = Number(r.cnt); });
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
    })
    .from(companyApplicationsTable)
    .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
    .where(eq(companyApplicationsTable.status, "published"))
    .orderBy(desc(companyApplicationsTable.createdAt));

  let companies = companyRows.map(r => ({
    ...r.company,
    categoryAr: r.categoryAr ?? r.company.specialty ?? '',
    categoryEn: r.categoryEn ?? r.company.specialty ?? '',
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
    })
    .from(companyApplicationsTable)
    .leftJoin(categoriesTable, eq(companyApplicationsTable.specialty, categoriesTable.id))
    .where(and(eq(companyApplicationsTable.id, raw), eq(companyApplicationsTable.status, "published")));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...row.company,
    categoryAr: row.categoryAr ?? row.company.specialty ?? '',
    categoryEn: row.categoryEn ?? row.company.specialty ?? '',
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
    // ← FIX: also match the technician's registered category name
    ilike(categoriesTable.nameAr, `%${t}%`),
    ilike(categoriesTable.nameEn, `%${t}%`),
    // ← FIX: also match extra specialties (stored as JSON array of category IDs)
    sql`CAST(${techniciansTable.extraSpecialties} AS text) ILIKE ${'%' + t + '%'}`,
  ]);
  const companyWhere = terms.flatMap(t => [
    ilike(companyApplicationsTable.companyName, `%${t}%`),
    ilike(companyApplicationsTable.contactName, `%${t}%`),
    ilike(companyApplicationsTable.description, `%${t}%`),
    ilike(companyApplicationsTable.city, `%${t}%`),
    // ← FIX: also match the company's registered category name
    ilike(categoriesTable.nameAr, `%${t}%`),
    ilike(categoriesTable.nameEn, `%${t}%`),
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
  ]);

  const rows = await db
    .select({
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
  });
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
  if (!['cancelled', 'completed'].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const [r] = await db.update(serviceRequestsTable).set({ status }).where(eq(serviceRequestsTable.id, raw)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
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
    const [techRef] = await db.select({ fullName: technicianApplicationsTable.fullName })
      .from(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, body.referred_by));
    if (techRef) { referredByName = techRef.fullName; referredByType = "technician"; }
    else {
      const [compRef] = await db.select({ companyName: companyApplicationsTable.companyName })
        .from(companyApplicationsTable).where(eq(companyApplicationsTable.id, body.referred_by));
      if (compRef) { referredByName = compRef.companyName; referredByType = "company"; }
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
    const [techRef] = await db.select({ fullName: technicianApplicationsTable.fullName })
      .from(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, body.referred_by));
    if (techRef) { refByName = techRef.fullName; refByType = "technician"; }
    else {
      const [compRef] = await db.select({ companyName: companyApplicationsTable.companyName })
        .from(companyApplicationsTable).where(eq(companyApplicationsTable.id, body.referred_by));
      if (compRef) { refByName = compRef.companyName; refByType = "company"; }
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
    status:         "new",
  });

  res.status(201).json({ ok: true, id });
});

// ── Pro Account Login ─────────────────────────────────────────────────────────
router.post("/pro/login", async (req, res): Promise<void> => {
  const { whatsapp, password } = req.body;
  if (!whatsapp || !password) { res.status(400).json({ error: "whatsapp and password required" }); return; }
  const normalised = whatsapp.replace(/\s/g, "");
  const [cred] = await db.select().from(proCredentialsTable).where(eq(proCredentialsTable.whatsapp, normalised));
  if (!cred) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const hash = crypto.createHash("sha256").update(String(password)).digest("hex");
  if (hash !== cred.passwordHash) { res.status(401).json({ error: "Invalid credentials" }); return; }
  res.json({ entityType: cred.entityType, entityId: cred.entityId, displayName: cred.displayName });
});

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

export default router;
