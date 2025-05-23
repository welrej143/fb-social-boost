import { 
  users, 
  services, 
  orders, 
  deposits, 
  type User, 
  type UpsertUser, 
  type Service, 
  type InsertService, 
  type Order, 
  type InsertOrder, 
  type Deposit, 
  type InsertDeposit 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: string): Promise<User | undefined>;
  
  getService(serviceId: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  createOrUpdateService(service: InsertService): Promise<Service>;
  
  getOrder(orderId: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  updateOrderSmmId(orderId: string, smmOrderId: string): Promise<Order | undefined>;
  
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  updateDepositStatus(id: number, status: string): Promise<Deposit | undefined>;
  getUserDeposits(userId: string): Promise<Deposit[]>;
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

  async updateOrderSmmId(orderId: string, smmOrderId: string): Promise<Order | undefined> {
    const result = await this.db
      .update(orders)
      .set({ smmOrderId })
      .where(eq(orders.orderId, orderId))
      .returning();
    return result[0];
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const result = await this.db.insert(deposits).values(insertDeposit).returning();
    return result[0];
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    const result = await this.db.select().from(deposits).where(eq(deposits.id, id));
    return result[0];
  }

  async updateDepositStatus(id: number, status: string): Promise<Deposit | undefined> {
    const result = await this.db
      .update(deposits)
      .set({ status })
      .where(eq(deposits.id, id))
      .returning();
    return result[0];
  }

  async getUserDeposits(userId: number): Promise<Deposit[]> {
    return await this.db.select().from(deposits).where(eq(deposits.userId, userId));
  }
}

export const storage = new DbStorage();
