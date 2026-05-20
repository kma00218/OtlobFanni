import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const referralsTable = pgTable("referrals", {
  id:        serial("id").primaryKey(),
  type:      text("type").notNull(),       // technician | company | supplier
  name:      text("name").notNull(),
  phone:     text("phone").notNull(),
  specialty: text("specialty"),
  city:      text("city"),
  notes:     text("notes"),
  status:    text("status").notNull().default("new"), // new | reviewed | contacted | rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
