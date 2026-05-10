import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adRequestsTable = pgTable("ad_requests", {
  id:           text("id").primaryKey(),
  companyName:  text("company_name").notNull(),
  contactName:  text("contact_name"),
  phone:        text("phone").notNull(),
  whatsapp:     text("whatsapp"),
  adType:       text("ad_type"),
  placement:    text("placement"),
  budget:       text("budget"),
  description:  text("description"),
  linkUrl:      text("link_url"),
  imagePreview: text("image_preview"),
  status:       text("status").notNull().default("pending"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdRequestSchema = createInsertSchema(adRequestsTable).omit({ createdAt: true });
export type InsertAdRequest = z.infer<typeof insertAdRequestSchema>;
export type AdRequest = typeof adRequestsTable.$inferSelect;
