import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id:        text("id").primaryKey(),
  event:     text("event").notNull(),
  path:      text("path"),
  ref:       text("ref"),
  sessionId: text("session_id"),
  device:    text("device"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;
