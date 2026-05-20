import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable, adsTable,
  adRequestsTable, technicianApplicationsTable, companyApplicationsTable,
  adminsTable, serviceRequestsTable, supplierApplicationsTable, updateReportsTable,
  proCredentialsTable,
} from "@workspace/db/schema";
import crypto from "crypto";
import { eq, ne, desc, count, and, or, ilike, sql } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";

const router: IRouter = Router();

// ── Stats (Dashboard) ─────────────────────────────────────────────────────────
router.get("/stats", async (_req, res): Promise<void> => {
  const [techCount]          = await db.select({ count: count() }).from(techniciansTable);
  const [activeTechCount]    = await db.select({ count: count() }).from(techniciansTable).where(and(eq(techniciansTable.isActive, true), eq(techniciansTable.isApproved, true)));
  const [cityCount]          = await db.select({ count: count() }).from(citiesTable);
  const [catCount]           = await db.select({ count: count() }).from(categoriesTable);
  const [activeCatCount]     = await db.select({ count: count() }).from(categoriesTable).where(eq(categoriesTable.isActive, true));
  const [activeAdsCount]     = await db.select({ count: count() }).from(adsTable).where(eq(adsTable.isActive, true));
  const [pendingTechApps]    = await db.select({ count: count() }).from(technicianApplicationsTable).where(eq(technicianApplicationsTable.status, "pending"));
  const [totalTechApps]      = await db.select({ count: count() }).from(technicianApplicationsTable);
  const [pendingCompApps]    = await db.select({ count: count() }).from(companyApplicationsTable).where(eq(companyApplicationsTable.status, "pending"));
  const [totalCompApps]      = await db.select({ count: count() }).from(companyApplicationsTable);
  const [approvedCompanies]  = await db.select({ count: count() }).from(companyApplicationsTable).where(or(eq(companyApplicationsTable.status, "approved"), eq(companyApplicationsTable.status, "published")));
  const [pendingAdReqs]      = await db.select({ count: count() }).from(adRequestsTable).where(eq(adRequestsTable.status, "pending"));
  const [approvedAdReqs]     = await db.select({ count: count() }).from(adRequestsTable).where(eq(adRequestsTable.status, "approved"));
  const [newReqs]            = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "new"));
  const [completedReqs]      = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "completed"));
  const [pendingSupplierApps]  = await db.select({ count: count() }).from(supplierApplicationsTable).where(eq(supplierApplicationsTable.status, "pending"));
  const [totalSupplierApps]    = await db.select({ count: count() }).from(supplierApplicationsTable);
  const [publishedSuppliers]   = await db.select({ count: count() }).from(supplierApplicationsTable).where(eq(supplierApplicationsTable.status, "published"));
  const [activeSupplierApps]   = await db.select({ count: count() }).from(supplierApplicationsTable).where(ne(supplierApplicationsTable.status, "published"));
  const [pendingUpdateRpts]    = await db.select({ count: count() }).from(updateReportsTable).where(eq(updateReportsTable.status, "new"));

  const recentRequests = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt)).limit(5);
  const recentTechs      = await db.select().from(techniciansTable).orderBy(desc(techniciansTable.createdAt)).limit(5);
  const recentCompanies  = await db.select().from(companyApplicationsTable).orderBy(desc(companyApplicationsTable.createdAt)).limit(5);

  res.json({
    totalTechs:           Number(techCount.count),
    activeTechs:          Number(activeTechCount.count),
    totalCities:          Number(cityCount.count),
    totalCats:            Number(catCount.count),
    totalCategories:      Number(activeCatCount.count),
    activeAds:            Number(activeAdsCount.count),
    pendingTechApps:      Number(pendingTechApps.count),
    totalTechApps:        Number(totalTechApps.count),
    totalCompanies:       Number(approvedCompanies.count),
    pendingCompanyApps:   Number(pendingCompApps.count),
    totalCompanyApps:     Number(totalCompApps.count),
    pendingAdRequests:    Number(pendingAdReqs.count),
    approvedAdRequests:   Number(approvedAdReqs.count),
    newRequests:          Number(newReqs.count),
    completedRequests:    Number(completedReqs.count),
    pendingSupplierApps:  Number(pendingSupplierApps.count),
    totalSupplierApps:    Number(totalSupplierApps.count),
    activeSupplierApps:   Number(activeSupplierApps.count),
    totalSuppliers:       Number(publishedSuppliers.count),
    pendingUpdateReports: Number(pendingUpdateRpts.count),
    recentRequests,
    recentTechs,
    recentCompanies,
  });
});

// ── Storage Usage ─────────────────────────────────────────────────────────────
router.get("/storage-usage", async (_req, res): Promise<void> => {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) {
      res.json({ usedBytes: 0, fileCount: 0, limitBytes: 1 * 1024 * 1024 * 1024 });
      return;
    }
    const bucket = objectStorageClient.bucket(bucketId);
    const [files] = await bucket.getFiles();
    let usedBytes = 0;
    for (const file of files) {
      const size = Number(file.metadata?.size ?? 0);
      usedBytes += size;
    }
    res.json({
      usedBytes,
      fileCount: files.length,
      limitBytes: 1 * 1024 * 1024 * 1024,
    });
  } catch {
    res.json({ usedBytes: 0, fileCount: 0, limitBytes: 1 * 1024 * 1024 * 1024 });
  }
});

// ── Technician Applications ───────────────────────────────────────────────────
router.get("/technician-applications", async (_req, res): Promise<void> => {
  const apps = await db.select().from(technicianApplicationsTable).orderBy(desc(technicianApplicationsTable.createdAt));
  res.json(apps);
});

const EXP_YEARS_MAP: Record<string, number> = {
  less1: 0, '1-2': 2, '3-5': 5, '6-10': 10, '10+': 11,
};

router.patch("/technician-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, createCategory, linkCategoryId, rejectionReason } = req.body;
  const setData: Record<string, unknown> = { status };
  if (status === "rejected" && rejectionReason) setData.rejectionReason = rejectionReason;
  if (status !== "rejected") setData.rejectionReason = null;
  const [app] = await db
    .update(technicianApplicationsTable)
    .set(setData)
    .where(eq(technicianApplicationsTable.id, raw))
    .returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  let resolvedCategoryId: string | null = linkCategoryId || null;

  if ((status === "approved" || status === "published") && app.customSpecialty && createCategory === true) {
    const customName = app.customSpecialty.trim();
    const allCats = await db.select().from(categoriesTable);
    const existing = allCats.find(c => c.nameAr === customName || c.nameEn === customName);
    if (!existing) {
      const catId = "custom_" + Date.now();
      await db.insert(categoriesTable).values({
        id: catId, nameAr: customName, nameEn: customName,
        iconName: "more", sectionId: "more_services", sortOrder: 99, isActive: true,
      }).onConflictDoNothing();
      resolvedCategoryId = catId;
    } else {
      resolvedCategoryId = existing.id;
    }
  }

  // ── Ensure technician record exists in public directory ──────────────────────
  // Only on publish: the approve flow creates the record from the frontend.
  // This catches cases where approval happened without record creation (network error, etc.)
  if (status === "published" && app.fullName && app.phone) {
    const [existing] = await db.select({ id: techniciansTable.id })
      .from(techniciansTable)
      .where(eq(techniciansTable.applicationId, app.id));

    if (existing) {
      // Technician record already exists (created during approval) — activate it now
      await db.update(techniciansTable)
        .set({
          isActive: true,
          isApproved: true,
          status: app.availableNow ? "available" : "busy",
        })
        .where(eq(techniciansTable.applicationId, app.id));
    } else {
      // Fallback: create if somehow missing (e.g. approval happened before this fix)
      const cityRows = await db.select().from(citiesTable);
      const cityRow = cityRows.find(c =>
        c.nameAr === app.city || c.nameEn === app.city || c.id === app.city
      );
      const effectiveCatId = resolvedCategoryId
        || (app.customSpecialty ? "more_services" : app.specialty)
        || null;

      await db.insert(techniciansTable).values({
        id: "tech_" + app.id,
        nameAr: app.fullName,
        phone: app.phone,
        whatsapp: app.whatsapp || app.phone,
        cityId: cityRow?.id ?? null,
        area: app.area ?? "",
        categoryId: effectiveCatId,
        extraSpecialties: (app as any).extraSpecialties || [],
        experienceYears: EXP_YEARS_MAP[app.experience as string] ?? 0,
        priceFrom: parseFloat(String(app.priceFrom ?? 0)) || 0,
        priceTo: parseFloat(String(app.priceTo ?? 0)) || 0,
        descriptionAr: app.description ?? "",
        profilePhoto: app.profilePhoto ?? null,
        workImages: (app as any).workImages || [],
        isApproved: true,
        isActive: true,
        isFeatured: false,
        status: app.availableNow ? "available" : "busy",
        availableNow: app.availableNow ?? false,
        emergency: app.emergency ?? false,
        lat: app.lat ?? null,
        lng: app.lng ?? null,
        applicationId: app.id,
      }).onConflictDoNothing();
    }
  }

  res.json({ ...app, resolvedCategoryId });
});

router.delete("/technician-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, raw));
  res.sendStatus(204);
});

// ── Companies (approved or published) ────────────────────────────────────────
router.get("/companies", async (_req, res): Promise<void> => {
  const companies = await db
    .select()
    .from(companyApplicationsTable)
    .where(or(eq(companyApplicationsTable.status, "approved"), eq(companyApplicationsTable.status, "published")))
    .orderBy(desc(companyApplicationsTable.createdAt));
  res.json(companies);
});

router.patch("/companies/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const [app] = await db
    .update(companyApplicationsTable)
    .set({ status })
    .where(eq(companyApplicationsTable.id, raw))
    .returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.patch("/companies/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const b = req.body;
  const updates: Record<string, unknown> = {};
  if (b.company_name  !== undefined) updates.companyName   = b.company_name;
  if (b.contact_name  !== undefined) updates.contactName   = b.contact_name;
  if (b.phone         !== undefined) updates.phone         = b.phone;
  if (b.whatsapp      !== undefined) updates.whatsapp      = b.whatsapp;
  if (b.commercial_reg!== undefined) updates.commercialReg = b.commercial_reg;
  if (b.city          !== undefined) updates.city          = b.city;
  if (b.area          !== undefined) updates.area          = b.area;
  if (b.address       !== undefined) updates.address       = b.address;
  if (b.specialty          !== undefined) updates.specialty         = b.specialty;
  if (b.extra_specialties  !== undefined) updates.extraSpecialties  = b.extra_specialties;
  if (b.years_active  !== undefined) updates.yearsActive   = b.years_active;
  if (b.description   !== undefined) updates.description   = b.description;
  if (b.certifications!== undefined) updates.certifications= b.certifications;
  if (b.price_from    !== undefined) updates.priceFrom     = b.price_from;
  if (b.price_to      !== undefined) updates.priceTo       = b.price_to;
  if (b.available_now !== undefined) updates.availableNow  = b.available_now;
  if (b.working_days  !== undefined) updates.workingDays   = b.working_days;
  if (b.hours_from    !== undefined) updates.hoursFrom     = b.hours_from;
  if (b.hours_to      !== undefined) updates.hoursTo       = b.hours_to;
  if (b.emergency     !== undefined) updates.emergency     = b.emergency;
  if (b.service_radius!== undefined) updates.serviceRadius = b.service_radius;
  if (b.facebook      !== undefined) updates.facebook      = b.facebook;
  if (b.instagram     !== undefined) updates.instagram     = b.instagram;
  if (b.company_logo  !== undefined) updates.companyLogo   = b.company_logo;
  if (b.work_images   !== undefined) updates.workImages    = b.work_images;
  const [app] = await db
    .update(companyApplicationsTable)
    .set(updates)
    .where(eq(companyApplicationsTable.id, raw))
    .returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

// ── Company Applications ──────────────────────────────────────────────────────
router.get("/company-applications", async (_req, res): Promise<void> => {
  const apps = await db.select().from(companyApplicationsTable).orderBy(desc(companyApplicationsTable.createdAt));
  res.json(apps);
});

router.patch("/company-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, createCategory, linkCategoryId, rejectionReason } = req.body;

  let resolvedCategoryId: string | null = linkCategoryId || null;
  const updates: Record<string, unknown> = { status };
  if (status === "rejected" && rejectionReason) updates.rejectionReason = rejectionReason;
  if (status !== "rejected") updates.rejectionReason = null;

  if (status === "approved") {
    const [existingApp] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw));
    if (createCategory === true && existingApp?.customSpecialty) {
      const customName = existingApp.customSpecialty.trim();
      const allCats = await db.select().from(categoriesTable);
      const existingCat = allCats.find(c => c.nameAr === customName || c.nameEn === customName);
      if (!existingCat) {
        const catId = "custom_" + Date.now();
        await db.insert(categoriesTable).values({
          id: catId, nameAr: customName, nameEn: customName,
          iconName: "more", sectionId: "more_services", sortOrder: 99, isActive: true,
        }).onConflictDoNothing();
        resolvedCategoryId = catId;
      } else {
        resolvedCategoryId = existingCat.id;
      }
    }
    if (resolvedCategoryId) {
      updates.specialty = resolvedCategoryId;
    } else if (existingApp?.customSpecialty) {
      updates.specialty = "more_services";
    }
  }

  const [app] = await db
    .update(companyApplicationsTable)
    .set(updates)
    .where(eq(companyApplicationsTable.id, raw))
    .returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...app, resolvedCategoryId });
});

router.delete("/company-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw));
  res.sendStatus(204);
});

// ── Companies: direct admin create & delete ───────────────────────────────────
router.post("/companies", async (req, res): Promise<void> => {
  const b = req.body;
  if (!b.company_name || !b.phone) {
    res.status(400).json({ error: "company_name and phone are required" }); return;
  }
  const [row] = await db.insert(companyApplicationsTable).values({
    companyName:    b.company_name,
    contactName:    b.contact_name    || '',
    phone:          b.phone,
    whatsapp:       b.whatsapp        || b.phone,
    commercialReg:  b.commercial_reg  || '',
    city:           b.city            || '',
    area:           b.area            || '',
    address:        b.address         || '',
    specialty:      b.specialty       || '',
    yearsActive:    b.years_active    || '',
    description:    b.description     || '',
    certifications: b.certifications  || '',
    priceFrom:      b.price_from      ?? 0,
    priceTo:        b.price_to        ?? 0,
    availableNow:   b.available_now   ?? false,
    emergency:      b.emergency       ?? false,
    workingDays:    b.working_days     || [],
    hoursFrom:      b.hours_from      || '',
    hoursTo:        b.hours_to        || '',
    serviceRadius:  b.service_radius  || '',
    facebook:       b.facebook        || '',
    instagram:      b.instagram       || '',
    companyLogo:    b.company_logo    || '',
    workImages:     b.work_images     || [],
    status:         'approved',
  }).returning();
  res.status(201).json(row);
});

router.delete("/companies/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw));
  res.sendStatus(204);
});

// ── Technicians (admin CRUD) ──────────────────────────────────────────────────
router.get("/technicians", async (_req, res): Promise<void> => {
  const techs = await db.select().from(techniciansTable).orderBy(desc(techniciansTable.createdAt));
  res.json(techs);
});

router.post("/technicians", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.id || !body.name_ar || !body.phone) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [tech] = await db.insert(techniciansTable).values({
    id: body.id, nameAr: body.name_ar, nameEn: body.name_en,
    phone: body.phone, whatsapp: body.whatsapp || body.phone,
    cityId: body.city_id, area: body.area, categoryId: body.category_id,
    extraSpecialties: body.extra_specialties || [],
    experienceYears: body.experience_years || 0,
    priceFrom: body.price_from || 0, priceTo: body.price_to || 0,
    descriptionAr: body.description_ar, descriptionEn: body.description_en,
    profilePhoto: body.profile_photo || body.profilePhoto,
    workImages: body.work_images || [], rating: body.rating || 0,
    reviewsCount: body.reviews_count || 0, isFeatured: !!body.is_featured,
    isApproved: body.is_approved ?? true, isActive: body.is_active ?? true,
    status: body.status || "available", emergency: !!body.emergency,
    availableNow: body.status === "available", facebook: body.facebook,
    instagram: body.instagram, applicationId: body.application_id,
  }).returning();
  res.status(201).json(tech);
});

router.patch("/technicians/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.name_ar !== undefined)         updates.nameAr = body.name_ar;
  if (body.name_en !== undefined)         updates.nameEn = body.name_en;
  if (body.phone !== undefined)           updates.phone = body.phone;
  if (body.whatsapp !== undefined)        updates.whatsapp = body.whatsapp;
  if (body.city_id !== undefined)         updates.cityId = body.city_id;
  if (body.area !== undefined)            updates.area = body.area;
  if (body.category_id !== undefined)     updates.categoryId = body.category_id;
  if (body.extra_specialties !== undefined) updates.extraSpecialties = body.extra_specialties;
  if (body.experience_years !== undefined) updates.experienceYears = body.experience_years;
  if (body.price_from !== undefined)      updates.priceFrom = body.price_from;
  if (body.price_to !== undefined)        updates.priceTo = body.price_to;
  if (body.description_ar !== undefined)  updates.descriptionAr = body.description_ar;
  if (body.description_en !== undefined)  updates.descriptionEn = body.description_en;
  if (body.profile_photo !== undefined)   updates.profilePhoto = body.profile_photo;
  if (body.is_featured !== undefined)     updates.isFeatured = body.is_featured;
  if (body.is_approved !== undefined)     updates.isApproved = body.is_approved;
  if (body.is_active !== undefined)       updates.isActive = body.is_active;
  if (body.status !== undefined)          updates.status = body.status;
  if (body.emergency !== undefined)       updates.emergency = body.emergency;
  if (body.rating !== undefined)          updates.rating = body.rating;
  if (body.facebook !== undefined)        updates.facebook = body.facebook;
  if (body.instagram !== undefined)       updates.instagram = body.instagram;

  const [tech] = await db.update(techniciansTable).set(updates).where(eq(techniciansTable.id, raw)).returning();
  if (!tech) { res.status(404).json({ error: "Not found" }); return; }
  res.json(tech);
});

router.delete("/technicians/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(techniciansTable).where(eq(techniciansTable.id, raw));
  res.sendStatus(204);
});

// ── Cities ────────────────────────────────────────────────────────────────────
router.get("/cities", async (_req, res): Promise<void> => {
  const cities = await db.select().from(citiesTable).orderBy(citiesTable.sortOrder);
  res.json(cities);
});

router.post("/cities", async (req, res): Promise<void> => {
  const body = req.body;
  const [city] = await db.insert(citiesTable).values({
    id: body.id, nameAr: body.name_ar, nameEn: body.name_en,
    sortOrder: body.sort_order || 0, isActive: body.is_active ?? true,
  }).returning();
  res.status(201).json(city);
});

router.patch("/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.name_ar !== undefined)   updates.nameAr = body.name_ar;
  if (body.name_en !== undefined)   updates.nameEn = body.name_en;
  if (body.sort_order !== undefined) updates.sortOrder = body.sort_order;
  if (body.is_active !== undefined) updates.isActive = body.is_active;
  const [city] = await db.update(citiesTable).set(updates).where(eq(citiesTable.id, raw)).returning();
  if (!city) { res.status(404).json({ error: "Not found" }); return; }
  res.json(city);
});

router.delete("/cities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(citiesTable).where(eq(citiesTable.id, raw));
  res.sendStatus(204);
});

// ── Categories ────────────────────────────────────────────────────────────────
router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.json(cats);
});

router.post("/categories", async (req, res): Promise<void> => {
  const body = req.body;
  const [cat] = await db.insert(categoriesTable).values({
    id: body.id, nameAr: body.name_ar, nameEn: body.name_en,
    iconName: body.icon_name || body.icon, sectionId: body.section_id || null,
    sortOrder: body.sort_order || 0, isActive: body.is_active ?? true,
  }).returning();
  res.status(201).json(cat);
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.name_ar !== undefined)    updates.nameAr = body.name_ar;
  if (body.name_en !== undefined)    updates.nameEn = body.name_en;
  if (body.icon_name !== undefined)  updates.iconName = body.icon_name;
  if (body.icon !== undefined)       updates.iconName = body.icon;
  if (body.section_id !== undefined) updates.sectionId = body.section_id;
  if (body.sort_order !== undefined) updates.sortOrder = body.sort_order;
  if (body.is_active !== undefined)  updates.isActive = body.is_active;
  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, raw)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(categoriesTable).where(eq(categoriesTable.id, raw));
  res.sendStatus(204);
});

// ── Ads ───────────────────────────────────────────────────────────────────────
router.get("/ads", async (_req, res): Promise<void> => {
  const ads = await db.select().from(adsTable).orderBy(desc(adsTable.createdAt));
  res.json(ads);
});

router.post("/ads", async (req, res): Promise<void> => {
  const body = req.body;
  const [ad] = await db.insert(adsTable).values({
    id: body.id, titleAr: body.title_ar, titleEn: body.title_en,
    descriptionAr: body.description_ar, descriptionEn: body.description_en,
    imageUrl: body.image_url, linkUrl: body.link_url,
    placement: body.placement,
    sectionId:  body.section_id  || null,
    categoryId: body.category_id || null,
    sortOrder:  body.sort_order  ?? 0,
    isActive: body.is_active ?? true,
    startDate: body.start_date, endDate: body.end_date,
  }).returning();
  res.status(201).json(ad);
});

router.patch("/ads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.title_ar !== undefined)      updates.titleAr = body.title_ar;
  if (body.title_en !== undefined)      updates.titleEn = body.title_en;
  if (body.description_ar !== undefined) updates.descriptionAr = body.description_ar;
  if (body.image_url !== undefined)     updates.imageUrl = body.image_url;
  if (body.link_url !== undefined)      updates.linkUrl = body.link_url;
  if (body.placement !== undefined)     updates.placement = body.placement;
  if (body.section_id !== undefined)    updates.sectionId = body.section_id;
  if (body.category_id !== undefined)   updates.categoryId = body.category_id;
  if (body.sort_order !== undefined)    updates.sortOrder = body.sort_order;
  if (body.is_active !== undefined)     updates.isActive = body.is_active;
  if (body.start_date !== undefined)    updates.startDate = body.start_date;
  if (body.end_date !== undefined)      updates.endDate = body.end_date;
  const [ad] = await db.update(adsTable).set(updates).where(eq(adsTable.id, raw)).returning();
  if (!ad) { res.status(404).json({ error: "Not found" }); return; }
  res.json(ad);
});

router.delete("/ads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(adsTable).where(eq(adsTable.id, raw));
  res.sendStatus(204);
});

// ── Ad Requests ───────────────────────────────────────────────────────────────
router.get("/ad-requests", async (_req, res): Promise<void> => {
  const reqs = await db.select().from(adRequestsTable).orderBy(desc(adRequestsTable.createdAt));
  res.json(reqs);
});

router.patch("/ad-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const [r] = await db.update(adRequestsTable).set({ status }).where(eq(adRequestsTable.id, raw)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

router.delete("/ad-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(adRequestsTable).where(eq(adRequestsTable.id, raw));
  res.sendStatus(204);
});

// ── Service Requests ──────────────────────────────────────────────────────────
router.get("/service-requests", async (_req, res): Promise<void> => {
  const reqs = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));
  res.json(reqs);
});

router.patch("/service-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const [r] = await db.update(serviceRequestsTable).set({ status }).where(eq(serviceRequestsTable.id, raw)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

router.delete("/service-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(serviceRequestsTable).where(eq(serviceRequestsTable.id, raw));
  res.sendStatus(204);
});

// ── Admin Login ───────────────────────────────────────────────────────────────
router.post("/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email.toLowerCase().trim()));
  if (!admin || !admin.isActive) { res.status(401).json({ error: "بيانات الدخول غير صحيحة" }); return; }
  if (admin.passwordHash !== password) { res.status(401).json({ error: "بيانات الدخول غير صحيحة" }); return; }
  res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, isActive: admin.isActive });
});

// ── Admin Users ───────────────────────────────────────────────────────────────
router.get("/admin-users", async (_req, res): Promise<void> => {
  const users = await db.select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, isActive: adminsTable.isActive, createdAt: adminsTable.createdAt }).from(adminsTable).orderBy(desc(adminsTable.createdAt));
  res.json(users);
});

router.post("/admin-users", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.email || !body.name) { res.status(400).json({ error: "Name and email required" }); return; }
  const [user] = await db.insert(adminsTable).values({
    name:         body.name,
    email:        body.email,
    passwordHash: body.password || body.passwordHash || "demo1234",
    role:         body.role || "sub_admin",
    isActive:     body.is_active ?? true,
  }).returning({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, isActive: adminsTable.isActive, createdAt: adminsTable.createdAt });
  res.status(201).json(user);
});

router.patch("/admin-users/:id", async (req, res): Promise<void> => {
  const idNum = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(idNum)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.name      !== undefined) updates.name     = body.name;
  if (body.is_active !== undefined) updates.isActive = body.is_active;
  if (body.role      !== undefined) updates.role     = body.role;
  if (body.password  !== undefined) updates.passwordHash = body.password;
  const [user] = await db.update(adminsTable).set(updates).where(eq(adminsTable.id, idNum)).returning({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, isActive: adminsTable.isActive, createdAt: adminsTable.createdAt });
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(user);
});

router.delete("/admin-users/:id", async (req, res): Promise<void> => {
  const idNum = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(idNum)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [target] = await db.select().from(adminsTable).where(eq(adminsTable.id, idNum));
  if (!target) { res.status(404).json({ error: "Not found" }); return; }
  if (target.role === "super_admin") { res.status(403).json({ error: "لا يمكن حذف المدير العام" }); return; }
  await db.delete(adminsTable).where(eq(adminsTable.id, idNum));
  res.sendStatus(204);
});

// ── Account Search ────────────────────────────────────────────────────────────
router.get("/search-account", async (req, res): Promise<void> => {
  const q = (Array.isArray(req.query.q) ? req.query.q[0] : (req.query.q as string) || "").trim();
  if (!q || q.length < 2) { res.json([]); return; }

  // If query looks like TEC-YYYY-NNNNNN, COM-YYYY-NNNNNN or SUP-YYYY-NNNNNN
  const displayCodeMatch = q.match(/^(?:TEC|COM|SUP)-\d{4}-(\d+)$/i);
  const digitSuffix = displayCodeMatch ? displayCodeMatch[1] : null;
  const isSupCode   = /^SUP-/i.test(q);

  const techWhere = (digitSuffix && !isSupCode)
    ? sql`regexp_replace(${technicianApplicationsTable.id}, '[^0-9]', '', 'g') LIKE ${'%' + digitSuffix}`
    : or(
        eq(technicianApplicationsTable.id, q),
        ilike(technicianApplicationsTable.requestNumber, `%${q}%`),
        ilike(technicianApplicationsTable.fullName, `%${q}%`),
        ilike(technicianApplicationsTable.phone, `%${q}%`),
        ilike(technicianApplicationsTable.whatsapp, `%${q}%`),
      );

  const compWhere = (digitSuffix && !isSupCode)
    ? sql`regexp_replace(${companyApplicationsTable.id}, '[^0-9]', '', 'g') LIKE ${'%' + digitSuffix}`
    : or(
        eq(companyApplicationsTable.id, q),
        ilike(companyApplicationsTable.requestNumber, `%${q}%`),
        ilike(companyApplicationsTable.companyName, `%${q}%`),
        ilike(companyApplicationsTable.contactName, `%${q}%`),
        ilike(companyApplicationsTable.phone, `%${q}%`),
        ilike(companyApplicationsTable.whatsapp, `%${q}%`),
      );

  const supWhere = isSupCode
    ? ilike(supplierApplicationsTable.requestNumber, `%${q}%`)
    : or(
        eq(supplierApplicationsTable.id, q),
        ilike(supplierApplicationsTable.requestNumber, `%${q}%`),
        ilike(supplierApplicationsTable.businessName, `%${q}%`),
        ilike(supplierApplicationsTable.contactName, `%${q}%`),
        ilike(supplierApplicationsTable.phone, `%${q}%`),
        ilike(supplierApplicationsTable.whatsapp, `%${q}%`),
      );

  const [techRows, compRows, supRows] = await Promise.all([
    db.select().from(technicianApplicationsTable).where(techWhere).limit(10),
    db.select().from(companyApplicationsTable).where(compWhere).limit(10),
    db.select().from(supplierApplicationsTable).where(supWhere).limit(10),
  ]);

  const withStats = async (row: any, type: string) => {
    const [ts] = await db.select({
      registered: sql<number>`count(*)::int`,
      accepted:   sql<number>`(count(*) filter (where ${technicianApplicationsTable.status} in ('approved','published')))::int`,
    }).from(technicianApplicationsTable).where(eq(technicianApplicationsTable.referredBy, row.id));
    const [cs] = await db.select({
      registered: sql<number>`count(*)::int`,
      accepted:   sql<number>`(count(*) filter (where ${companyApplicationsTable.status} in ('approved','published')))::int`,
    }).from(companyApplicationsTable).where(eq(companyApplicationsTable.referredBy, row.id));

    let technicianIsActive: boolean | null = null;
    if (type === "technician" && row.status === "published") {
      const [tech] = await db.select({ isActive: techniciansTable.isActive })
        .from(techniciansTable)
        .where(eq(techniciansTable.applicationId, row.id));
      technicianIsActive = tech?.isActive ?? null;
    }

    return {
      ...row,
      accountType:  type,
      displayName:  type === "technician" ? row.fullName : type === "supplier" ? row.businessName : row.companyName,
      technicianIsActive,
      referralStats: {
        registered: (ts?.registered ?? 0) + (cs?.registered ?? 0),
        accepted:   (ts?.accepted   ?? 0) + (cs?.accepted   ?? 0),
      },
    };
  };

  const results = await Promise.all([
    ...techRows.map(r => withStats(r, "technician")),
    ...compRows.map(r => withStats(r, "company")),
    ...supRows.map(r => withStats(r, "supplier")),
  ]);

  res.json(results);
});

// ── Pro Credentials (Admin) ───────────────────────────────────────────────────
router.post("/pro-credentials/:entityType/:entityId", async (req, res): Promise<void> => {
  const { entityType, entityId } = req.params;
  let whatsapp = "";
  let displayName = "";

  if (entityType === "technician") {
    // Try application table first (for technicians registered via form)
    const [appRow] = await db.select().from(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, entityId));
    if (appRow) {
      whatsapp = appRow.whatsapp || appRow.phone || "";
      displayName = appRow.fullName || "";
    } else {
      // Fallback: look up directly from technicians table (manually added technicians)
      const [techRow] = await db.select().from(techniciansTable).where(eq(techniciansTable.id, entityId));
      if (!techRow) { res.status(404).json({ error: "Not found" }); return; }
      whatsapp = techRow.whatsapp || techRow.phone || "";
      displayName = techRow.nameAr || techRow.nameEn || "";
    }
  } else if (entityType === "company") {
    const [row] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, entityId));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    whatsapp = row.whatsapp || row.phone || "";
    displayName = row.companyName || "";
  } else if (entityType === "supplier") {
    const [row] = await db.select().from(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, entityId));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    whatsapp = row.whatsapp || row.phone || "";
    displayName = row.businessName || "";
  } else {
    res.status(400).json({ error: "Invalid entity type" }); return;
  }

  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let password = "";
  for (let i = 0; i < 6; i++) password += CHARS[bytes[i] % CHARS.length];

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const id = crypto.randomUUID();

  await db.insert(proCredentialsTable).values({
    id, entityType, entityId, whatsapp, displayName, passwordHash,
  }).onConflictDoUpdate({
    target: proCredentialsTable.entityId,
    set: { whatsapp, displayName, passwordHash, updatedAt: new Date() },
  });

  res.json({ password, whatsapp, displayName });
});

// ── Update Reports (Admin) ─────────────────────────────────────────────────────
router.get("/update-reports", async (_req, res): Promise<void> => {
  const rows = await db.select().from(updateReportsTable).orderBy(desc(updateReportsTable.createdAt));
  res.json(rows);
});

router.patch("/update-reports/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  await db.update(updateReportsTable).set({ status }).where(eq(updateReportsTable.id, id));
  res.json({ ok: true });
});

router.delete("/update-reports/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  await db.delete(updateReportsTable).where(eq(updateReportsTable.id, id));
  res.json({ ok: true });
});

export default router;
