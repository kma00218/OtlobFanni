import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceRequestsTable = pgTable("service_requests", {
  id:                text("id").primaryKey(),
  ownerId:           text("owner_id"),
  ownerType:         text("owner_type"),
  customerName:      text("customer_name").notNull(),
  phone:             text("phone"),
  whatsappPhone:     text("whatsapp_phone"),
  callPhone:         text("call_phone"),
  cityId:            text("city_id"),
  cityName:          text("city_name"),
  requestType:       text("request_type"),
  categoryId:        text("category_id"),
  categoryName:      text("category_name"),
  description:       text("description"),
  preferredDatetime: text("preferred_datetime"),
  photoUrls:         text("photo_urls").array(),
  status:            text("status").notNull().default("new"),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ createdAt: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
