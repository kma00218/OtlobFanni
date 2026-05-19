import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { supplierApplicationsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

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
router.get("/suppliers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(supplierApplicationsTable)
    .where(eq(supplierApplicationsTable.status, "published"))
    .orderBy(desc(supplierApplicationsTable.createdAt));
  res.json(rows);
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
  res.json(app);
});

// ── Admin: Delete supplier application ───────────────────────────────────────
router.delete("/admin/supplier-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, raw));
  res.sendStatus(204);
});

export default router;
