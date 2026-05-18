import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const technicianApplicationsTable = pgTable("technician_applications", {
  id:               text("id").primaryKey(),
  fullName:         text("full_name").notNull(),
  phone:            text("phone").notNull(),
  whatsapp:         text("whatsapp").notNull(),
  nationalId:       text("national_id"),
  city:             text("city").notNull(),
  area:             text("area"),
  address:          text("address"),
  specialty:        text("specialty").notNull(),
  extraSpecialties:      text("extra_specialties").array().default([]),
  customSpecialty:       text("custom_specialty"),
  suggestedSpecialties:  jsonb("suggested_specialties").$type<{sectionId: string, name: string}[]>().default([]),
  experience:       text("experience"),
  type:             text("type").default("individual"),
  description:      text("description"),
  certifications:   text("certifications"),
  priceFrom:        text("price_from"),
  priceTo:          text("price_to"),
  availableNow:     boolean("available_now").default(false),
  workingDays:      text("working_days").array().default([]),
  hoursFrom:        text("hours_from"),
  hoursTo:          text("hours_to"),
  emergency:        boolean("emergency").default(false),
  serviceRadius:    text("service_radius"),
  facebook:         text("facebook"),
  instagram:        text("instagram"),
  profilePhoto:     text("profile_photo"),
  workImages:       jsonb("work_images").$type<string[]>().default([]),
  idDocFront:       text("id_doc_front"),
  idDocBack:        text("id_doc_back"),
  workLicense:      text("work_license"),
  referredBy:       text("referred_by"),
  referredByName:   text("referred_by_name"),
  referredByType:   text("referred_by_type"),
  status:           text("status").notNull().default("pending"),
  rejectionReason:  text("rejection_reason"),
  requestNumber:    text("request_number"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTechnicianApplicationSchema = createInsertSchema(technicianApplicationsTable).omit({ createdAt: true });
export type InsertTechnicianApplication = z.infer<typeof insertTechnicianApplicationSchema>;
export type TechnicianApplication = typeof technicianApplicationsTable.$inferSelect;
