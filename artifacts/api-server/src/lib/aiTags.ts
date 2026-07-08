import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { techniciansTable, companyApplicationsTable, supplierApplicationsTable } from "@workspace/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";

const SYSTEM_PROMPT =
  "You are an expert at extracting professional specialties from Arabic or English business descriptions for a Libyan home-services directory. " +
  "Return ONLY a JSON array of short Arabic specialty tags (2–4 words each, max 10 tags). " +
  "Each tag should be a distinct service or skill mentioned explicitly or implied in the description. " +
  "Example output: [\"تركيب تكييف\", \"صيانة كهربائية\", \"سباكة منزلية\"]. " +
  "No explanations, no markdown, only the JSON array.";

const CUSTOMER_REQUEST_PROMPT =
  "You are an assistant for a Libyan home-services app. " +
  "A customer described a problem or service they need. Extract what type of service they require. " +
  "Return ONLY a JSON array of short Arabic service tags (2–4 words each, max 8 tags). " +
  "Tags must describe the service/repair needed. " +
  "Example output: [\"تسريب مياه\", \"صيانة سباكة\", \"تبديل أنابيب\"]. " +
  "No explanations, no markdown, only the JSON array.";

export async function analyzeCustomerRequest(description: string): Promise<string[]> {
  if (!description || description.trim().length < 5) return [];
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 256,
    messages: [
      { role: "system", content: CUSTOMER_REQUEST_PROMPT },
      { role: "user", content: `وصف المشكلة من العميل: ${description}\n\nاستخرج وسوم الخدمة كمصفوفة JSON من السلاسل العربية.` },
    ],
  });
  const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
  try {
    const cleaned = raw.replace(/```json?|```/g, "").trim();
    let tags = JSON.parse(cleaned);
    if (!Array.isArray(tags)) tags = [];
    return (tags as unknown[])
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .slice(0, 8);
  } catch { return []; }
}

export async function generateTags(
  description: string,
  name: string,
  entityType: string
): Promise<string[]> {
  if (!description || description.trim().length < 5) return [];

  const entityHint =
    entityType === "supplier"
      ? "supplier of tools, equipment, or materials"
      : entityType === "company"
      ? "service company or institution"
      : "individual technician or craftsman";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 512,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Entity type: ${entityHint}\n` +
          (name ? `Name: ${name}\n` : "") +
          `Description: ${description}\n\nExtract the specialty tags as a JSON array of Arabic strings.`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
  try {
    const cleaned = raw.replace(/```json?|```/g, "").trim();
    let tags = JSON.parse(cleaned);
    if (!Array.isArray(tags)) tags = [];
    return tags
      .filter((t: unknown) => typeof t === "string" && (t as string).trim().length > 0)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function autoExtractTagsInBackground(
  id: string,
  entityType: "technician" | "company" | "supplier"
): void {
  setImmediate(async () => {
    try {
      let description = "";
      let name = "";

      if (entityType === "technician") {
        const [tech] = await db.select().from(techniciansTable).where(eq(techniciansTable.id, id));
        if (!tech || (tech.aiTags && tech.aiTags.length > 0)) return;
        description = tech.descriptionAr || tech.descriptionEn || "";
        name = tech.nameAr || "";
      } else if (entityType === "company") {
        const [comp] = await db.select().from(companyApplicationsTable).where(eq(companyApplicationsTable.id, id));
        if (!comp || (comp.aiTags && comp.aiTags.length > 0)) return;
        description = comp.description || "";
        name = comp.companyName || "";
      } else if (entityType === "supplier") {
        const [sup] = await db.select().from(supplierApplicationsTable).where(eq(supplierApplicationsTable.id, id));
        if (!sup || (sup.aiTags && sup.aiTags.length > 0)) return;
        description = sup.description || "";
        name = sup.businessName || "";
      }

      if (!description || description.trim().length < 5) return;
      const tags = await generateTags(description, name, entityType);
      if (tags.length === 0) return;

      if (entityType === "technician") {
        await db.update(techniciansTable).set({ aiTags: tags }).where(eq(techniciansTable.id, id));
      } else if (entityType === "company") {
        await db.update(companyApplicationsTable).set({ aiTags: tags }).where(eq(companyApplicationsTable.id, id));
      } else if (entityType === "supplier") {
        await db.update(supplierApplicationsTable).set({ aiTags: tags }).where(eq(supplierApplicationsTable.id, id));
      }
      console.log(`[AI] Auto-extracted ${tags.length} tags for ${entityType} ${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AI] Auto-extract failed for ${entityType} ${id}:`, msg);
    }
  });
}

export async function batchExtractTags(
  entityType: "technician" | "company" | "supplier",
  limit = 80
): Promise<{ processed: number; skipped: number; failed: number; total: number }> {
  let rows: { id: string; description: string; name: string }[] = [];

  if (entityType === "technician") {
    const techs = await db
      .select({ id: techniciansTable.id, descriptionAr: techniciansTable.descriptionAr, descriptionEn: techniciansTable.descriptionEn, nameAr: techniciansTable.nameAr, aiTags: techniciansTable.aiTags })
      .from(techniciansTable)
      .where(
        and(
          eq(techniciansTable.isApproved, true),
          or(isNull(techniciansTable.aiTags), sql`cardinality(${techniciansTable.aiTags}) = 0`)
        )
      )
      .limit(limit);

    rows = techs.map(t => ({
      id: t.id,
      description: t.descriptionAr || t.descriptionEn || "",
      name: t.nameAr || "",
    }));
  } else if (entityType === "company") {
    const comps = await db
      .select({ id: companyApplicationsTable.id, description: companyApplicationsTable.description, companyName: companyApplicationsTable.companyName, aiTags: companyApplicationsTable.aiTags })
      .from(companyApplicationsTable)
      .where(
        and(
          or(eq(companyApplicationsTable.status, "approved"), eq(companyApplicationsTable.status, "published")),
          or(isNull(companyApplicationsTable.aiTags), sql`cardinality(${companyApplicationsTable.aiTags}) = 0`)
        )
      )
      .limit(limit);

    rows = comps.map(c => ({
      id: c.id,
      description: c.description || "",
      name: c.companyName || "",
    }));
  } else if (entityType === "supplier") {
    const sups = await db
      .select({ id: supplierApplicationsTable.id, description: supplierApplicationsTable.description, businessName: supplierApplicationsTable.businessName, aiTags: supplierApplicationsTable.aiTags })
      .from(supplierApplicationsTable)
      .where(
        and(
          eq(supplierApplicationsTable.status, "published"),
          or(isNull(supplierApplicationsTable.aiTags), sql`cardinality(${supplierApplicationsTable.aiTags}) = 0`)
        )
      )
      .limit(limit);

    rows = sups.map(s => ({
      id: s.id,
      description: s.description || "",
      name: s.businessName || "",
    }));
  }

  const total = rows.length;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.description || row.description.trim().length < 5) {
      skipped++;
      continue;
    }

    try {
      const tags = await generateTags(row.description, row.name, entityType);
      if (tags.length === 0) {
        skipped++;
        continue;
      }

      if (entityType === "technician") {
        await db.update(techniciansTable).set({ aiTags: tags }).where(eq(techniciansTable.id, row.id));
      } else if (entityType === "company") {
        await db.update(companyApplicationsTable).set({ aiTags: tags }).where(eq(companyApplicationsTable.id, row.id));
      } else if (entityType === "supplier") {
        await db.update(supplierApplicationsTable).set({ aiTags: tags }).where(eq(supplierApplicationsTable.id, row.id));
      }
      processed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AI batch] Failed for ${entityType} ${row.id}:`, msg);
      failed++;
    }
  }

  return { processed, skipped, failed, total };
}
