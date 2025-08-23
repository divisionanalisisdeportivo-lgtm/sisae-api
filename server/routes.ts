import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClubSanctionSchema, insertPersonalSanctionSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";
import { setupAuth, requireAuth } from "./auth";
import { backupService } from "./backup";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Club sanctions routes
  app.get("/api/club-sanctions", requireAuth, async (req, res) => {
    try {
      const sanctions = await storage.getClubSanctions();
      res.json(sanctions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch club sanctions" });
    }
  });

  app.get("/api/club-sanctions/:id", requireAuth, async (req, res) => {
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

  app.post("/api/club-sanctions", requireAuth, async (req, res) => {
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

  app.put("/api/club-sanctions/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/club-sanctions/:id", requireAuth, async (req, res) => {
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
  app.get("/api/personal-sanctions", requireAuth, async (req, res) => {
    try {
      const sanctions = await storage.getPersonalSanctions();
      res.json(sanctions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal sanctions" });
    }
  });

  app.get("/api/personal-sanctions/:id", requireAuth, async (req, res) => {
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

  app.post("/api/personal-sanctions", requireAuth, async (req, res) => {
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

  app.put("/api/personal-sanctions/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/personal-sanctions/:id", requireAuth, async (req, res) => {
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

  // Monthly PDF report for expired unreported personal sanctions
  app.get("/api/tribuna-segura-report", requireAuth, async (req, res) => {
    try {
      const expiredUnreportedSanctions = await storage.getExpiredUnreportedPersonalSanctions();
      const reportData = {
        title: "Reporte Mensual de Tribuna Segura - Sanciones Cumplidas",
        date: new Date().toLocaleDateString('es-AR'),
        totalSanctions: expiredUnreportedSanctions.length,
        sanctions: expiredUnreportedSanctions
      };
      
      res.json(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Mark sanctions as reported after PDF generation
  app.post("/api/mark-reported", requireAuth, async (req, res) => {
    try {
      const { sanctionIds } = req.body;
      if (!Array.isArray(sanctionIds)) {
        return res.status(400).json({ error: "sanctionIds must be an array" });
      }
      
      await storage.markPersonalSanctionsAsReported(sanctionIds);
      res.json({ success: true, message: `Marked ${sanctionIds.length} sanctions as reported` });
    } catch (error) {
      console.error("Error marking sanctions as reported:", error);
      res.status(500).json({ error: "Failed to mark sanctions as reported" });
    }
  });

  // Object storage routes for PDF uploads
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading object:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  // Backup routes
  app.post("/api/backup/create", requireAuth, async (req, res) => {
    try {
      const backupPath = await backupService.createBackup();
      res.json({ 
        success: true, 
        message: "Respaldo creado exitosamente",
        backupPath,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  app.get("/api/backup/list", requireAuth, async (req, res) => {
    try {
      const backups = await backupService.getBackupList();
      res.json({
        success: true,
        backups: backups.map(backup => ({
          ...backup,
          formattedDate: new Date(backup.date).toLocaleString('es-AR'),
          formattedSize: `${Math.round(backup.size / 1024)} KB`
        }))
      });
    } catch (error) {
      console.error("Error listing backups:", error);
      res.status(500).json({ error: "Failed to list backups" });
    }
  });

  app.get("/api/backup/:fileName", requireAuth, async (req, res) => {
    try {
      const backupData = await backupService.getBackupData(req.params.fileName);
      if (!backupData) {
        return res.status(404).json({ error: "Backup not found" });
      }
      res.json(backupData);
    } catch (error) {
      console.error("Error getting backup data:", error);
      res.status(500).json({ error: "Failed to get backup data" });
    }
  });

  app.post("/api/backup/restore", requireAuth, async (req, res) => {
    try {
      const { fileName } = req.body;
      if (!fileName) {
        return res.status(400).json({ success: false, message: "Nombre de archivo requerido" });
      }
      
      const result = await backupService.restoreFromBackup(fileName);
      res.json(result);
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ success: false, message: "Error al restaurar respaldo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
