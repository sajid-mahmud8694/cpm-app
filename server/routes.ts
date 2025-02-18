import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Services routes
  app.get("/api/services", async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.patch("/api/services/:id", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    
    const serviceId = parseInt(req.params.id);
    const updates = req.body;
    const service = await storage.updateService(serviceId, updates);
    res.json(service);
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const orderData = insertOrderSchema.parse(req.body);
    const order = await storage.createOrder({
      ...orderData,
      customerId: req.user.id
    });
    res.status(201).json(order);
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.user || !["editor", "admin"].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }
    
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    const order = await storage.updateOrderStatus(orderId, status);
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}
