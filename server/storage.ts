import { pgTable, serial, text, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { users, services, orders, type User, type InsertUser, type Order, type Service } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  updateOrderStatus(orderId: number, status: Order["status"]): Promise<Order>;

  getServices(): Promise<Service[]>;
  updateService(id: number, updates: Partial<Service>): Promise<Service>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      ...order,
      status: "pending",
      createdAt: new Date()
    }).returning();
    return newOrder;
  }

  async getOrders(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.customerId, userId));
  }

  async updateOrderStatus(orderId: number, status: Order["status"]): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }
}

export const storage = new DatabaseStorage();