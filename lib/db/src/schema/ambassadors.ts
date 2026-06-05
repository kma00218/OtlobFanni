import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const ambassadorsTable = pgTable("ambassadors", {
  id:        text("id").primaryKey(),
  name:      text("name").notNull(),
  phone:     text("phone"),
  whatsapp:  text("whatsapp"),
  code:      text("code").notNull().unique(),
  notes:     text("notes"),
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
