import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSanctionSchema, insertPersonalSanctionSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Club sanctions routes
  app.get("/api/club-sanctions", async (req, res) => {
    try {
      const sanctions = await storage.getClubSanctions();
      res.json(sanctions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch club sanctions" });
    }
  });

  app.get("/api/club-sanctions/:id", async (req, res) => {
    try {
      const sanction = await storage.getClubSanction(req.params.id);
      if (!sanction) {
        return res.status(404).json({ error: "Club sanction not found" });
      }
      res.json(sanction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch club sanction" });
    }
  });

  app.post("/api/club-sanctions", async (req, res) => {
    try {
      const validatedData = insertClubSanctionSchema.parse(req.body);
      const sanction = await storage.createClubSanction(validatedData);
      res.status(201).json(sanction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create club sanction" });
    }
  });

  app.put("/api/club-sanctions/:id", async (req, res) => {
    try {
      const validatedData = insertClubSanctionSchema.partial().parse(req.body);
      const sanction = await storage.updateClubSanction(req.params.id, validatedData);
      if (!sanction) {
        return res.status(404).json({ error: "Club sanction not found" });
      }
      res.json(sanction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update club sanction" });
    }
  });

  app.delete("/api/club-sanctions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClubSanction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Club sanction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete club sanction" });
    }
  });

  // Personal sanctions routes
  app.get("/api/personal-sanctions", async (req, res) => {
    try {
      const sanctions = await storage.getPersonalSanctions();
      res.json(sanctions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal sanctions" });
    }
  });

  app.get("/api/personal-sanctions/:id", async (req, res) => {
    try {
      const sanction = await storage.getPersonalSanction(req.params.id);
      if (!sanction) {
        return res.status(404).json({ error: "Personal sanction not found" });
      }
      res.json(sanction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal sanction" });
    }
  });

  app.post("/api/personal-sanctions", async (req, res) => {
    try {
      const validatedData = insertPersonalSanctionSchema.parse(req.body);
      const sanction = await storage.createPersonalSanction(validatedData);
      res.status(201).json(sanction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create personal sanction" });
    }
  });

  app.put("/api/personal-sanctions/:id", async (req, res) => {
    try {
      const validatedData = insertPersonalSanctionSchema.partial().parse(req.body);
      const sanction = await storage.updatePersonalSanction(req.params.id, validatedData);
      if (!sanction) {
        return res.status(404).json({ error: "Personal sanction not found" });
      }
      res.json(sanction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update personal sanction" });
    }
  });

  app.delete("/api/personal-sanctions/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePersonalSanction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Personal sanction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete personal sanction" });
    }
  });

  // Object storage routes for PDF uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading object:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
