import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const referralsTable = pgTable("referrals", {
  id:                  text("id").primaryKey(),
  referredName:        text("referred_name").notNull(),
  referredPhone:       text("referred_phone").notNull(),
  referredWhatsapp:    text("referred_whatsapp").notNull(),
  referredSpecialty:   text("referred_specialty").notNull(),
  referredCity:        text("referred_city").notNull(),
  referrerName:        text("referrer_name").notNull(),
  referrerId:          text("referrer_id").notNull(),
  referrerType:        text("referrer_type").notNull(),
  status:              text("status").notNull().default("not_registered"),
  linkedApplicationId: text("linked_application_id"),
  createdAt:           timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Referral = typeof referralsTable.$inferSelect;
