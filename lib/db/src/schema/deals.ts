import { pgTable, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";

export const dealsTable = pgTable("deals", {
  id:               text("id").primaryKey(),
  proId:            text("pro_id").notNull(),
  proType:          text("pro_type").notNull(),
  proName:          text("pro_name"),
  userPhone:        text("user_phone").notNull(),
  userName:         text("user_name"),
  serviceType:      text("service_type").notNull(),
  serviceValue:     numeric("service_value", { precision: 10, scale: 2 }),
  serviceDate:      text("service_date").notNull(),
  description:      text("description"),
  proConfirmed:     boolean("pro_confirmed").notNull().default(true),
  userConfirmed:    boolean("user_confirmed").default(null),
  userResponse:     text("user_response"),
  status:           text("status").notNull().default("pending"),
  proPoints:        text("pro_points").default("0"),
  userPoints:       text("user_points").default("0"),
  confirmToken:     text("confirm_token"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  confirmedAt:      timestamp("confirmed_at", { withTimezone: true }),
});

export type Deal = typeof dealsTable.$inferSelect;
