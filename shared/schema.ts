import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: text("balance").notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  serviceId: text("service_id").notNull().unique(),
  name: text("name").notNull(),
  rate: text("rate").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  userId: varchar("user_id").notNull(),
  serviceId: text("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  link: text("link").notNull(),
  quantity: integer("quantity").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("Processing"),
  paypalOrderId: text("paypal_order_id"),
  smmOrderId: text("smm_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("Pending"),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const upsertUserSchema = createInsertSchema(users);

export type UpsertUser = typeof users.$inferInsert;

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;
