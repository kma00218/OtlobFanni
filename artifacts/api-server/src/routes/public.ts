import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable,
  adsTable, technicianApplicationsTable, companyApplicationsTable,
  adRequestsTable, serviceRequestsTable, reviewsTable,
} from "@workspace/db/schema";
import { eq, and, or, desc, inArray, ilike, sql, count } from "drizzle-orm";
import { expandSearchTerms } from "../lib/synonyms";

const router: IRouter = Router();

// ── Cities ──────────────────────────────────────────────────────────────────
router.get("/cities", async (_req, res): Promise<void> => {
  const cities = await db.select().from(citiesTable).orderBy(citiesTable.sortOrder);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json(cities);
});

// ── Categories ───────────────────────────────────────────────────────────────
router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json(categories);
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
  ]);
  const companyWhere = terms.flatMap(t => [
    ilike(companyApplicationsTable.companyName, `%${t}%`),
    ilike(companyApplicationsTable.contactName, `%${t}%`),
    ilike(companyApplicationsTable.description, `%${t}%`),
  ]);
  const cityWhere = terms.flatMap(t => [
    ilike(citiesTable.nameAr, `%${t}%`),
    ilike(citiesTable.nameEn, `%${t}%`),
  ]);

  const [techRows, companyRows, cityRows] = await Promise.all([
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
      .limit(4),

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
      .limit(4),

    db.select().from(citiesTable)
      .where(or(...cityWhere))
      .orderBy(citiesTable.sortOrder)
      .limit(5),
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
      extraSpecialties: body.extra_specialties || [],
      customSpecialty: body.custom_specialty || null,
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
      extraSpecialties: body.extra_specialties || [],
      customSpecialty:  body.custom_specialty || null,
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

  const results = [
    ...techApps.map(r => ({ type: "technician", fullName: r.fullName, ...r, technicianId: techIdMap[r.id] || null })),
    ...compApps.map(r => ({ type: "company",    fullName: r.companyName, ...r })),
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

export default router;
