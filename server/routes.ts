import type { Express } from "express";
import { createServer, type Server } from "http";
import { json } from "express";
import { storage } from "./storage";
import { getSession, isAuthenticated, hashPassword, comparePassword } from "./auth";
import { insertOrderSchema, insertDepositSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

const SMM_API_BASE = "https://smmvaly.com/api/v2";
const SMM_API_KEY = "55265fdd0afb3d0a3e9df2b241b266c3";

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
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Create session
      req.session.userId = user.id;
      req.session.userEmail = user.email;

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

      // Create session - convert string ID to number
      req.session.userId = parseInt(user.id);
      req.session.userEmail = user.email;

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

  // Get all services with current rates
  app.get("/api/services", async (req, res) => {
    try {
      // Fetch fresh rates from SMM API
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

      // Process each Facebook service
      for (const [serviceId, serviceName] of Object.entries(FACEBOOK_SERVICES)) {
        const smmService = smmServices.find((s: any) => s.service === serviceId);
        
        if (smmService) {
          // Calculate our rate (SMM rate * 5 for profit)
          const ourRate = (parseFloat(smmService.rate) * 5).toFixed(2);
          
          // Store/update in our storage
          await storage.createOrUpdateService({
            serviceId,
            name: serviceName,
            rate: ourRate
          });

          facebookServices.push({
            serviceId,
            name: serviceName,
            rate: ourRate,
            originalRate: smmService.rate,
            minOrder: smmService.min || 100,
            maxOrder: smmService.max || 100000
          });
        } else {
          facebookServices.push({
            serviceId,
            name: serviceName,
            rate: "N/A",
            originalRate: "N/A",
            minOrder: 1000,
            maxOrder: 100000
          });
        }
      }

      res.json(facebookServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req: any, res) => {
    try {
      console.log('Creating order with data:', req.body);
      
      // Validate the order data directly (userId should be included from frontend)
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

      // Create order in our storage with pending payment status
      const order = await storage.createOrder({
        ...orderData,
        status: "Pending Payment"
      });

      res.json({ 
        success: true, 
        order: {
          id: order.orderId,
          status: order.status,
          service: order.serviceName,
          quantity: order.quantity,
          amount: order.amount
        }
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to create order" 
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
        
        return res.json({ 
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

  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
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

  const httpServer = createServer(app);
  return httpServer;
}
