import { Router } from "express";
import { generateTags, batchExtractTags } from "../lib/aiTags";
import { db } from "@workspace/db";
import { techniciansTable, companyApplicationsTable, supplierApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ── POST /admin/ai/extract-tags ───────────────────────────────────────────────
router.post("/admin/ai/extract-tags", async (req, res): Promise<void> => {
  const { description, name, entity_type } = req.body;

  if (!description || description.trim().length < 5) {
    res.status(400).json({ error: "Description too short to extract tags" });
    return;
  }

  try {
    const tags = await generateTags(description, name || "", entity_type || "technician");
    res.json({ tags });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI extract-tags error:", msg);
    res.status(500).json({ error: "AI service error" });
  }
});

// ── POST /admin/ai/batch-extract-tags ─────────────────────────────────────────
// Processes ALL entities of a given type that have description but no ai_tags
router.post("/admin/ai/batch-extract-tags", async (req, res): Promise<void> => {
  const { entity_type } = req.body;
  if (!["technician", "company", "supplier"].includes(entity_type)) {
    res.status(400).json({ error: "entity_type must be technician, company, or supplier" });
    return;
  }

  try {
    const result = await batchExtractTags(entity_type as "technician" | "company" | "supplier");
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI batch-extract-tags error:", msg);
    res.status(500).json({ error: "Batch extraction failed" });
  }
});

// ── PATCH /admin/ai/save-tags ─────────────────────────────────────────────────
router.patch("/admin/ai/save-tags", async (req, res): Promise<void> => {
  const { entity_type, id, tags } = req.body;

  if (!id || !entity_type || !Array.isArray(tags)) {
    res.status(400).json({ error: "entity_type, id, and tags[] are required" });
    return;
  }

  const cleanTags = tags.filter((t: unknown) => typeof t === "string" && (t as string).trim().length > 0);

  try {
    if (entity_type === "technician") {
      await db.update(techniciansTable).set({ aiTags: cleanTags }).where(eq(techniciansTable.id, id));
    } else if (entity_type === "company") {
      await db.update(companyApplicationsTable).set({ aiTags: cleanTags }).where(eq(companyApplicationsTable.id, id));
    } else if (entity_type === "supplier") {
      await db.update(supplierApplicationsTable).set({ aiTags: cleanTags }).where(eq(supplierApplicationsTable.id, id));
    } else {
      res.status(400).json({ error: "Unknown entity_type" });
      return;
    }
    res.json({ ok: true, tags: cleanTags });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI save-tags error:", msg);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
