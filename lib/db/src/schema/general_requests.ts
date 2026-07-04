import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generalRequestsTable = pgTable("general_requests", {
  id:             text("id").primaryKey(),
  orderNumber:    text("order_number").notNull(),
  trackingCode:   text("tracking_code").notNull(),
  customerName:   text("customer_name").notNull(),
  whatsapp:       text("whatsapp").notNull(),
  cityId:         text("city_id"),
  cityName:       text("city_name"),
  categoryId:     text("category_id"),
  categoryName:   text("category_name"),
  title:          text("title"),
  description:    text("description"),
  photoUrls:      text("photo_urls").array(),
  status:         text("status").notNull().default("open"), // open | assigned | cancelled
  assignedOfferId: text("assigned_offer_id"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGeneralRequestSchema = createInsertSchema(generalRequestsTable).omit({ createdAt: true });
export type InsertGeneralRequest = z.infer<typeof insertGeneralRequestSchema>;
export type GeneralRequest = typeof generalRequestsTable.$inferSelect;
