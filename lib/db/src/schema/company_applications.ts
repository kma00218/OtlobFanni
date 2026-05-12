import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  specialty:      text("specialty").notNull(),
  customSpecialty: text("custom_specialty"),
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
  status:         text("status").notNull().default("pending"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompanyApplicationSchema = createInsertSchema(companyApplicationsTable).omit({ createdAt: true });
export type InsertCompanyApplication = z.infer<typeof insertCompanyApplicationSchema>;
export type CompanyApplication = typeof companyApplicationsTable.$inferSelect;
