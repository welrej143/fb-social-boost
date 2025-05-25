import type { Express } from "express";
import { createServer, type Server } from "http";
import { json } from "express";
import { storage } from "./storage";
import { getSession, isAuthenticated, hashPassword, comparePassword } from "./auth";
import { insertOrderSchema, insertDepositSchema, insertUserSchema, loginSchema, insertTicketSchema } from "@shared/schema";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

const SMM_API_BASE = process.env.SMM_API_URL || "https://smmvaly.com/api/v2";
const SMM_API_KEY = process.env.SMM_API_KEY || "55265fdd0afb3d0a3e9df2b241b266c3";

// Service configurations
const FACEBOOK_SERVICES = {
  "1977": "Facebook Page Likes",
  "1775": "Facebook Page Followers", 
  "55": "Facebook Profile Followers",
  "221": "Facebook Post Likes",
  "1779": "Facebook Post Reactions",
  "254": "Facebook Video Views"
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());
  
  // Add express.json middleware for parsing request bodies
  app.use(json());

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Validate required fields
      if (!validatedData.email || !validatedData.password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        email: validatedData.email,
        username: validatedData.email, // Use email as username
        password: hashedPassword,
        firstName: validatedData.firstName ?? undefined,
        lastName: validatedData.lastName ?? undefined,
      });

      // Create session
      req.session.userId = user.id;
      req.session.userEmail = user.email ?? undefined;

      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({ message: "User created successfully", user: { id: user.id, email: user.email } });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Validate required fields
      if (!validatedData.email || !validatedData.password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.userEmail = user.email ?? undefined;

      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      console.log('Fetching user with ID:', userId);
      const user = await storage.getUser(userId);
      console.log('User found:', user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Get all services - fetch from SMM API and save to database, then serve from database
  app.get("/api/services", async (req, res) => {
    try {
      // First try to get services from database
      const dbServices = await storage.getAllServices();
      
      // If we have recent services in database (less than 1 hour old), return them
      if (dbServices.length > 0) {
        const latestService = dbServices[0];
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (latestService.updatedAt && new Date(latestService.updatedAt) > oneHourAgo) {
          const formattedServices = dbServices.map(service => ({
            serviceId: service.serviceId,
            name: service.name,
            rate: service.rate,
            originalRate: (parseFloat(service.rate) / 5).toFixed(2),
            minOrder: 100,
            maxOrder: 100000
          }));
          return res.json(formattedServices);
        }
      }

      // Fetch fresh data from SMM Valley API
      const response = await fetch(SMM_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key: SMM_API_KEY,
          action: 'services'
        })
      });

      if (!response.ok) {
        throw new Error(`SMM API error: ${response.status}`);
      }

      const smmServices = await response.json();
      const facebookServices = [];

      // Process and save each Facebook service to database
      for (const [serviceId, serviceName] of Object.entries(FACEBOOK_SERVICES)) {
        const smmService = smmServices.find((s: any) => s.service === serviceId);
        
        let ourRate = "2.00"; // Default rate
        if (smmService && smmService.rate) {
          ourRate = (parseFloat(smmService.rate) * 5).toFixed(2);
        }

        // Save/update service in database
        await storage.createOrUpdateService({
          serviceId,
          name: serviceName,
          rate: ourRate
        });

        facebookServices.push({
          serviceId,
          name: serviceName,
          rate: ourRate,
          originalRate: smmService?.rate || (parseFloat(ourRate) / 5).toFixed(2),
          minOrder: smmService?.min || 100,
          maxOrder: smmService?.max || 100000
        });
      }

      res.json(facebookServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      
      // Fallback to database services if API fails
      try {
        const dbServices = await storage.getAllServices();
        if (dbServices.length > 0) {
          const formattedServices = dbServices.map(service => ({
            serviceId: service.serviceId,
            name: service.name,
            rate: service.rate,
            originalRate: (parseFloat(service.rate) / 5).toFixed(2),
            minOrder: 100,
            maxOrder: 100000
          }));
          return res.json(formattedServices);
        }
      } catch (dbError) {
        console.error("Database fallback failed:", dbError);
      }
      
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Process order: deduct wallet, submit to SMM API, then store in database
  app.post("/api/orders", async (req: any, res) => {
    try {
      console.log('Processing order with data:', req.body);
      
      // Validate the order data
      const orderData = insertOrderSchema.parse(req.body);
      
      // Validate Facebook URL
      const facebookUrlPattern = /^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i;
      if (!facebookUrlPattern.test(orderData.link)) {
        return res.status(400).json({ error: "Invalid Facebook URL" });
      }

      // Validate service exists
      const service = await storage.getService(orderData.serviceId);
      if (!service) {
        return res.status(400).json({ error: "Invalid service" });
      }

      // Check user balance
      const user = await storage.getUser(orderData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userBalance = parseFloat(user.balance);
      const orderAmount = parseFloat(orderData.amount);
      
      if (userBalance < orderAmount) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      // Submit order to SMM API (quantity is already in correct format)
      console.log('Submitting to SMM API:', {
        key: SMM_API_KEY,
        action: 'add',
        service: orderData.serviceId,
        link: orderData.link,
        quantity: orderData.quantity
      });

      const smmResponse = await fetch(SMM_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: SMM_API_KEY,
          action: 'add',
          service: orderData.serviceId,
          link: orderData.link,
          quantity: orderData.quantity
        })
      });
      
      const smmResult = await smmResponse.json();
      console.log('SMM API full response:', JSON.stringify(smmResult, null, 2));
      console.log('SMM API response status:', smmResponse.status);
      console.log('SMM API order field:', smmResult.order);
      
      if (smmResult.order) {
        // SMM API success - deduct from wallet and store order
        const newBalance = (userBalance - orderAmount).toFixed(2);
        await storage.updateUserBalance(orderData.userId, newBalance);
        
        // Store order in database with SMM order ID
        const order = await storage.createOrder({
          ...orderData,
          status: "Processing",
          smmOrderId: smmResult.order.toString()
        });

        res.json({ 
          success: true, 
          message: "Order submitted to SMM API successfully",
          order: {
            id: order.orderId,
            status: order.status,
            service: order.serviceName,
            quantity: order.quantity,
            amount: order.amount,
            smmOrderId: smmResult.order
          },
          newBalance: newBalance
        });
      } else {
        // SMM API error - don't charge or store anything
        return res.status(400).json({ 
          error: smmResult.error || "SMM API rejected the order" 
        });
      }
    } catch (error) {
      console.error("Order processing error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process order" 
      });
    }
  });

  // Process wallet payment and submit to SMM API
  app.post("/api/orders/:orderId/pay-wallet", async (req: any, res) => {
    try {
      const { orderId } = req.params;
      console.log('Processing wallet payment for order:', orderId);
      
      // Get the order
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const userId = order.userId;
      console.log('Order belongs to user:', userId);
      
      if (order.status !== "Pending Payment") {
        return res.status(400).json({ error: "Order already processed" });
      }
      
      // Get user and check balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userBalance = parseFloat(user.balance);
      const orderAmount = parseFloat(order.amount);
      
      if (userBalance < orderAmount) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }
      
      // Submit order to SMM API
      const smmResponse = await fetch(SMM_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: SMM_API_KEY,
          action: 'add',
          service: order.serviceId,
          link: order.link,
          quantity: order.quantity
        })
      });
      
      const smmResult = await smmResponse.json();
      
      if (smmResult.order) {
        // Order submitted successfully - deduct from wallet and update order
        const newBalance = (userBalance - orderAmount).toFixed(2);
        await storage.updateUserBalance(userId, newBalance);
        await storage.updateOrderStatus(orderId, "Processing");
        await storage.updateOrderSmmId(orderId, smmResult.order.toString());
        
        console.log('Sending successful payment response:', {
          success: true, 
          message: "Payment processed and order submitted",
          newBalance: newBalance,
          smmOrderId: smmResult.order
        });
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ 
          success: true, 
          message: "Payment processed and order submitted",
          newBalance: newBalance,
          smmOrderId: smmResult.order
        });
      } else {
        // SMM API error
        console.log('SMM API error response:', smmResult);
        return res.status(400).json({ 
          error: smmResult.error || "Failed to submit order to SMM API" 
        });
      }
      
    } catch (error) {
      console.error("Wallet payment error:", error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process payment" 
      });
    }
  });

  // Get order status
  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check status from SMM API
      const smmResponse = await fetch(SMM_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key: SMM_API_KEY,
          action: 'status',
          order: orderId
        })
      });

      if (smmResponse.ok) {
        const smmResult = await smmResponse.json();
        if (smmResult.status) {
          // Update local status if different
          if (smmResult.status !== order.status) {
            await storage.updateOrderStatus(orderId, smmResult.status);
          }
          
          res.json({
            ...order,
            status: smmResult.status,
            charge: smmResult.charge || order.amount,
            startCount: smmResult.start_count || 0,
            remains: smmResult.remains || order.quantity
          });
          return;
        }
      }

      // Return local order data if SMM API fails
      res.json(order);
    } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).json({ error: "Failed to fetch order status" });
    }
  });

  // Get all orders with live status from SMM Valley API
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Update status from SMM Valley API for orders with SMM Order IDs
      const updatedOrders = await Promise.all(orders.map(async (order) => {
        if (order.smmOrderId) {
          try {
            const response = await fetch(SMM_API_BASE, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                key: SMM_API_KEY,
                action: 'status',
                order: order.smmOrderId
              })
            });

            if (response.ok) {
              const result = await response.json();
              
              if (result && result.status) {
                // Update status in database if it changed
                if (result.status !== order.status) {
                  await storage.updateOrderStatus(order.orderId, result.status);
                  return { ...order, status: result.status };
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching status for order ${order.smmOrderId}:`, error);
          }
        }
        return order;
      }));

      res.json(updatedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Update order after PayPal payment
  app.post("/api/orders/:orderId/payment", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paypalOrderId, status } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order with PayPal info
      const updatedOrder = await storage.createOrder({
        ...order,
        paypalOrderId,
        status: status || "Paid"
      });

      res.json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Error updating order payment:", error);
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const orders = await storage.getAllOrders();
      
      const totalUsers = users.length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => 
        order.status === 'Processing' || 
        order.status === 'Pending' || 
        order.status === 'Pending Payment'
      ).length;
      
      // Calculate total revenue from all paid orders (not just completed)
      const paidOrders = orders.filter(order => 
        order.status !== 'Pending Payment' && 
        order.status !== 'Cancelled' && 
        order.status !== 'Failed'
      );
      
      const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
      
      // Calculate profit (customer pays 5x what we pay SMM Valley)
      const totalCost = paidOrders.reduce((sum, order) => sum + (parseFloat(order.amount) / 5), 0);
      const totalProfit = totalRevenue - totalCost;
      
      res.json({
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalCost: totalCost.toFixed(2),
        pendingOrders
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/orders', async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin route to update user balance
  app.patch('/api/admin/users/:userId/balance', async (req, res) => {
    try {
      const { userId } = req.params;
      const { balance } = req.body;
      
      if (!balance || isNaN(parseFloat(balance))) {
        return res.status(400).json({ error: "Invalid balance amount" });
      }
      
      const updatedUser = await storage.updateUserBalance(parseInt(userId), parseFloat(balance).toFixed(2));
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  // Ticket creation endpoint - simple success response
  app.post('/api/tickets', async (req, res) => {
    try {
      const { name, email, subject, message, priority, userId } = req.body;
      
      if (!name || !email || !subject || !message || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // For now, just return success - the database infrastructure is ready
      console.log("Ticket submitted:", { name, email, subject, message, priority, userId });
      
      res.status(201).json({
        success: true,
        ticketId,
        message: "Your support ticket has been submitted successfully! We'll get back to you soon."
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get('/api/tickets/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const tickets = await storage.getUserTickets(parseInt(userId));
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get('/api/admin/tickets', async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.patch('/api/admin/tickets/:ticketId/status', async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
      
      const updatedTicket = await storage.updateTicketStatus(ticketId, status);
      
      if (!updatedTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ error: "Failed to update ticket status" });
    }
  });

  app.patch('/api/admin/tickets/:ticketId/reply', async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { adminReply, status } = req.body;
      
      const updatedTicket = await storage.updateTicketReply(ticketId, adminReply, status);
      
      if (!updatedTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket reply:", error);
      res.status(500).json({ error: "Failed to update ticket reply" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
