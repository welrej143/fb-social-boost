import { users, services, orders, type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getService(serviceId: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  createOrUpdateService(service: InsertService): Promise<Service>;
  
  getOrder(orderId: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
}

// Database storage implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    
    const sql = postgres(connectionString);
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getService(serviceId: string): Promise<Service | undefined> {
    const result = await this.db.select().from(services).where(eq(services.serviceId, serviceId));
    return result[0];
  }

  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services);
  }

  async createOrUpdateService(insertService: InsertService): Promise<Service> {
    const existing = await this.getService(insertService.serviceId);
    
    if (existing) {
      const result = await this.db
        .update(services)
        .set({ ...insertService, updatedAt: new Date() })
        .where(eq(services.serviceId, insertService.serviceId))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(services).values(insertService).returning();
      return result[0];
    }
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.orderId, orderId));
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.db.select().from(orders).orderBy(orders.createdAt);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await this.db.insert(orders).values({
      ...insertOrder,
      status: insertOrder.status || "Processing"
    }).returning();
    return result[0];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const result = await this.db
      .update(orders)
      .set({ status })
      .where(eq(orders.orderId, orderId))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
