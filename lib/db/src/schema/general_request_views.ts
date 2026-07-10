import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const generalRequestViewsTable = pgTable("general_request_views", {
  id:           text("id").primaryKey(),
  requestId:    text("request_id").notNull(),
  entityType:   text("entity_type").notNull(),
  entityId:     text("entity_id").notNull(),
  providerName: text("provider_name"),
  whatsapp:     text("whatsapp"),
  cityName:     text("city_name"),
  categoryName: text("category_name"),
  viewedAt:     timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("grv_request_entity").on(t.requestId, t.entityType, t.entityId),
]);

export type GeneralRequestView = typeof generalRequestViewsTable.$inferSelect;
