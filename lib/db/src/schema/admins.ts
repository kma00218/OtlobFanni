import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminsTable = pgTable("admins", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         text("role").notNull().default("sub_admin"),
  isActive:     boolean("is_active").default(true),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdminSchema = createInsertSchema(adminsTable).omit({ id: true, createdAt: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof adminsTable.$inferSelect;
