import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id:         text("id").primaryKey(),
  nameAr:     text("name_ar").notNull(),
  nameEn:     text("name_en").notNull(),
  iconName:   text("icon_name"),
  sortOrder:  integer("sort_order").default(0),
  isActive:   boolean("is_active").default(true),
});

export const insertCategorySchema = createInsertSchema(categoriesTable);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
