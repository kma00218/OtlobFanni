import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const profileUpdateRequestsTable = pgTable("profile_update_requests", {
  id:         text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId:   text("entity_id").notNull(),
  changes:    jsonb("changes").notNull(),
  status:     text("status").notNull().default("pending"),
  adminNote:  text("admin_note"),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});
