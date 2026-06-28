import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adRequestsTable = pgTable("ad_requests", {
  id:                   text("id").primaryKey(),
  companyName:          text("company_name").notNull(),
  contactName:          text("contact_name"),
  phone:                text("phone").notNull(),
  whatsapp:             text("whatsapp"),
  city:                 text("city"),
  businessType:         text("business_type"),
  adTitle:              text("ad_title"),
  adDescription:        text("ad_description"),
  requestedPlacement:   text("requested_placement"),
  websiteOrSocialLink:  text("website_or_social_link"),
  notes:                text("notes"),
  imagePreview:         text("image_preview"),
  specialCode:          text("special_code"),
  status:               text("status").notNull().default("pending"),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdRequestSchema = createInsertSchema(adRequestsTable).omit({ createdAt: true });
export type InsertAdRequest = z.infer<typeof insertAdRequestSchema>;
export type AdRequest = typeof adRequestsTable.$inferSelect;
