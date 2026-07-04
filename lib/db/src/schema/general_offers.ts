import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generalOffersTable = pgTable("general_offers", {
  id:             text("id").primaryKey(),
  requestId:      text("request_id").notNull(),
  entityType:     text("entity_type").notNull(), // technician | company
  entityId:       text("entity_id").notNull(),
  providerName:   text("provider_name"),
  providerPhoto:  text("provider_photo"),
  providerRating: text("provider_rating"),
  cityName:       text("city_name"),
  price:          text("price"),
  etaText:        text("eta_text"),
  note:           text("note"),
  status:         text("status").notNull().default("pending"), // pending | selected | rejected
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGeneralOfferSchema = createInsertSchema(generalOffersTable).omit({ createdAt: true });
export type InsertGeneralOffer = z.infer<typeof insertGeneralOfferSchema>;
export type GeneralOffer = typeof generalOffersTable.$inferSelect;
