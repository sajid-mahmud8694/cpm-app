import { pgTable, serial, text, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define session table to match existing structure exactly
export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["customer", "editor", "admin"] }).notNull().default("customer"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basicPrice: real("basic_price").notNull(),
  mediumPrice: real("medium_price").notNull(),
  complexPrice: real("complex_price").notNull(),
  superComplexPrice: real("super_complex_price").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  status: text("status", { enum: ["pending", "processing", "completed"] }).notNull().default("pending"),
  complexity: text("complexity", { enum: ["basic", "medium", "complex", "superComplex"] }).notNull(),
  files: jsonb("files").notNull(), // Array of file paths/urls
  instructions: text("instructions"),
  addons: jsonb("addons").notNull(), // Array of selected addons
  deliveryFormat: text("delivery_format").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  totalPrice: real("total_price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  customerId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Service = typeof services.$inferSelect;