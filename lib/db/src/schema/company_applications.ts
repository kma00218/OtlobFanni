import { pgTable, text, boolean, timestamp, jsonb, integer, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companyApplicationsTable = pgTable("company_applications", {
  id:             text("id").primaryKey(),
  companyName:    text("company_name").notNull(),
  contactName:    text("contact_name").notNull(),
  phone:          text("phone").notNull(),
  whatsapp:       text("whatsapp").notNull(),
  commercialReg:  text("commercial_reg"),
  city:           text("city").notNull(),
  area:           text("area"),
  address:        text("address"),
  specialty:       text("specialty").notNull(),
  extraSpecialties:     text("extra_specialties").array().default([]),
  customSpecialty:      text("custom_specialty"),
  suggestedSpecialties: jsonb("suggested_specialties").$type<{sectionId: string, name: string}[]>().default([]),
  lat:            real("lat"),
  lng:            real("lng"),
  yearsActive:    text("years_active"),
  description:    text("description"),
  certifications: text("certifications"),
  priceFrom:      text("price_from"),
  priceTo:        text("price_to"),
  availableNow:   boolean("available_now").default(false),
  workingDays:    text("working_days").array().default([]),
  hoursFrom:      text("hours_from"),
  hoursTo:        text("hours_to"),
  emergency:      boolean("emergency").default(false),
  serviceRadius:  text("service_radius"),
  facebook:       text("facebook"),
  instagram:      text("instagram"),
  companyLogo:    text("company_logo"),
  workImages:     jsonb("work_images").$type<string[]>().default([]),
  commercialDoc:  text("commercial_doc"),
  workLicense:    text("work_license"),
  referredBy:     text("referred_by"),
  referredByName: text("referred_by_name"),
  referredByType: text("referred_by_type"),
  status:         text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  requestNumber:  text("request_number"),
  rating:         numeric("rating").default("0"),
  reviewsCount:   integer("reviews_count").default(0),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompanyApplicationSchema = createInsertSchema(companyApplicationsTable).omit({ createdAt: true });
export type InsertCompanyApplication = z.infer<typeof insertCompanyApplicationSchema>;
export type CompanyApplication = typeof companyApplicationsTable.$inferSelect;
