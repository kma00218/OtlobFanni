import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const citiesTable = pgTable("cities", {
  id:         text("id").primaryKey(),
  nameAr:     text("name_ar").notNull(),
  nameEn:     text("name_en").notNull(),
  sortOrder:  integer("sort_order").default(0),
  isActive:   boolean("is_active").default(true),
});

export const insertCitySchema = createInsertSchema(citiesTable);
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof citiesTable.$inferSelect;
