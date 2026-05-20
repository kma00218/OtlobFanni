import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const updateReportsTable = pgTable("update_reports", {
  id:            text("id").primaryKey(),
  entityType:    text("entity_type").notNull(),
  entityId:      text("entity_id").notNull(),
  entityName:    text("entity_name").notNull().default(""),
  city:          text("city").notNull().default(""),
  requesterName: text("requester_name"),
  requesterPhone:text("requester_phone"),
  requestType:   text("request_type").notNull().default("other"),
  notes:         text("notes"),
  photos:        jsonb("photos").notNull().default([]),
  status:        text("status").notNull().default("new"),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UpdateReport = typeof updateReportsTable.$inferSelect;
