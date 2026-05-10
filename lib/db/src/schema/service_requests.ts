import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceRequestsTable = pgTable("service_requests", {
  id:           text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone:        text("phone"),
  cityId:       text("city_id"),
  cityName:     text("city_name"),
  categoryId:   text("category_id"),
  categoryName: text("category_name"),
  description:  text("description"),
  status:       text("status").notNull().default("new"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ createdAt: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
