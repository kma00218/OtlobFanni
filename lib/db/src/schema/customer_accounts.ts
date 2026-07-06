import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Simple customer account system (replaces the old tracking-code flow).
// Auth is Username + 6-digit PIN only — no OTP / WhatsApp API at this stage.
// If a customer forgets their PIN, admin resets it manually from the admin panel
// after verifying identity over WhatsApp (see POST /admin/customer-accounts/:id/reset-pin).
export const customerAccountsTable = pgTable("customer_accounts", {
  id:        text("id").primaryKey(),
  name:      text("name").notNull(),
  whatsapp:  text("whatsapp").notNull(),
  username:  text("username").notNull(),
  pinHash:   text("pin_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  usernameUnique: uniqueIndex("customer_accounts_username_unique").on(t.username),
  whatsappUnique: uniqueIndex("customer_accounts_whatsapp_unique").on(t.whatsapp),
}));

export const insertCustomerAccountSchema = createInsertSchema(customerAccountsTable).omit({ createdAt: true });
export type InsertCustomerAccount = z.infer<typeof insertCustomerAccountSchema>;
export type CustomerAccount = typeof customerAccountsTable.$inferSelect;
