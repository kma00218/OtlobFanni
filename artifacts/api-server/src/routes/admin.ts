import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable, adsTable,
  adRequestsTable, technicianApplicationsTable, companyApplicationsTable,
  adminsTable, serviceRequestsTable,
} from "@workspace/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { objectStorageClient } from "../lib/objectStorage";

const router: IRouter = Router();

// ── Stats (Dashboard) ─────────────────────────────────────────────────────────
router.get("/stats", async (_req, res): Promise<void> => {
  const [techCount]          = await db.select({ count: count() }).from(techniciansTable);
  const [activeTechCount]    = await db.select({ count: count() }).from(techniciansTable).where(and(eq(techniciansTable.isActive, true), eq(techniciansTable.isApproved, true)));
  const [cityCount]          = await db.select({ count: count() }).from(citiesTable);
  const [catCount]           = await db.select({ count: count() }).from(categoriesTable);
  const [activeAdsCount]     = await db.select({ count: count() }).from(adsTable).where(eq(adsTable.isActive, true));
  const [pendingTechApps]    = await db.select({ count: count() }).from(technicianApplicationsTable).where(eq(technicianApplicationsTable.status, "pending"));
  const [totalTechApps]      = await db.select({ count: count() }).from(technicianApplicationsTable);
  const [pendingCompApps]    = await db.select({ count: count() }).from(companyApplicationsTable).where(eq(companyApplicationsTable.status, "pending"));
  const [totalCompApps]      = await db.select({ count: count() }).from(companyApplicationsTable);
  const [pendingAdReqs]      = await db.select({ count: count() }).from(adRequestsTable).where(eq(adRequestsTable.status, "pending"));
  const [approvedAdReqs]     = await db.select({ count: count() }).from(adRequestsTable).where(eq(adRequestsTable.status, "approved"));
  const [newReqs]            = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "new"));
  const [completedReqs]      = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "completed"));

  const recentRequests = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt)).limit(5);
  const recentTechs    = await db.select().from(techniciansTable).orderBy(desc(techniciansTable.createdAt)).limit(5);

  res.json({
    totalTechs:          Number(techCount.count),
    activeTechs:         Number(activeTechCount.count),
    totalCities:         Number(cityCount.count),
    totalCats:           Number(catCount.count),
    activeAds:           Number(activeAdsCount.count),
    pendingTechApps:     Number(pendingTechApps.count),
    totalTechApps:       Number(totalTechApps.count),
    pendingCompanyApps:  Number(pendingCompApps.count),
    totalCompanyApps:    Number(totalCompApps.count),
    pendingAdRequests:   Number(pendingAdReqs.count),
    approvedAdRequests:  Number(approvedAdReqs.count),
    newRequests:         Number(newReqs.count),
    completedRequests:   Number(completedReqs.count),
    recentRequests,
    recentTechs,
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

router.patch("/technician-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, createCategory, linkCategoryId } = req.body;
  const [app] = await db
    .update(technicianApplicationsTable)
    .set({ status })
    .where(eq(technicianApplicationsTable.id, raw))
    .returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  let resolvedCategoryId: string | null = linkCategoryId || null;

  if (status === "approved" && app.customSpecialty && createCategory === true) {
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

  res.json({ ...app, resolvedCategoryId });
});

router.delete("/technician-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, raw));
  res.sendStatus(204);
});

// ── Companies (approved only) ─────────────────────────────────────────────────
router.get("/companies", async (_req, res): Promise<void> => {
  const companies = await db
    .select()
    .from(companyApplicationsTable)
    .where(eq(companyApplicationsTable.status, "approved"))
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
  if (b.specialty     !== undefined) updates.specialty     = b.specialty;
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
  const { status, createCategory, linkCategoryId } = req.body;

  let resolvedCategoryId: string | null = linkCategoryId || null;
  const updates: Record<string, unknown> = { status };

  if (status === "approved") {
    if (createCategory === true) {
      const [existingApp] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw));
      if (existingApp?.customSpecialty) {
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
    }
    if (resolvedCategoryId) {
      updates.specialty = resolvedCategoryId;
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

export default router;
