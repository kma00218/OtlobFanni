import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { analyticsEventsTable, techniciansTable, companyApplicationsTable, supplierApplicationsTable, serviceRequestsTable, dealsTable, reviewsTable } from "@workspace/db/schema";
import { eq, sql, desc, count, inArray, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// ── Track event (fire-and-forget, always 204) ─────────────────────────────────
router.post("/analytics", async (req, res): Promise<void> => {
  res.sendStatus(204);
  try {
    const { event, path, ref, sessionId, device } = req.body || {};
    if (!event || typeof event !== "string") return;
    await db.insert(analyticsEventsTable).values({
      id: randomUUID(),
      event: event.slice(0, 64),
      path: path ? String(path).slice(0, 256) : null,
      ref: ref ? String(ref).slice(0, 256) : null,
      sessionId: sessionId ? String(sessionId).slice(0, 64) : null,
      device: device ? String(device).slice(0, 16) : null,
    });
  } catch (_) {}
});

// ── Admin analytics summary ───────────────────────────────────────────────────
router.get("/admin/analytics", async (_req, res): Promise<void> => {
  try {
    const now = new Date();
    const d7  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total visits
    const [totalVisits7]  = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d7}`);
    const [totalVisits30] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d30}`);
    const [totalVisitsAll] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event, 'page_view'));

    // Unique sessions (unique visitor approximation)
    const sessions7 = await db.selectDistinct({ s: analyticsEventsTable.sessionId }).from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d7} AND ${analyticsEventsTable.sessionId} IS NOT NULL`);
    const sessions30 = await db.selectDistinct({ s: analyticsEventsTable.sessionId }).from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.sessionId} IS NOT NULL`);

    // Installs & shares
    const [installs] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event, 'install'));
    const [shares]   = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event, 'share'));
    const [phoneCl]  = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event, 'phone_click'));
    const [waCl]     = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(eq(analyticsEventsTable.event, 'whatsapp_click'));

    // Device breakdown (30d)
    const devices = await db
      .select({ device: analyticsEventsTable.device, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.device} IS NOT NULL`)
      .groupBy(analyticsEventsTable.device);

    // Top technician profiles viewed (30d)
    const topTechs = await db
      .select({ ref: analyticsEventsTable.ref, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'profile_view' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
      .groupBy(analyticsEventsTable.ref)
      .orderBy(desc(count()))
      .limit(10);

    // Resolve technician names
    const topTechIds = topTechs.map(t => t.ref).filter(Boolean) as string[];
    const techRows = topTechIds.length > 0
      ? await db.select({ id: techniciansTable.id, nameAr: techniciansTable.nameAr, nameEn: techniciansTable.nameEn })
          .from(techniciansTable)
          .where(inArray(techniciansTable.id, topTechIds))
      : [];
    const techNameMap: Record<string, { nameAr: string; nameEn: string | null }> =
      Object.fromEntries(techRows.map(t => [t.id, { nameAr: t.nameAr, nameEn: t.nameEn }]));

    // Top company profiles viewed (30d)
    const topCompanies = await db
      .select({ ref: analyticsEventsTable.ref, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'company_view' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
      .groupBy(analyticsEventsTable.ref)
      .orderBy(desc(count()))
      .limit(10);

    // Resolve company names
    const topCompanyIds = topCompanies.map(c => c.ref).filter(Boolean) as string[];
    const companyRows = topCompanyIds.length > 0
      ? await db.select({ id: companyApplicationsTable.id, companyName: companyApplicationsTable.companyName })
          .from(companyApplicationsTable)
          .where(inArray(companyApplicationsTable.id, topCompanyIds))
      : [];
    const companyNameMap: Record<string, string> =
      Object.fromEntries(companyRows.map(c => [c.id, c.companyName]));

    // Top supplier profiles viewed (30d)
    const topSuppliers = await db
      .select({ ref: analyticsEventsTable.ref, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'supplier_view' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
      .groupBy(analyticsEventsTable.ref)
      .orderBy(desc(count()))
      .limit(10);

    // Resolve supplier names (filter out any malformed refs like "[object Object]")
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const topSupplierIds = topSuppliers.map(s => s.ref).filter((r): r is string => !!r && uuidRe.test(r));
    const supplierRows = topSupplierIds.length > 0
      ? await db.select({ id: supplierApplicationsTable.id, businessName: supplierApplicationsTable.businessName })
          .from(supplierApplicationsTable)
          .where(inArray(supplierApplicationsTable.id, topSupplierIds))
      : [];
    const supplierNameMap: Record<string, string> =
      Object.fromEntries(supplierRows.map(s => [s.id, s.businessName]));

    // Top searches (30d)
    const topSearches = await db
      .select({ ref: analyticsEventsTable.ref, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'search' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
      .groupBy(analyticsEventsTable.ref)
      .orderBy(desc(count()))
      .limit(10);

    // Top categories clicked (30d)
    const topCategories = await db
      .select({ ref: analyticsEventsTable.ref, cnt: count() })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'category_click' AND ${analyticsEventsTable.createdAt} >= ${d30} AND ${analyticsEventsTable.ref} IS NOT NULL`)
      .groupBy(analyticsEventsTable.ref)
      .orderBy(desc(count()))
      .limit(10);

    // Daily visits (last 30 days)
    const dailyVisits = await db
      .select({
        day: sql<string>`DATE(${analyticsEventsTable.createdAt})`,
        cnt: count(),
      })
      .from(analyticsEventsTable)
      .where(sql`${analyticsEventsTable.event} = 'page_view' AND ${analyticsEventsTable.createdAt} >= ${d30}`)
      .groupBy(sql`DATE(${analyticsEventsTable.createdAt})`)
      .orderBy(sql`DATE(${analyticsEventsTable.createdAt})`);

    res.json({
      visits: {
        total: Number(totalVisitsAll.count),
        last7d: Number(totalVisits7.count),
        last30d: Number(totalVisits30.count),
      },
      uniqueVisitors: {
        last7d: sessions7.length,
        last30d: sessions30.length,
      },
      installs: Number(installs.count),
      shares:   Number(shares.count),
      phoneClicks: Number(phoneCl.count),
      whatsappClicks: Number(waCl.count),
      devices: devices.map(d => ({ device: d.device, count: Number(d.cnt) })),
      topTechs: topTechs.map(t => ({ id: t.ref, name: techNameMap[t.ref!]?.nameAr || null, count: Number(t.cnt) })),
      topCompanies: topCompanies.map(c => ({ id: c.ref, name: companyNameMap[c.ref!] || null, count: Number(c.cnt) })),
      topSuppliers: topSuppliers.filter(s => s.ref && uuidRe.test(s.ref)).map(s => ({ id: s.ref, name: supplierNameMap[s.ref!] || null, count: Number(s.cnt) })),
      topSearches: topSearches.map(s => ({ query: s.ref, count: Number(s.cnt) })),
      topCategories: topCategories.map(c => ({ id: c.ref, count: Number(c.cnt) })),
      dailyVisits: dailyVisits.map(d => ({ day: d.day, count: Number(d.cnt) })),
    });
  } catch (err) {
    res.status(500).json({ error: "analytics error" });
  }
});

// ── Pro performance stats ─────────────────────────────────────────────────────
router.get("/pro/my-stats", async (req, res): Promise<void> => {
  try {
    const { entityType, entityId } = req.query as { entityType?: string; entityId?: string };
    if (!entityType || !entityId) {
      res.status(400).json({ error: "entityType and entityId required" }); return;
    }

    const viewEvent = entityType === 'technician' ? 'profile_view'
      : entityType === 'company' ? 'company_view'
      : 'supplier_view';

    const [profileViews] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.event, viewEvent), eq(analyticsEventsTable.ref, entityId)));

    const [waClicks] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.event, 'whatsapp_click'), eq(analyticsEventsTable.ref, entityId)));

    const [phoneClicks] = await db.select({ count: count() }).from(analyticsEventsTable)
      .where(and(eq(analyticsEventsTable.event, 'phone_click'), eq(analyticsEventsTable.ref, entityId)));

    const [serviceReqs] = await db.select({ count: count() }).from(serviceRequestsTable)
      .where(and(eq(serviceRequestsTable.ownerType, entityType), eq(serviceRequestsTable.ownerId, entityId)));

    const [confirmedDeals] = await db.select({ count: count() }).from(dealsTable)
      .where(and(eq(dealsTable.proType, entityType), eq(dealsTable.proId, entityId), eq(dealsTable.status, 'confirmed')));

    let avgRating: number | null = null;
    try {
      const ratingWhere = entityType === 'technician'
        ? eq(reviewsTable.technicianId, entityId)
        : entityType === 'company'
          ? eq(reviewsTable.companyId, entityId)
          : eq(reviewsTable.supplierId, entityId);
      const ratings = await db.select({ rating: reviewsTable.rating }).from(reviewsTable).where(ratingWhere);
      if (ratings.length > 0) {
        avgRating = Math.round(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length * 10) / 10;
      }
    } catch (_) {}

    res.json({
      profileViews:   Number(profileViews.count),
      whatsappClicks: Number(waClicks.count),
      phoneClicks:    Number(phoneClicks.count),
      serviceRequests: Number(serviceReqs.count),
      confirmedDeals: Number(confirmedDeals.count),
      avgRating,
    });
  } catch (err) {
    res.status(500).json({ error: "stats error" });
  }
});

export default router;
