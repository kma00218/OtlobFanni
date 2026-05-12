import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adsTable = pgTable("ads", {
  id:             text("id").primaryKey(),
  titleAr:        text("title_ar").notNull(),
  titleEn:        text("title_en"),
  descriptionAr:  text("description_ar"),
  descriptionEn:  text("description_en"),
  imageUrl:       text("image_url"),
  linkUrl:        text("link_url"),
  placement:      text("placement").notNull(),
  sectionId:      text("section_id"),
  categoryId:     text("category_id"),
  sortOrder:      integer("sort_order").default(0),
  isActive:       boolean("is_active").default(true),
  startDate:      text("start_date"),
  endDate:        text("end_date"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdSchema = createInsertSchema(adsTable).omit({ createdAt: true });
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof adsTable.$inferSelect;
