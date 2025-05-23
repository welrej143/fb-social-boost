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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getService(serviceId: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.serviceId, serviceId));
    return service;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createOrUpdateService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .onConflictDoUpdate({
        target: services.serviceId,
        set: {
          name: insertService.name,
          rate: insertService.rate,
          updatedAt: new Date(),
        },
      })
      .returning();
    return service;
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId));
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.orderId, orderId))
      .returning();
    return order;
  }

  async updateOrderSmmId(orderId: string, smmOrderId: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ smmOrderId })
      .where(eq(orders.orderId, orderId))
      .returning();
    return order;
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const [deposit] = await db.insert(deposits).values(insertDeposit).returning();
    return deposit;
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit;
  }

  async updateDepositStatus(id: number, status: string): Promise<Deposit | undefined> {
    const [deposit] = await db
      .update(deposits)
      .set({ status })
      .where(eq(deposits.id, id))
      .returning();
    return deposit;
  }

  async getUserDeposits(userId: string): Promise<Deposit[]> {
    return await db.select().from(deposits).where(eq(deposits.userId, userId));
  }
}

export const storage = new DatabaseStorage();