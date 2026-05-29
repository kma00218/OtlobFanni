import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { techniciansTable, companyApplicationsTable, supplierApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ── POST /admin/ai/extract-tags ───────────────────────────────────────────────
// Takes a description + optional name and returns AI-suggested specialty tags
router.post("/admin/ai/extract-tags", async (req, res): Promise<void> => {
  const { description, name, entity_type } = req.body;

  if (!description || description.trim().length < 5) {
    res.status(400).json({ error: "Description too short to extract tags" });
    return;
  }

  const entityHint =
    entity_type === "supplier"
      ? "supplier of tools, equipment, or materials"
      : entity_type === "company"
      ? "service company or institution"
      : "individual technician or craftsman";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting professional specialties from Arabic or English business descriptions for a Libyan home-services directory. " +
            "Return ONLY a JSON array of short Arabic specialty tags (2–4 words each, max 10 tags). " +
            "Each tag should be a distinct service or skill mentioned explicitly or implied in the description. " +
            "Example output: [\"تركيب تكييف\", \"صيانة كهربائية\", \"سباكة منزلية\"]. " +
            "No explanations, no markdown, only the JSON array.",
        },
        {
          role: "user",
          content:
            `Entity type: ${entityHint}\n` +
            (name ? `Name: ${name}\n` : "") +
            `Description: ${description}\n\n` +
            "Extract the specialty tags as a JSON array of Arabic strings.",
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
    let tags: string[] = [];
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json?|```/g, "").trim();
      tags = JSON.parse(cleaned);
      if (!Array.isArray(tags)) tags = [];
      tags = tags.filter((t) => typeof t === "string" && t.trim().length > 0).slice(0, 10);
    } catch {
      tags = [];
    }

    res.json({ tags });
  } catch (err: any) {
    console.error("AI extract-tags error:", err?.message || err);
    res.status(500).json({ error: "AI service error" });
  }
});

// ── PATCH /admin/ai/save-tags ─────────────────────────────────────────────────
// Saves approved ai_tags back to the entity
router.patch("/admin/ai/save-tags", async (req, res): Promise<void> => {
  const { entity_type, id, tags } = req.body;

  if (!id || !entity_type || !Array.isArray(tags)) {
    res.status(400).json({ error: "entity_type, id, and tags[] are required" });
    return;
  }

  const cleanTags = tags.filter((t: any) => typeof t === "string" && t.trim().length > 0);

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
  } catch (err: any) {
    console.error("AI save-tags error:", err?.message || err);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
