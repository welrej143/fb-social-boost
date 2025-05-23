import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
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
  
  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
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

  // Create new order (before payment)
  app.post("/api/orders", async (req, res) => {
    try {
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

      // Create order in our storage with "Pending Payment" status
      // DO NOT submit to SMM API yet - wait for payment confirmation
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

  // Process payment and submit to SMM API
  app.post("/api/orders/:orderId/payment", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paypalOrderId } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status !== "Pending Payment") {
        return res.status(400).json({ error: "Order already processed" });
      }

      // NOW submit to SMM API after payment confirmation
      const smmResponse = await fetch(SMM_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key: SMM_API_KEY,
          action: 'add',
          service: order.serviceId,
          link: order.link,
          quantity: order.quantity.toString()
        })
      });

      if (!smmResponse.ok) {
        // Payment was successful but SMM API failed - mark as paid but needs manual processing
        await storage.updateOrderStatus(orderId, "Paid - Manual Processing Required");
        return res.status(500).json({ 
          error: "Payment successful but service submission failed. Contact support.",
          order: { ...order, status: "Paid - Manual Processing Required" }
        });
      }

      const smmResult = await smmResponse.json();

      if (smmResult.order) {
        // Update order with SMM order ID and mark as processing
        const updatedOrder = await storage.updateOrderStatus(orderId, "Processing");
        
        res.json({ 
          success: true, 
          order: {
            ...updatedOrder,
            paypalOrderId,
            smmOrderId: smmResult.order.toString()
          }
        });
      } else {
        // Payment successful but SMM API returned error
        await storage.updateOrderStatus(orderId, "Paid - Manual Processing Required");
        res.status(500).json({ 
          error: smmResult.error || "Service submission failed after payment. Contact support.",
          order: { ...order, status: "Paid - Manual Processing Required" }
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
