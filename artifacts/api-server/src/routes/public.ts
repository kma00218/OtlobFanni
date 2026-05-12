import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable,
  adsTable, technicianApplicationsTable, companyApplicationsTable,
  adRequestsTable, serviceRequestsTable,
} from "@workspace/db/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";

const router: IRouter = Router();

// ── Cities ──────────────────────────────────────────────────────────────────
router.get("/cities", async (_req, res): Promise<void> => {
  const cities = await db.select().from(citiesTable).orderBy(citiesTable.sortOrder);
  res.json(cities);
});

// ── Categories ───────────────────────────────────────────────────────────────
router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.json(categories);
});

// ── Technicians (public directory) ───────────────────────────────────────────
router.get("/technicians", async (req, res): Promise<void> => {
  const { category, city_id } = req.query as Record<string, string>;

  const conditions = [
    eq(techniciansTable.isApproved, true),
    eq(techniciansTable.isActive, true),
  ];

  if (category) {
    conditions.push(eq(techniciansTable.categoryId, category));
  }
  if (city_id) {
    conditions.push(eq(techniciansTable.cityId, city_id));
  }

  const rows = await db
    .select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .where(and(...conditions))
    .orderBy(desc(techniciansTable.isFeatured), desc(techniciansTable.rating));

  const techs = rows.map(r => ({
    ...r.tech,
    city_name_ar: r.cityNameAr ?? '',
    city_name_en: r.cityNameEn ?? '',
  }));

  res.json(techs);
});

// ── Companies (public directory — approved only) ──────────────────────────────
router.get("/companies", async (req, res): Promise<void> => {
  const { specialty, city } = req.query as Record<string, string>;

  let companies = await db
    .select()
    .from(companyApplicationsTable)
    .where(eq(companyApplicationsTable.status, "approved"))
    .orderBy(desc(companyApplicationsTable.createdAt));

  if (specialty) companies = companies.filter(c => c.specialty === specialty);

  if (city) {
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
  const [company] = await db
    .select()
    .from(companyApplicationsTable)
    .where(and(eq(companyApplicationsTable.id, raw), eq(companyApplicationsTable.status, "approved")));
  if (!company) { res.status(404).json({ error: "Not found" }); return; }
  res.json(company);
});

// ── Single Technician ─────────────────────────────────────────────────────────
router.get("/technicians/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db
    .select({
      tech: techniciansTable,
      cityNameAr: citiesTable.nameAr,
      cityNameEn: citiesTable.nameEn,
    })
    .from(techniciansTable)
    .leftJoin(citiesTable, eq(techniciansTable.cityId, citiesTable.id))
    .where(eq(techniciansTable.id, raw));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...row.tech, city_name_ar: row.cityNameAr ?? '', city_name_en: row.cityNameEn ?? '' });
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
      specialty:      body.specialty || body.category,
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
      status:         "pending",
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
      specialty:       body.specialty || 'more_services',
      customSpecialty: body.custom_specialty || null,
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
      status:         "pending",
    })
    .returning();

  res.status(201).json(app);
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

export default router;
