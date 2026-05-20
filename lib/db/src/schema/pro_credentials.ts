import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const proCredentialsTable = pgTable("pro_credentials", {
  id:           text("id").primaryKey(),
  entityType:   text("entity_type").notNull(),
  entityId:     text("entity_id").notNull().unique(),
  whatsapp:     text("whatsapp").notNull(),
  displayName:  text("display_name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProCredential = typeof proCredentialsTable.$inferSelect;
