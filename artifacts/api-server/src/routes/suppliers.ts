import { Router, type IRouter } from "express";
import { autoExtractTagsInBackground } from "../lib/aiTags";
import { db } from "@workspace/db";
import { supplierApplicationsTable, citiesTable, reviewsTable } from "@workspace/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";

const router: IRouter = Router();

// ── Public: Submit supplier application ──────────────────────────────────────
router.post("/supplier-applications", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.business_name || !body.contact_name || !body.phone || !body.whatsapp || !body.city || !body.supply_type) {
    res.status(400).json({ error: "بيانات ناقصة" }); return;
  }

  const year = new Date().getFullYear();
  const num  = String(Math.floor(100000 + Math.random() * 900000));
  const requestNumber = `SUP-${year}-${num}`;
  const id = "sup" + Date.now() + Math.random().toString(36).slice(2, 5);

  const [app] = await db.insert(supplierApplicationsTable).values({
    id,
    businessName:     body.business_name,
    contactName:      body.contact_name,
    phone:            body.phone,
    whatsapp:         body.whatsapp,
    city:             body.city,
    supplyType:       body.supply_type,
    customSupplyType: body.custom_supply_type || null,
    area:             body.area || null,
    address:          body.address || null,
    lat:              body.lat ?? null,
    lng:              body.lng ?? null,
    description:      body.description || null,
    logo:             body.logo || null,
    shopImages:       body.shop_images || [],
    email:            body.email || null,
    facebook:         body.facebook || null,
    instagram:        body.instagram || null,
    tiktok:           body.tiktok || null,
    referredBy:       body.referred_by || null,
    status:           "pending",
    requestNumber,
  }).returning();

  res.status(201).json(app);
});

// ── Public: Published suppliers directory ────────────────────────────────────
router.get("/suppliers", async (req, res): Promise<void> => {
  const cityParam = String(req.query.city ?? "").trim();

  let cityNames: string[] = [];
  if (cityParam && cityParam !== 'libya') {
    const [cityRow] = await db.select().from(citiesTable).where(eq(citiesTable.id, cityParam));
    if (cityRow) {
      cityNames = [cityRow.nameAr, cityRow.nameEn, cityRow.id].filter(Boolean) as string[];
    } else {
      cityNames = [cityParam];
    }
  }

  const whereClause = cityNames.length > 0
    ? and(
        eq(supplierApplicationsTable.status, "published"),
        or(...cityNames.map(n => ilike(supplierApplicationsTable.city, n)))
      )
    : eq(supplierApplicationsTable.status, "published");

  const rows = await db
    .select()
    .from(supplierApplicationsTable)
    .where(whereClause)
    .orderBy(desc(supplierApplicationsTable.createdAt));
  res.json(rows);
});

// ── Public: Single supplier by ID ────────────────────────────────────────────
router.get("/suppliers/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [supplier] = await db
    .select()
    .from(supplierApplicationsTable)
    .where(and(eq(supplierApplicationsTable.id, id), eq(supplierApplicationsTable.status, "published")));
  if (!supplier) { res.status(404).json({ error: "Not found" }); return; }
  res.json(supplier);
});

// ── Public: Track by request number ─────────────────────────────────────────
router.get("/supplier-applications/track/:requestNumber", async (req, res): Promise<void> => {
  const rn = Array.isArray(req.params.requestNumber) ? req.params.requestNumber[0] : req.params.requestNumber;
  const [app] = await db
    .select()
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.requestNumber, rn));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

// ── Public: Supplier reviews ──────────────────────────────────────────────────
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
    res.status(400).json({ error: "reviewer_name and rating (1-5) are required" }); return;
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

// ── Admin: List all published suppliers (directory) ──────────────────────────
router.get("/admin/suppliers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.status, "published"))
    .orderBy(desc(supplierApplicationsTable.createdAt));
  res.json(rows);
});

// ── Admin: Create supplier directly ──────────────────────────────────────────
router.post("/admin/suppliers", async (req, res): Promise<void> => {
  const b = req.body;
  if (!b.business_name || !b.phone) {
    res.status(400).json({ error: "business_name and phone are required" }); return;
  }
  const [row] = await db.insert(supplierApplicationsTable).values({
    businessName:    b.business_name,
    contactName:     b.contact_name    || '',
    phone:           b.phone,
    whatsapp:        b.whatsapp        || b.phone,
    city:            b.city            || '',
    area:            b.area            || '',
    address:         b.address         || '',
    supplyType:      b.supply_type     || '',
    customSupplyType:b.custom_supply_type || '',
    description:     b.description     || '',
    logo:            b.logo            || '',
    shopImages:      b.shop_images     || [],
    facebook:        b.facebook        || '',
    instagram:       b.instagram       || '',
    tiktok:          b.tiktok          || '',
    status:          'published',
  }).returning();
  autoExtractTagsInBackground(row.id, "supplier");
  res.status(201).json(row);
});

// ── Admin: Update published supplier data ─────────────────────────────────────
router.patch("/admin/suppliers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body;
  const updates: Record<string, unknown> = {};
  if (body.business_name  !== undefined) updates.businessName     = body.business_name;
  if (body.contact_name   !== undefined) updates.contactName      = body.contact_name;
  if (body.phone          !== undefined) updates.phone            = body.phone;
  if (body.whatsapp       !== undefined) updates.whatsapp         = body.whatsapp;
  if (body.city           !== undefined) updates.city             = body.city;
  if (body.area           !== undefined) updates.area             = body.area;
  if (body.address        !== undefined) updates.address          = body.address;
  if (body.supply_type    !== undefined) updates.supplyType       = body.supply_type;
  if (body.description    !== undefined) updates.description      = body.description;
  if (body.logo           !== undefined) updates.logo             = body.logo;
  if (body.facebook       !== undefined) updates.facebook         = body.facebook;
  if (body.instagram      !== undefined) updates.instagram        = body.instagram;
  if (body.tiktok         !== undefined) updates.tiktok           = body.tiktok;
  if (body.status         !== undefined) updates.status           = body.status;
  if (body.shop_images    !== undefined) updates.shopImages       = body.shop_images;
  if (body.custom_supply_type !== undefined) updates.customSupplyType = body.custom_supply_type;
  const [row] = await db.update(supplierApplicationsTable).set(updates).where(eq(supplierApplicationsTable.id, raw)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  if (body.description !== undefined) {
    autoExtractTagsInBackground(raw, "supplier");
  }
  res.json(row);
});

// ── Admin: Delete published supplier ─────────────────────────────────────────
router.delete("/admin/suppliers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, raw));
  res.sendStatus(204);
});

// ── Admin: List all supplier applications ────────────────────────────────────
router.get("/admin/supplier-applications", async (_req, res): Promise<void> => {
  const apps = await db
    .select()
    .from(supplierApplicationsTable)
    .orderBy(desc(supplierApplicationsTable.createdAt));
  res.json(apps);
});

// ── Admin: Update status / rejection reason ──────────────────────────────────
router.patch("/admin/supplier-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, rejectionReason } = req.body;

  const updates: Record<string, unknown> = { status };
  if (status === "rejected" && rejectionReason) updates.rejectionReason = rejectionReason;
  if (status !== "rejected") updates.rejectionReason = null;

  const [app] = await db
    .update(supplierApplicationsTable)
    .set(updates)
    .where(eq(supplierApplicationsTable.id, raw))
    .returning();

  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  if (status === "published" || status === "approved") {
    autoExtractTagsInBackground(raw, "supplier");
  }

  res.json(app);
});

// ── Admin: Delete supplier application ───────────────────────────────────────
router.delete("/admin/supplier-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, raw));
  res.sendStatus(204);
});

export default router;
