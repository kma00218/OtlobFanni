import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceRequestsTable = pgTable("service_requests", {
  id:                text("id").primaryKey(),
  ownerId:           text("owner_id"),
  ownerType:         text("owner_type"),
  ownerName:         text("owner_name"),
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
  isRead:            boolean("is_read").notNull().default(false),
  lastViewedAt:      timestamp("last_viewed_at", { withTimezone: true }),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  workStartedAt:              timestamp("work_started_at",               { withTimezone: true }),
  confirmationToken:          text("confirmation_token"),
  customerStartedConfirmedAt: timestamp("customer_started_confirmed_at", { withTimezone: true }),
  serviceAmount:              text("service_amount"),
  completionNotes:            text("completion_notes"),
  completionToken:            text("completion_token"),
  platformCommission:         text("platform_commission"),
  customerDisputeNote:        text("customer_dispute_note"),
  completedConfirmedAt:       timestamp("completed_confirmed_at",        { withTimezone: true }),
  customerRating:             text("customer_rating"),
  customerComment:            text("customer_comment"),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ createdAt: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
