import { pgTable, text, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const techniciansTable = pgTable("technicians", {
  id:              text("id").primaryKey(),
  nameAr:          text("name_ar").notNull(),
  nameEn:          text("name_en"),
  phone:           text("phone").notNull(),
  whatsapp:        text("whatsapp"),
  cityId:          text("city_id"),
  area:            text("area"),
  categoryId:      text("category_id"),
  extraSpecialties: text("extra_specialties").array().default([]),
  aiTags:          text("ai_tags").array().default([]),
  experienceYears: integer("experience_years").default(0),
  priceFrom:       integer("price_from").default(0),
  priceTo:         integer("price_to").default(0),
  descriptionAr:   text("description_ar"),
  descriptionEn:   text("description_en"),
  profilePhoto:    text("profile_photo"),
  workImages:      jsonb("work_images").$type<string[]>().default([]),
  rating:          real("rating").default(0),
  reviewsCount:    integer("reviews_count").default(0),
  isFeatured:      boolean("is_featured").default(false),
  isApproved:      boolean("is_approved").default(true),
  isActive:        boolean("is_active").default(true),
  status:          text("status").default("available"),
  emergency:       boolean("emergency").default(false),
  availableNow:    boolean("available_now").default(false),
  lat:             real("lat"),
  lng:             real("lng"),
  facebook:        text("facebook"),
  instagram:       text("instagram"),
  applicationId:   text("application_id"),
  referralSource:  text("referral_source"),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTechnicianSchema = createInsertSchema(techniciansTable).omit({ createdAt: true });
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof techniciansTable.$inferSelect;
