import { users, services, orders, type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<string, Service>;
  private orders: Map<string, Order>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentOrderId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getService(serviceId: string): Promise<Service | undefined> {
    return this.services.get(serviceId);
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createOrUpdateService(insertService: InsertService): Promise<Service> {
    const existing = this.services.get(insertService.serviceId);
    
    if (existing) {
      const updated: Service = {
        ...existing,
        ...insertService,
        updatedAt: new Date(),
      };
      this.services.set(insertService.serviceId, updated);
      return updated;
    } else {
      const id = this.currentServiceId++;
      const service: Service = {
        id,
        ...insertService,
        updatedAt: new Date(),
      };
      this.services.set(insertService.serviceId, service);
      return service;
    }
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    return this.orders.get(orderId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      id,
      ...insertOrder,
      createdAt: new Date(),
    };
    this.orders.set(insertOrder.orderId, order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      const updated = { ...order, status };
      this.orders.set(orderId, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
