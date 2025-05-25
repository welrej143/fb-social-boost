import { 
  users, 
  services, 
  orders, 
  deposits, 
  tickets,
  type User, 
  type Service, 
  type InsertService, 
  type Order, 
  type InsertOrder, 
  type Deposit, 
  type InsertDeposit,
  type Ticket,
  type InsertTicket
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; username: string; password: string; firstName?: string; lastName?: string }): Promise<User>;
  updateUserBalance(userId: number, newBalance: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  getService(serviceId: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  createOrUpdateService(service: InsertService): Promise<Service>;
  
  getOrder(orderId: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  updateOrderSmmId(orderId: string, smmOrderId: string): Promise<Order | undefined>;
  
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  updateDepositStatus(id: number, status: string): Promise<Deposit | undefined>;
  getUserDeposits(userId: number): Promise<Deposit[]>;
  
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket | undefined>;
  getUserTickets(userId: number): Promise<Ticket[]>;
  getAllTickets(): Promise<Ticket[]>;
  updateTicketStatus(ticketId: string, status: string): Promise<Ticket | undefined>;
  updateTicketReply(ticketId: string, adminReply: string, status?: string): Promise<Ticket | undefined>;
  
  createPaypalClick(click: InsertPaypalClick): Promise<PaypalClick>;
  getAllPaypalClicks(): Promise<PaypalClick[]>;
  getPaypalClicksByUser(userId: number): Promise<PaypalClick[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    console.log('Getting user with ID:', id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    console.log('Retrieved user:', user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; username: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    console.log('Creating user with data:', userData);
    const insertData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };
    console.log('Insert data:', insertData);
    const [user] = await db
      .insert(users)
      .values(insertData)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error("Error updating user balance:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
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

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
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

  async getUserDeposits(userId: number): Promise<Deposit[]> {
    return await db.select().from(deposits).where(eq(deposits.userId, userId));
  }

  async createTicket(insertTicket: any): Promise<Ticket> {
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const [ticket] = await db.insert(tickets).values({
      ticketId,
      userId: insertTicket.userId,
      name: insertTicket.name,
      email: insertTicket.email,
      subject: insertTicket.subject,
      message: insertTicket.message,
      status: 'Open',
      priority: insertTicket.priority || 'Medium',
      adminReply: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return ticket;
  }

  async getTicket(ticketId: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, ticketId)).limit(1);
    return ticket;
  }

  async getUserTickets(userId: number): Promise<Ticket[]> {
    const userTickets = await db.select().from(tickets).where(eq(tickets.userId, userId));
    return userTickets;
  }

  async getAllTickets(): Promise<Ticket[]> {
    const allTickets = await db.select().from(tickets);
    return allTickets;
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<Ticket | undefined> {
    const [updatedTicket] = await db.update(tickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(tickets.ticketId, ticketId))
      .returning();
    return updatedTicket;
  }

  async updateTicketReply(ticketId: string, adminReply: string, status?: string): Promise<Ticket | undefined> {
    const updateData: any = { adminReply, updatedAt: new Date() };
    if (status) {
      updateData.status = status;
    }
    
    const [updatedTicket] = await db.update(tickets)
      .set(updateData)
      .where(eq(tickets.ticketId, ticketId))
      .returning();
    return updatedTicket;
  }

  async createPaypalClick(insertClick: InsertPaypalClick): Promise<PaypalClick> {
    const [click] = await db.insert(paypalClicks).values(insertClick).returning();
    return click;
  }

  async getAllPaypalClicks(): Promise<PaypalClick[]> {
    return await db.select().from(paypalClicks).orderBy(desc(paypalClicks.clickedAt));
  }

  async getPaypalClicksByUser(userId: number): Promise<PaypalClick[]> {
    return await db.select().from(paypalClicks)
      .where(eq(paypalClicks.userId, userId))
      .orderBy(desc(paypalClicks.clickedAt));
  }
}

// Use in-memory storage for reliable deployment
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private services: Map<string, Service> = new Map();
  private orders: Map<string, Order> = new Map();
  private deposits: Map<number, Deposit> = new Map();
  private nextUserId = 1;
  private nextDepositId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async createUser(userData: { email: string; username: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      balance: "0.00",
      createdAt: new Date()
    };
    
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.balance = newBalance;
      this.users.set(userId, user);
      this.usersByEmail.set(user.email, user);
    }
    return user;
  }

  async getService(serviceId: string): Promise<Service | undefined> {
    return this.services.get(serviceId);
  }

  async getAllServices(): Promise<Service[]> {
    // Return hardcoded Facebook services for reliability
    return [
      {
        id: 1,
        serviceId: "1977",
        name: "Facebook Page Likes",
        rate: "0.0025",
        minOrder: 1000,
        maxOrder: 100000,
        createdAt: new Date()
      },
      {
        id: 2,
        serviceId: "1775", 
        name: "Facebook Page Followers",
        rate: "0.0030",
        minOrder: 1000,
        maxOrder: 50000,
        createdAt: new Date()
      },
      {
        id: 3,
        serviceId: "55",
        name: "Facebook Profile Followers", 
        rate: "0.0035",
        minOrder: 1000,
        maxOrder: 25000,
        createdAt: new Date()
      },
      {
        id: 4,
        serviceId: "221",
        name: "Facebook Post Likes",
        rate: "0.0020",
        minOrder: 1000,
        maxOrder: 50000,
        createdAt: new Date()
      },
      {
        id: 5,
        serviceId: "1779",
        name: "Facebook Post Reactions",
        rate: "0.0028",
        minOrder: 1000,
        maxOrder: 30000,
        createdAt: new Date()
      },
      {
        id: 6,
        serviceId: "254",
        name: "Facebook Video Views",
        rate: "0.0015",
        minOrder: 1000,
        maxOrder: 100000,
        createdAt: new Date()
      }
    ];
  }

  async createOrUpdateService(insertService: InsertService): Promise<Service> {
    const service: Service = {
      id: this.services.size + 1,
      ...insertService,
      createdAt: new Date()
    };
    this.services.set(service.serviceId, service);
    return service;
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    return this.orders.get(orderId);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      id: this.orders.size + 1,
      ...insertOrder,
      createdAt: new Date()
    };
    this.orders.set(order.orderId, order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      this.orders.set(orderId, order);
    }
    return order;
  }

  async updateOrderSmmId(orderId: string, smmOrderId: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (order) {
      order.smmOrderId = smmOrderId;
      this.orders.set(orderId, order);
    }
    return order;
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const deposit: Deposit = {
      id: this.nextDepositId++,
      ...insertDeposit,
      createdAt: new Date()
    };
    this.deposits.set(deposit.id, deposit);
    return deposit;
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async updateDepositStatus(id: number, status: string): Promise<Deposit | undefined> {
    const deposit = this.deposits.get(id);
    if (deposit) {
      deposit.status = status;
      this.deposits.set(id, deposit);
    }
    return deposit;
  }

  async getUserDeposits(userId: number): Promise<Deposit[]> {
    return Array.from(this.deposits.values()).filter(deposit => deposit.userId === userId);
  }
}

export const storage = new DatabaseStorage();