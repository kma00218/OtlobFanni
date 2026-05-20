import { pgTable, text, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplierApplicationsTable = pgTable("supplier_applications", {
  id:                text("id").primaryKey(),
  businessName:      text("business_name").notNull(),
  contactName:       text("contact_name").notNull(),
  phone:             text("phone").notNull(),
  whatsapp:          text("whatsapp").notNull(),
  city:              text("city").notNull(),
  supplyType:        text("supply_type").notNull(),
  customSupplyType:  text("custom_supply_type"),
  area:              text("area"),
  address:           text("address"),
  lat:               doublePrecision("lat"),
  lng:               doublePrecision("lng"),
  description:       text("description"),
  logo:              text("logo"),
  shopImages:        jsonb("shop_images").$type<string[]>().default([]),
  email:             text("email"),
  facebook:          text("facebook"),
  instagram:         text("instagram"),
  tiktok:            text("tiktok"),
  referredBy:        text("referred_by"),
  rating:            doublePrecision("rating").default(0),
  reviewsCount:      doublePrecision("reviews_count").default(0),
  status:            text("status").notNull().default("pending"),
  rejectionReason:   text("rejection_reason"),
  requestNumber:     text("request_number"),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupplierApplicationSchema = createInsertSchema(supplierApplicationsTable).omit({ createdAt: true });
export type InsertSupplierApplication = z.infer<typeof insertSupplierApplicationSchema>;
export type SupplierApplication = typeof supplierApplicationsTable.$inferSelect;
