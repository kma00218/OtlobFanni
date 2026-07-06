import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { autoExtractTagsInBackground } from "../lib/aiTags";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable, adsTable,
  adRequestsTable, technicianApplicationsTable, companyApplicationsTable,
  adminsTable, serviceRequestsTable, supplierApplicationsTable, updateReportsTable,
  proCredentialsTable, referralsTable, profileUpdateRequestsTable, dealsTable,
  ambassadorsTable, generalRequestsTable, generalOffersTable,
} from "@workspace/db/schema";
import crypto from "crypto";
import { eq, ne, desc, count, and, or, ilike, sql, inArray } from "drizzle-orm";
import { objectStorageClient, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

async function deleteEntityFiles(paths: Array<string | null | undefined>): Promise<void> {
  await Promise.all(paths.map((p) => objectStorageService.deleteObjectEntity(p).catch(() => {})));
}

// Hard safety gate for any bulk storage-orphan detection/cleanup code path.
// `db` always points at whatever DATABASE_URL this server process was started
// with, but the object storage bucket is SHARED between the dev workspace and
// production. Running orphan-detection from a dev-workspace process (dev DB,
// nearly empty) against that shared bucket makes real production files look
// unreferenced — this is exactly what caused the 2026-07-06 data-loss incident.
// Refusing to run unless NODE_ENV === "production" guarantees `db` is the
// production database whenever this logic executes, so orphan detection can
// never be computed against the wrong database.
function assertProductionDatabaseContext(): void {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      "Refusing to run storage-orphan detection/cleanup outside the production " +
        "environment. This server process is not running with NODE_ENV=production, " +
        "so its database connection may not be the production database while the " +
        "storage bucket it would act on is shared with production. Run this only " +
        "against the deployed production server.",
    );
  }
}

// ── Storage endpoint hard security gates (permanent, 2026-07-06) ────────────
// Every storage audit/cleanup/delete endpoint below requires BOTH:
//  1. A valid `X-Admin-Storage-Token` header matching the ADMIN_STORAGE_TOKEN
//     secret — no public/anonymous caller can reach these routes at all.
//  2. For the two endpoints that can actually delete objects, the
//     ENABLE_STORAGE_DELETE env var must literally equal "true". Any other
//     value (unset, "false", empty) fails the request immediately, before
//     any other logic runs. This is a manual, explicit opt-in switch that
//     must be flipped on and back off around each approved cleanup.
function requireAdminStorageAuth(req: Request, res: Response, next: NextFunction): void {
  const configuredToken = process.env.ADMIN_STORAGE_TOKEN;
  if (!configuredToken) {
    res.status(503).json({ error: "Storage admin endpoints are not configured (ADMIN_STORAGE_TOKEN is not set)." });
    return;
  }
  const provided = req.header("x-admin-storage-token");
  if (!provided || provided !== configuredToken) {
    res.status(401).json({ error: "Unauthorized: missing or invalid X-Admin-Storage-Token header." });
    return;
  }
  next();
}

function assertStorageDeleteEnabled(): void {
  if (process.env.ENABLE_STORAGE_DELETE !== "true") {
    throw new Error(
      "Storage deletion is disabled (ENABLE_STORAGE_DELETE is not \"true\"). " +
        "Set ENABLE_STORAGE_DELETE=true explicitly to permit this request, then " +
        "set it back to \"false\" once the approved cleanup is complete.",
    );
  }
}

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
  const [newReqs]            = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.isRead, false));
  const [completedReqs]      = await db.select({ count: count() }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "completed"));
  const todayStart           = new Date(); todayStart.setHours(0, 0, 0, 0);
  const [todayReqs]          = await db.select({ count: count() }).from(serviceRequestsTable).where(sql`${serviceRequestsTable.createdAt} >= ${todayStart}`);
  const [totalReqs]          = await db.select({ count: count() }).from(serviceRequestsTable);
  const [pendingSupplierApps]  = await db.select({ count: count() }).from(supplierApplicationsTable).where(eq(supplierApplicationsTable.status, "pending"));
  const [totalSupplierApps]    = await db.select({ count: count() }).from(supplierApplicationsTable);
  const [publishedSuppliers]   = await db.select({ count: count() }).from(supplierApplicationsTable).where(eq(supplierApplicationsTable.status, "published"));
  const [activeSupplierApps]   = await db.select({ count: count() }).from(supplierApplicationsTable).where(ne(supplierApplicationsTable.status, "published"));
  const [pendingUpdateRpts]    = await db.select({ count: count() }).from(updateReportsTable).where(eq(updateReportsTable.status, "new"));
  const [pendingReferrals]     = await db.select({ count: count() }).from(referralsTable).where(eq(referralsTable.status, "new"));
  const [pendingProfileUpds]   = await db.select({ count: count() }).from(profileUpdateRequestsTable).where(eq(profileUpdateRequestsTable.status, "pending"));
  const [openGeneralReqs]      = await db.select({ count: count() }).from(generalRequestsTable).where(eq(generalRequestsTable.status, "open"));
  const [totalGeneralReqs]     = await db.select({ count: count() }).from(generalRequestsTable);

  const recentRequests = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt)).limit(10);
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
    todayRequests:        Number(todayReqs.count),
    totalRequests:        Number(totalReqs.count),
    completedRequests:    Number(completedReqs.count),
    pendingSupplierApps:  Number(pendingSupplierApps.count),
    totalSupplierApps:    Number(totalSupplierApps.count),
    activeSupplierApps:   Number(activeSupplierApps.count),
    totalSuppliers:       Number(publishedSuppliers.count),
    pendingUpdateReports:   Number(pendingUpdateRpts.count),
    pendingReferrals:       Number(pendingReferrals.count),
    pendingProfileUpdates:  Number(pendingProfileUpds.count),
    openGeneralRequests:    Number(openGeneralReqs.count),
    totalGeneralRequests:   Number(totalGeneralReqs.count),
    recentRequests,
    recentTechs,
    recentCompanies,
  });
});

// ── Storage Usage ─────────────────────────────────────────────────────────────
// NOTE (2026-07-06): Temporary incident-response endpoints (storage-soft-deleted,
// storage-objects/restore-batch, storage-bucket-metadata) used to recover 1,264
// production images wrongly deleted by a buggy auto-cleanup job have been removed
// now that the restore is complete and verified. They were unauthenticated and
// destructive/sensitive enough that they should not remain in the codebase
// long-term. Recreate them from git history only if a similar recovery is needed.
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

// ── Storage Orphan Audit / Cleanup ────────────────────────────────────────────
async function findOrphanedObjects(): Promise<{ path: string; size: number; createdAt: string | null }[]> {
  assertProductionDatabaseContext();
  const referenced = new Set<string>();
  const addPath = (p: unknown) => {
    if (typeof p === "string") {
      const m = p.match(/\/objects\/(.+)$/);
      if (m) referenced.add(m[1]);
    }
  };
  const addPaths = (arr: unknown) => {
    if (Array.isArray(arr)) for (const p of arr) addPath(p);
  };

  const [
    techs, techApps, companies, ads, adRequests, suppliers,
    serviceReqs, generalReqs, generalOffers, updateReports,
  ] = await Promise.all([
    db.select({ id: techniciansTable.id, profilePhoto: techniciansTable.profilePhoto, workImages: techniciansTable.workImages }).from(techniciansTable),
    db.select({ id: technicianApplicationsTable.id, profilePhoto: technicianApplicationsTable.profilePhoto, workImages: technicianApplicationsTable.workImages }).from(technicianApplicationsTable),
    db.select({ id: companyApplicationsTable.id, companyLogo: companyApplicationsTable.companyLogo, workImages: companyApplicationsTable.workImages }).from(companyApplicationsTable),
    db.select({ id: adsTable.id, imageUrl: adsTable.imageUrl }).from(adsTable),
    db.select({ id: adRequestsTable.id, imagePreview: adRequestsTable.imagePreview }).from(adRequestsTable),
    db.select({ id: supplierApplicationsTable.id, logo: supplierApplicationsTable.logo, shopImages: supplierApplicationsTable.shopImages }).from(supplierApplicationsTable),
    db.select({ id: serviceRequestsTable.id, photoUrls: serviceRequestsTable.photoUrls }).from(serviceRequestsTable),
    db.select({ id: generalRequestsTable.id, photoUrls: generalRequestsTable.photoUrls }).from(generalRequestsTable),
    db.select({ id: generalOffersTable.id, providerPhoto: generalOffersTable.providerPhoto }).from(generalOffersTable),
    db.select({ id: updateReportsTable.id, photos: updateReportsTable.photos, profilePhoto: updateReportsTable.profilePhoto, workPhotos: updateReportsTable.workPhotos }).from(updateReportsTable),
  ]);

  for (const r of techs) { addPath(r.profilePhoto); addPaths(r.workImages); }
  for (const r of techApps) { addPath(r.profilePhoto); addPaths(r.workImages); }
  for (const r of companies) { addPath(r.companyLogo); addPaths(r.workImages); }
  for (const r of ads) addPath(r.imageUrl);
  for (const r of adRequests) addPath(r.imagePreview);
  for (const r of suppliers) { addPath(r.logo); addPaths(r.shopImages); }
  for (const r of serviceReqs) addPaths(r.photoUrls);
  for (const r of generalReqs) addPaths(r.photoUrls);
  for (const r of generalOffers) addPath(r.providerPhoto);
  for (const r of updateReports) { addPaths(r.photos); addPath(r.profilePhoto); addPaths(r.workPhotos); }

  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) return [];
  const privateDir = (process.env.PRIVATE_OBJECT_DIR || "").split("/").slice(2).join("/");
  const bucket = objectStorageClient.bucket(bucketId);
  const [files] = await bucket.getFiles({ prefix: privateDir ? `${privateDir}/uploads/` : "uploads/" });

  const orphans: { path: string; size: number; createdAt: string | null; reason: string }[] = [];
  for (const file of files) {
    const entityId = file.name.split("/uploads/")[1];
    if (!entityId) continue;
    if (!referenced.has(`uploads/${entityId}`)) {
      orphans.push({
        path: file.name,
        size: Number(file.metadata?.size ?? 0),
        createdAt: (file.metadata?.timeCreated as string) ?? null,
        reason: "Not referenced by any image/photo/logo column in technicians, technician_applications, company_applications, ads, ad_requests, supplier_applications, service_requests, general_requests, general_offers, or update_reports",
      });
    }
  }
  return orphans;
}

// NOTE (2026-07-06): The previous `cleanupStaleOrphans()` auto-delete function
// (scheduled to run unattended on server startup) was permanently removed —
// not just disabled — after it caused a production data-loss incident. Do not
// recreate any automatic/scheduled/unattended deletion path. All cleanup must
// go through the manual dry-run → backup → explicit-approval → delete flow
// below, and only ever against the production server (see
// assertProductionDatabaseContext above).

router.get("/storage-raw-files", requireAdminStorageAuth, async (_req, res): Promise<void> => {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) { res.json({ files: [] }); return; }
    const privateDir = (process.env.PRIVATE_OBJECT_DIR || "").split("/").slice(2).join("/");
    const bucket = objectStorageClient.bucket(bucketId);
    const [files] = await bucket.getFiles({ prefix: privateDir ? `${privateDir}/uploads/` : "uploads/" });
    res.json({
      files: files.map((f) => ({
        path: f.name,
        size: Number(f.metadata?.size ?? 0),
        createdAt: (f.metadata?.timeCreated as string) ?? null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/storage-orphans", requireAdminStorageAuth, async (_req, res): Promise<void> => {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    const privateDir = (process.env.PRIVATE_OBJECT_DIR || "").split("/").slice(2).join("/");
    const bucket = bucketId ? objectStorageClient.bucket(bucketId) : null;
    const [allFiles] = bucket ? await bucket.getFiles({ prefix: privateDir ? `${privateDir}/uploads/` : "uploads/" }) : [[]];
    const orphans = await findOrphanedObjects();
    const totalFiles = allFiles.length;
    const orphanedCount = orphans.length;
    const linkedCount = totalFiles - orphanedCount;
    const totalOrphanBytes = orphans.reduce((sum, o) => sum + o.size, 0);
    res.json({
      totalFiles,
      linkedCount,
      orphanedCount,
      totalOrphanBytes,
      sample: orphans.slice(0, 50).map((o) => ({
        path: o.path,
        size: o.size,
        createdAt: o.createdAt,
        reason: o.reason,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/storage-orphans/backup", requireAdminStorageAuth, async (_req, res): Promise<void> => {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) { res.status(400).json({ error: "Storage not configured" }); return; }
    const orphans = await findOrphanedObjects();
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `orphaned-files-backup-list-${date}.json`;
    const backupPayload = orphans.map((o) => ({
      filePath: o.path,
      bucketName: bucketId,
      fileSizeBytes: o.size,
      createdAt: o.createdAt,
      reason: o.reason,
    }));
    const fs = await import("fs/promises");
    const path = await import("path");
    const backupDir = path.join(process.cwd(), "storage-backups");
    await fs.mkdir(backupDir, { recursive: true });
    const filePath = path.join(backupDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(backupPayload, null, 2), "utf-8");
    res.json({ fileName, filePath, count: backupPayload.length, totalBytes: backupPayload.reduce((s, o) => s + o.fileSizeBytes, 0) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/storage-orphans/cleanup", requireAdminStorageAuth, async (req, res): Promise<void> => {
  try {
    assertStorageDeleteEnabled();
    assertProductionDatabaseContext();
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) { res.status(400).json({ error: "Storage not configured" }); return; }
    if (req.body?.confirm !== true) {
      res.status(400).json({ error: "Missing explicit confirmation. Pass { confirm: true } after reviewing the dry-run report and backup." });
      return;
    }
    const backupFileName: unknown = req.body?.backupFileName;
    if (typeof backupFileName !== "string" || !backupFileName.trim()) {
      res.status(400).json({
        error: "Missing backupFileName. Call POST /storage-orphans/backup first, review the dry-run report, " +
          "get explicit human approval, then pass the returned fileName here as backupFileName to confirm a backup exists.",
      });
      return;
    }
    const fs = await import("fs/promises");
    const path = await import("path");
    const backupPath = path.join(process.cwd(), "storage-backups", path.basename(backupFileName));
    try {
      await fs.access(backupPath);
    } catch {
      res.status(400).json({ error: `Backup file not found at ${backupPath}. Create it via POST /storage-orphans/backup before cleaning up.` });
      return;
    }
    const orphans = await findOrphanedObjects();
    const bucket = objectStorageClient.bucket(bucketId);
    const batchSize = 50;
    let deleted = 0;
    let freedBytes = 0;
    const failed: { path: string; error: string }[] = [];
    const batchLog: { batch: number; deleted: number; errors: number }[] = [];

    for (let i = 0; i < orphans.length; i += batchSize) {
      const batch = orphans.slice(i, i + batchSize);
      let batchDeleted = 0;
      let batchErrors = 0;
      for (const o of batch) {
        try {
          await bucket.file(o.path).delete();
          deleted++;
          batchDeleted++;
          freedBytes += o.size;
        } catch (err) {
          batchErrors++;
          failed.push({ path: o.path, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }
      batchLog.push({ batch: Math.floor(i / batchSize) + 1, deleted: batchDeleted, errors: batchErrors });
    }

    res.json({
      deleted,
      freedBytes,
      remaining: orphans.length - deleted,
      failed,
      batchLog,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// ── Explicit-list batch delete (used for verified, externally-confirmed orphan lists) ──
router.post("/storage-objects/delete-batch", requireAdminStorageAuth, async (req, res): Promise<void> => {
  try {
    assertStorageDeleteEnabled();
    assertProductionDatabaseContext();
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) { res.status(400).json({ error: "Storage not configured" }); return; }
    if (req.body?.confirm !== true) {
      res.status(400).json({ error: "Missing explicit confirmation. Pass { confirm: true }." });
      return;
    }
    const paths: unknown = req.body?.paths;
    if (!Array.isArray(paths) || paths.length === 0) {
      res.status(400).json({ error: "paths must be a non-empty array" });
      return;
    }
    const bucket = objectStorageClient.bucket(bucketId);
    let deleted = 0;
    let freedBytes = 0;
    const failed: { path: string; error: string }[] = [];
    for (const p of paths) {
      if (typeof p !== "string") continue;
      try {
        const [meta] = await bucket.file(p).getMetadata();
        await bucket.file(p).delete();
        deleted++;
        freedBytes += Number(meta?.size ?? 0);
      } catch (err) {
        failed.push({ path: p, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }
    res.json({ deleted, freedBytes, failed });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// ── Existence check (used to verify protected/linked files survive deletion batches) ──
router.post("/storage-objects/verify-exist", requireAdminStorageAuth, async (req, res): Promise<void> => {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucketId) { res.status(400).json({ error: "Storage not configured" }); return; }
    const paths: unknown = req.body?.paths;
    if (!Array.isArray(paths) || paths.length === 0) {
      res.status(400).json({ error: "paths must be a non-empty array" });
      return;
    }
    const bucket = objectStorageClient.bucket(bucketId);
    const missing: string[] = [];
    for (const p of paths) {
      if (typeof p !== "string") continue;
      const [exists] = await bucket.file(p).exists();
      if (!exists) missing.push(p);
    }
    res.json({ checked: paths.length, missing, allPresent: missing.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
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
  const { status, createCategory, createInSectionId, linkCategoryId, rejectionReason } = req.body;
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
    const targetSection = createInSectionId || "more_services";
    const allCats = await db.select().from(categoriesTable);
    const existing = allCats.find(c => c.nameAr === customName || c.nameEn === customName);
    if (!existing) {
      const catId = "custom_" + Date.now();
      await db.insert(categoriesTable).values({
        id: catId, nameAr: customName, nameEn: customName,
        iconName: "more", sectionId: targetSection, sortOrder: 99, isActive: true,
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
          referralSource: app.referredByType ?? null,
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
        referralSource: app.referredByType ?? null,
      }).onConflictDoNothing();
    }
  }

  res.json({ ...app, resolvedCategoryId });
});

router.put("/technician-applications/:id/fields", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const b = req.body;
  const updates: Record<string, unknown> = {};
  if (b.full_name    !== undefined) updates.fullName    = b.full_name;
  if (b.phone        !== undefined) updates.phone       = b.phone;
  if (b.whatsapp     !== undefined) updates.whatsapp    = b.whatsapp;
  if (b.city         !== undefined) updates.city        = b.city;
  if (b.area         !== undefined) updates.area        = b.area;
  if (b.specialty    !== undefined) updates.specialty   = b.specialty;
  if (b.description  !== undefined) updates.description = b.description;
  if (b.price_from   !== undefined) updates.priceFrom   = parseFloat(b.price_from)  || 0;
  if (b.price_to     !== undefined) updates.priceTo     = parseFloat(b.price_to)    || 0;
  if (b.facebook      !== undefined) updates.facebook     = b.facebook;
  if (b.instagram     !== undefined) updates.instagram    = b.instagram;
  if (b.profile_photo !== undefined) updates.profilePhoto = b.profile_photo;
  if (!Object.keys(updates).length) { res.status(400).json({ error: "No fields to update" }); return; }
  const [app] = await db.update(technicianApplicationsTable).set(updates).where(eq(technicianApplicationsTable.id, raw)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.delete("/technician-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db.delete(technicianApplicationsTable).where(eq(technicianApplicationsTable.id, raw)).returning();
  if (row) await deleteEntityFiles([row.profilePhoto, ...(row.workImages || [])]);
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
  const { status, createCategory, createInSectionId, linkCategoryId, rejectionReason } = req.body;

  let resolvedCategoryId: string | null = linkCategoryId || null;
  const updates: Record<string, unknown> = { status };
  if (status === "rejected" && rejectionReason) updates.rejectionReason = rejectionReason;
  if (status !== "rejected") updates.rejectionReason = null;

  if (status === "approved") {
    const [existingApp] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw));
    if (createCategory === true && existingApp?.customSpecialty) {
      const customName = existingApp.customSpecialty.trim();
      const targetSection = createInSectionId || "more_services";
      const allCats = await db.select().from(categoriesTable);
      const existingCat = allCats.find(c => c.nameAr === customName || c.nameEn === customName);
      if (!existingCat) {
        const catId = "custom_" + Date.now();
        await db.insert(categoriesTable).values({
          id: catId, nameAr: customName, nameEn: customName,
          iconName: "more", sectionId: targetSection, sortOrder: 99, isActive: true,
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

  if (status === "approved" || status === "published") {
    autoExtractTagsInBackground(raw, "company");
  }

  res.json({ ...app, resolvedCategoryId });
});

router.put("/company-applications/:id/fields", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const b = req.body;
  const updates: Record<string, unknown> = {};
  if (b.company_name  !== undefined) updates.companyName   = b.company_name;
  if (b.contact_name  !== undefined) updates.contactName   = b.contact_name;
  if (b.phone         !== undefined) updates.phone         = b.phone;
  if (b.whatsapp      !== undefined) updates.whatsapp      = b.whatsapp;
  if (b.city          !== undefined) updates.city          = b.city;
  if (b.area          !== undefined) updates.area          = b.area;
  if (b.specialty     !== undefined) updates.specialty     = b.specialty;
  if (b.description   !== undefined) updates.description   = b.description;
  if (b.price_from    !== undefined) updates.priceFrom     = parseFloat(b.price_from) || 0;
  if (b.price_to      !== undefined) updates.priceTo       = parseFloat(b.price_to)   || 0;
  if (b.facebook      !== undefined) updates.facebook      = b.facebook;
  if (b.instagram     !== undefined) updates.instagram     = b.instagram;
  if (b.company_logo  !== undefined) updates.companyLogo   = b.company_logo;
  if (!Object.keys(updates).length) { res.status(400).json({ error: "No fields to update" }); return; }
  const [app] = await db.update(companyApplicationsTable).set(updates).where(eq(companyApplicationsTable.id, raw)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.delete("/company-applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db.delete(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw)).returning();
  if (row) await deleteEntityFiles([row.companyLogo, ...(row.workImages || [])]);
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
  const [row] = await db.delete(companyApplicationsTable).where(eq(companyApplicationsTable.id, raw)).returning();
  if (row) await deleteEntityFiles([row.companyLogo, ...(row.workImages || [])]);
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

  if (body.is_approved === true) {
    autoExtractTagsInBackground(raw, "technician");
  }

  res.json(tech);
});

router.delete("/technicians/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db.delete(techniciansTable).where(eq(techniciansTable.id, raw)).returning();
  if (row) await deleteEntityFiles([row.profilePhoto, ...(row.workImages || [])]);
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
  const [row] = await db.delete(adsTable).where(eq(adsTable.id, raw)).returning();
  if (row) await deleteEntityFiles([row.imageUrl]);
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

router.patch("/ad-requests/:id/fields", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { phone, whatsapp, contactName, specialCode } = req.body;
  const updates: Record<string, string | null> = {};
  if (phone       !== undefined) updates.phone       = phone;
  if (whatsapp    !== undefined) updates.whatsapp    = whatsapp;
  if (contactName !== undefined) updates.contactName = contactName;
  if (specialCode !== undefined) updates.specialCode = specialCode;
  const [r] = await db.update(adRequestsTable).set(updates).where(eq(adRequestsTable.id, raw)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

router.delete("/ad-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(adRequestsTable).where(eq(adRequestsTable.id, raw));
  res.sendStatus(204);
});

router.delete("/service-requests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [row] = await db.delete(serviceRequestsTable).where(eq(serviceRequestsTable.id, raw)).returning();
  if (row) await deleteEntityFiles(row.photoUrls || []);
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
    id, entityType, entityId, whatsapp, displayName, passwordHash, passwordPlain: password,
  }).onConflictDoUpdate({
    target: proCredentialsTable.entityId,
    set: { whatsapp, displayName, passwordHash, passwordPlain: password, updatedAt: new Date() },
  });

  res.json({ password, whatsapp, displayName });
});

// ── Pro Credentials Bulk (Admin) ──────────────────────────────────────────────
router.post("/pro-credentials/bulk", async (_req, res): Promise<void> => {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function genPassword() {
    const bytes = crypto.randomBytes(6);
    let p = "";
    for (let i = 0; i < 6; i++) p += CHARS[bytes[i] % CHARS.length];
    return p;
  }

  const [technicians, companies, suppliers, existingCreds] = await Promise.all([
    db.select().from(techniciansTable)
      .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true))),
    db.select().from(companyApplicationsTable)
      .where(or(eq(companyApplicationsTable.status, 'approved'), eq(companyApplicationsTable.status, 'published'))),
    db.select().from(supplierApplicationsTable)
      .where(eq(supplierApplicationsTable.status, 'published')),
    db.select().from(proCredentialsTable),
  ]);

  const credMap = new Map(existingCreds.map(c => [c.entityId, c]));

  const results: {
    entityType: string; entityId: string; displayName: string; whatsapp: string;
    password: string; isNew: boolean; entityCreatedAt: string | null;
    credentialsSentAt: string | null; telegramSentAt: string | null;
  }[] = [];

  const upserts: Promise<unknown>[] = [];

  const process = (entityType: string, entityId: string, displayName: string, whatsapp: string, entityCreatedAt: Date | null) => {
    const existing = credMap.get(entityId);
    let password: string;
    let isNew: boolean;

    if (existing && existing.passwordPlain) {
      password = existing.passwordPlain;
      isNew = false;
    } else {
      password = genPassword();
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
      const id = crypto.randomUUID();
      upserts.push(
        db.insert(proCredentialsTable).values({
          id, entityType, entityId, whatsapp, displayName, passwordHash, passwordPlain: password,
        }).onConflictDoUpdate({
          target: proCredentialsTable.entityId,
          set: { whatsapp, displayName, passwordHash, passwordPlain: password, updatedAt: new Date() },
        })
      );
      isNew = true;
    }

    results.push({
      entityType, entityId, displayName, whatsapp, password, isNew,
      entityCreatedAt: entityCreatedAt ? entityCreatedAt.toISOString() : null,
      credentialsSentAt: existing?.credentialsSentAt ? existing.credentialsSentAt.toISOString() : null,
      telegramSentAt:    existing?.telegramSentAt    ? existing.telegramSentAt.toISOString()    : null,
    });
  };

  for (const t of technicians) {
    process('technician', t.id, t.nameAr || t.nameEn || '', t.whatsapp || t.phone || '', t.createdAt ?? null);
  }
  for (const c of companies) {
    process('company', c.id, c.companyName || '', c.whatsapp || c.phone || '', c.createdAt ?? null);
  }
  for (const s of suppliers) {
    process('supplier', s.id, s.businessName || '', s.whatsapp || s.phone || '', s.createdAt ?? null);
  }

  await Promise.all(upserts);
  res.json(results);
});

// ── Pro Credentials Mark Sent (Admin) ─────────────────────────────────────────
router.patch("/pro-credentials/:entityId/mark-sent", async (req, res): Promise<void> => {
  const { entityId } = req.params;
  const { type } = req.body as { type: 'credentials' | 'telegram' };
  if (!type || !['credentials', 'telegram'].includes(type)) {
    res.status(400).json({ error: "type must be 'credentials' or 'telegram'" }); return;
  }
  const now = new Date();
  const col = type === 'credentials' ? { credentialsSentAt: now } : { telegramSentAt: now };
  await db.update(proCredentialsTable)
    .set(col)
    .where(eq(proCredentialsTable.entityId, entityId));
  res.json({ ok: true, sentAt: now.toISOString() });
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

router.post("/update-reports/:id/apply-photos", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { apply_profile, apply_work } = req.body;

  const [report] = await db.select().from(updateReportsTable).where(eq(updateReportsTable.id, id));
  if (!report) { res.status(404).json({ error: "Report not found" }); return; }

  const { entityType, entityId, profilePhoto, workPhotos } = report as any;

  if (entityType === "technician") {
    const updates: Record<string, unknown> = {};
    if (apply_profile && profilePhoto) updates.profilePhoto = profilePhoto;
    if (apply_work && Array.isArray(workPhotos) && workPhotos.length > 0) {
      const [tech] = await db.select({ workImages: techniciansTable.workImages }).from(techniciansTable).where(eq(techniciansTable.id, entityId));
      const current: string[] = Array.isArray(tech?.workImages) ? (tech.workImages as string[]) : [];
      updates.workImages = [...current, ...workPhotos];
    }
    if (Object.keys(updates).length > 0) {
      await db.update(techniciansTable).set(updates).where(eq(techniciansTable.id, entityId));
    }
  } else if (entityType === "company") {
    const updates: Record<string, unknown> = {};
    if (apply_profile && profilePhoto) updates.companyLogo = profilePhoto;
    if (apply_work && Array.isArray(workPhotos) && workPhotos.length > 0) {
      const [comp] = await db.select({ workImages: companyApplicationsTable.workImages }).from(companyApplicationsTable).where(eq(companyApplicationsTable.id, entityId));
      const current: string[] = Array.isArray(comp?.workImages) ? (comp.workImages as string[]) : [];
      updates.workImages = [...current, ...workPhotos];
    }
    if (Object.keys(updates).length > 0) {
      await db.update(companyApplicationsTable).set(updates).where(eq(companyApplicationsTable.id, entityId));
    }
  } else if (entityType === "supplier") {
    const updates: Record<string, unknown> = {};
    if (apply_profile && profilePhoto) updates.logo = profilePhoto;
    if (apply_work && Array.isArray(workPhotos) && workPhotos.length > 0) {
      const [sup] = await db.select({ shopImages: supplierApplicationsTable.shopImages }).from(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, entityId));
      const current: string[] = Array.isArray(sup?.shopImages) ? (sup.shopImages as string[]) : [];
      updates.shopImages = [...current, ...workPhotos];
    }
    if (Object.keys(updates).length > 0) {
      await db.update(supplierApplicationsTable).set(updates).where(eq(supplierApplicationsTable.id, entityId));
    }
  } else {
    res.status(400).json({ error: "Unknown entity type" }); return;
  }

  res.json({ ok: true });
});

// ── Referrals ─────────────────────────────────────────────────────────────────
router.get("/referrals", async (_req, res): Promise<void> => {
  const rows = await db.select().from(referralsTable).orderBy(desc(referralsTable.createdAt));
  res.json(rows);
});

router.patch("/referrals/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "nothing to update" }); return; }
  await db.update(referralsTable).set(updates).where(eq(referralsTable.id, Number(id)));
  res.json({ ok: true });
});

router.delete("/referrals/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  await db.delete(referralsTable).where(eq(referralsTable.id, Number(id)));
  res.json({ ok: true });
});

// ── Profile Update Requests ───────────────────────────────────────────────────
router.get("/profile-update-requests", async (_req, res): Promise<void> => {
  const rows = await db.select().from(profileUpdateRequestsTable)
    .orderBy(desc(profileUpdateRequestsTable.createdAt));
  res.json(rows);
});

router.patch("/profile-update-requests/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { action, adminNote } = req.body;
  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ error: "action must be 'approve' or 'reject'" }); return;
  }
  const [request] = await db.select().from(profileUpdateRequestsTable)
    .where(eq(profileUpdateRequestsTable.id, id));
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }

  const newStatus = action === "approve" ? "approved" : "rejected";
  await db.update(profileUpdateRequestsTable).set({
    status: newStatus,
    adminNote: adminNote || null,
    reviewedAt: new Date(),
  }).where(eq(profileUpdateRequestsTable.id, id));

  if (action === "approve") {
    const changes = request.changes as Record<string, unknown>;
    if (request.entityType === "technician") {
      const updates: Record<string, unknown> = {};
      if (changes.nameAr           !== undefined) updates.nameAr           = changes.nameAr;
      if (changes.nameEn           !== undefined) updates.nameEn           = changes.nameEn;
      if (changes.descriptionAr    !== undefined) updates.descriptionAr    = changes.descriptionAr;
      if (changes.descriptionEn    !== undefined) updates.descriptionEn    = changes.descriptionEn;
      if (changes.profilePhoto     !== undefined) updates.profilePhoto     = changes.profilePhoto;
      if (changes.workImages       !== undefined) updates.workImages       = changes.workImages;
      if (changes.extraSpecialties !== undefined) updates.extraSpecialties = changes.extraSpecialties;
      if (changes.categoryId       !== undefined) updates.categoryId       = String(changes.categoryId);
      if (Object.keys(updates).length > 0) {
        await db.update(techniciansTable).set(updates as any)
          .where(eq(techniciansTable.id, request.entityId));
      }
    } else if (request.entityType === "company") {
      const updates: Record<string, unknown> = {};
      if (changes.companyName      !== undefined) updates.companyName      = changes.companyName;
      if (changes.description      !== undefined) updates.description      = changes.description;
      if (changes.companyLogo      !== undefined) updates.companyLogo      = changes.companyLogo;
      if (changes.workImages       !== undefined) updates.workImages       = changes.workImages;
      if (changes.specialty        !== undefined) updates.specialty        = String(changes.specialty);
      if (changes.extraSpecialties !== undefined) updates.extraSpecialties = changes.extraSpecialties;
      if (Object.keys(updates).length > 0) {
        await db.update(companyApplicationsTable).set(updates as any)
          .where(eq(companyApplicationsTable.id, request.entityId));
      }
    } else if (request.entityType === "supplier") {
      const updates: Record<string, unknown> = {};
      if (changes.businessName     !== undefined) updates.businessName     = changes.businessName;
      if (changes.description      !== undefined) updates.description      = changes.description;
      if (changes.logo             !== undefined) updates.logo             = changes.logo;
      if (changes.shopImages       !== undefined) updates.shopImages       = changes.shopImages;
      if (changes.supplyType       !== undefined) updates.supplyType       = changes.supplyType;
      if (Object.keys(updates).length > 0) {
        await db.update(supplierApplicationsTable).set(updates as any)
          .where(eq(supplierApplicationsTable.id, request.entityId));
      }
    }
  }

  res.json({ ok: true, status: newStatus });
});

// ── Service Requests (admin) ───────────────────────────────────────────────────
router.get("/service-requests", async (req, res): Promise<void> => {
  const { ownerType, status, city } = req.query as Record<string, string>;
  const conditions = [];
  if (ownerType) conditions.push(eq(serviceRequestsTable.ownerType, ownerType));
  if (status)    conditions.push(eq(serviceRequestsTable.status, status));
  if (city)      conditions.push(ilike(serviceRequestsTable.cityName, `%${city}%`));
  const reqs = conditions.length > 0
    ? await db.select().from(serviceRequestsTable).where(and(...conditions)).orderBy(desc(serviceRequestsTable.createdAt))
    : await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));
  res.json(reqs);
});

router.patch("/service-requests/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'completed', 'cancelled'];
  if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [r] = await db.update(serviceRequestsTable).set({ status }).where(eq(serviceRequestsTable.id, id)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

// ── General Requests & Offers (admin) ────────────────────────────────────────
router.get("/general-requests", async (req, res): Promise<void> => {
  const { status, city, category } = req.query as Record<string, string>;
  const conditions = [];
  if (status)   conditions.push(eq(generalRequestsTable.status, status));
  if (city)     conditions.push(ilike(generalRequestsTable.cityName, `%${city}%`));
  if (category) conditions.push(ilike(generalRequestsTable.categoryName, `%${category}%`));
  const reqs = conditions.length > 0
    ? await db.select().from(generalRequestsTable).where(and(...conditions)).orderBy(desc(generalRequestsTable.createdAt))
    : await db.select().from(generalRequestsTable).orderBy(desc(generalRequestsTable.createdAt));

  if (reqs.length === 0) { res.json([]); return; }

  const requestIds = reqs.map(r => r.id);
  const offers = await db.select().from(generalOffersTable)
    .where(inArray(generalOffersTable.requestId, requestIds))
    .orderBy(desc(generalOffersTable.createdAt));

  const offersByRequest: Record<string, typeof offers> = {};
  for (const o of offers) {
    (offersByRequest[o.requestId] ??= []).push(o);
  }

  res.json(reqs.map(r => ({ ...r, offers: offersByRequest[r.id] || [] })));
});

// ── AI Icon Generation ─────────────────────────────────────────────────────────
router.post("/categories/generate-icon", async (req, res): Promise<void> => {
  try {
    const { nameAr, nameEn } = req.body as { nameAr?: string; nameEn?: string };
    if (!nameAr && !nameEn) { res.status(400).json({ error: "Name required" }); return; }

    const aiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    const aiApiKey  = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    if (!aiBaseUrl || !aiApiKey) { res.status(503).json({ error: "AI not configured" }); return; }

    const label = [nameEn, nameAr].filter(Boolean).join(' / ');
    const prompt = `Simple flat icon for a home services app category called "${label}". Minimal, colorful, clean illustration on a pure white background. No text, no letters. Single centered icon. Professional mobile app style.`;

    const imgRes = await fetch(`${aiBaseUrl}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', output_format: 'b64_json' }),
    });

    if (!imgRes.ok) {
      const err = await imgRes.text();
      res.status(500).json({ error: "Image generation failed", details: err });
      return;
    }

    const imgData = await imgRes.json() as { data: Array<{ b64_json: string }> };
    const b64 = imgData.data?.[0]?.b64_json;
    if (!b64) { res.status(500).json({ error: "No image returned" }); return; }

    const buffer = Buffer.from(b64, 'base64');

    const pathsStr  = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const firstPath = pathsStr.split(',').map(p => p.trim()).filter(Boolean)[0];
    if (!firstPath) { res.status(503).json({ error: "Storage not configured" }); return; }

    const normalized  = firstPath.startsWith('/') ? firstPath : `/${firstPath}`;
    const parts       = normalized.split('/').filter(Boolean);
    const bucketName  = parts[0];
    const prefix      = parts.slice(1).join('/');
    const filename    = `cat_ai_${Date.now()}`;
    const objectName  = prefix ? `${prefix}/category-icons/${filename}.png` : `category-icons/${filename}.png`;

    const bucket = objectStorageClient.bucket(bucketName);
    await bucket.file(objectName).save(buffer, { contentType: 'image/png', resumable: false });

    res.json({ url: `/api/storage/public-objects/category-icons/${filename}.png` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

router.get("/deals", async (req, res): Promise<void> => {
  const { status, proType } = req.query as Record<string, string>;
  const conditions = [];
  if (status)  conditions.push(eq(dealsTable.status, status));
  if (proType) conditions.push(eq(dealsTable.proType, proType));
  const deals = await db.select().from(dealsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(dealsTable.createdAt));
  res.json(deals);
});

router.patch("/deals/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'disputed', 'cancelled'];
  if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [r] = await db.update(dealsTable).set({ status }).where(eq(dealsTable.id, id)).returning();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json(r);
});

// ── Ambassadors ───────────────────────────────────────────────────────────────
router.get("/ambassadors", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ambassadorsTable).orderBy(desc(ambassadorsTable.createdAt));
  res.json(rows);
});

router.post("/ambassadors", async (req, res): Promise<void> => {
  const { name, phone, whatsapp, code, notes } = req.body;
  if (!name || !code) { res.status(400).json({ error: "name and code required" }); return; }
  const id = "amb_" + Date.now() + Math.random().toString(36).slice(2, 5);
  const [row] = await db.insert(ambassadorsTable).values({
    id, name, phone: phone || null, whatsapp: whatsapp || null,
    code: code.toUpperCase(), notes: notes || null,
    isActive: true,
  }).returning();
  res.status(201).json(row);
});

router.patch("/ambassadors/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const b = req.body;
  const updates: Record<string, unknown> = {};
  if (b.name      !== undefined) updates.name      = b.name;
  if (b.phone     !== undefined) updates.phone     = b.phone;
  if (b.whatsapp  !== undefined) updates.whatsapp  = b.whatsapp;
  if (b.code      !== undefined) updates.code      = String(b.code).toUpperCase();
  if (b.notes     !== undefined) updates.notes     = b.notes;
  if (b.isActive  !== undefined) updates.isActive  = b.isActive;
  const [row] = await db.update(ambassadorsTable).set(updates).where(eq(ambassadorsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/ambassadors/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(ambassadorsTable).where(eq(ambassadorsTable.id, id));
  res.sendStatus(204);
});

// ── Affiliate Stats ────────────────────────────────────────────────────────────
router.get("/affiliate-stats", async (_req, res): Promise<void> => {
  const [techApps, compApps, supApps, ambs] = await Promise.all([
    db.select({ referredBy: technicianApplicationsTable.referredBy, name: technicianApplicationsTable.referredByName, type: technicianApplicationsTable.referredByType })
      .from(technicianApplicationsTable).where(sql`${technicianApplicationsTable.referredBy} IS NOT NULL`),
    db.select({ referredBy: companyApplicationsTable.referredBy, name: companyApplicationsTable.referredByName, type: companyApplicationsTable.referredByType })
      .from(companyApplicationsTable).where(sql`${companyApplicationsTable.referredBy} IS NOT NULL`),
    db.select({ referredBy: supplierApplicationsTable.referredBy })
      .from(supplierApplicationsTable).where(sql`${supplierApplicationsTable.referredBy} IS NOT NULL`),
    db.select().from(ambassadorsTable),
  ]);

  const ambMap = new Map(ambs.map(a => [a.code, a]));
  const map: Record<string, { code: string; name: string; type: string; technicians: number; companies: number; suppliers: number }> = {};

  const ensure = (code: string, name: string | null, type: string | null) => {
    if (!code) return;
    if (!map[code]) {
      const amb = ambMap.get(code);
      map[code] = {
        code,
        name: amb ? amb.name : (name || code),
        type: amb ? 'ambassador' : (type || 'unknown'),
        technicians: 0, companies: 0, suppliers: 0,
      };
    }
  };

  techApps.forEach(r => { ensure(r.referredBy!, r.name, r.type); if (map[r.referredBy!]) map[r.referredBy!].technicians++; });
  compApps.forEach(r => { ensure(r.referredBy!, r.name, r.type); if (map[r.referredBy!]) map[r.referredBy!].companies++; });
  supApps.forEach(r => { ensure(r.referredBy!, null, null); if (map[r.referredBy!]) map[r.referredBy!].suppliers++; });

  const referrers = Object.values(map).map(r => ({ ...r, total: r.technicians + r.companies + r.suppliers }));
  const totals = {
    technicians: referrers.reduce((s, r) => s + r.technicians, 0),
    companies:   referrers.reduce((s, r) => s + r.companies, 0),
    suppliers:   referrers.reduce((s, r) => s + r.suppliers, 0),
    total:       referrers.reduce((s, r) => s + r.total, 0),
  };

  res.json({ referrers, totals });
});

export default router;
