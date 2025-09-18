import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertSignatureSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents/upload", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, clientEmail } = req.body;
      
      const documentData = {
        title: title || req.file.originalname,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        status: "draft" as const,
        clientEmail: clientEmail || null,
        signatureData: null,
        secureToken: null,
        templateId: null,
      };

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const document = await storage.updateDocument(id, updates);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.post("/api/documents/:id/generate-link", async (req, res) => {
    try {
      const { id } = req.params;
      const { clientEmail } = req.body;

      const secureToken = randomUUID();
      const document = await storage.updateDocument(id, {
        secureToken,
        clientEmail,
        status: "pending",
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const signingUrl = `${req.protocol}://${req.get("host")}/sign/${secureToken}`;
      res.json({ signingUrl, document });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate signing link" });
    }
  });

  app.get("/api/documents/sign/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const document = await storage.getDocumentBySecureToken(token);

      if (!document) {
        return res.status(404).json({ error: "Document not found or link expired" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document for signing" });
    }
  });

  app.post("/api/documents/sign/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { signatureData } = req.body;

      const document = await storage.getDocumentBySecureToken(token);
      if (!document) {
        return res.status(404).json({ error: "Document not found or link expired" });
      }

      const updatedDocument = await storage.updateDocument(document.id, {
        signatureData,
        status: "signed",
        signedAt: new Date(),
      });

      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ error: "Failed to sign document" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = category 
        ? await storage.getTemplatesByCategory(category as string)
        : await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, clientEmail } = req.body;

      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const documentData = {
        title: title || template.title,
        originalFilename: `${template.title}.pdf`,
        filePath: template.filePath,
        fileSize: 0, // Will be set when actual file is processed
        status: "draft" as const,
        clientEmail: clientEmail || null,
        signatureData: null,
        secureToken: null,
        templateId: id,
      };

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to use template" });
    }
  });

  // Signature routes
  app.post("/api/signatures", async (req, res) => {
    try {
      const signatureData = insertSignatureSchema.parse(req.body);
      const signature = await storage.createSignature(signatureData);
      res.json(signature);
    } catch (error) {
      res.status(400).json({ error: "Invalid signature data" });
    }
  });

  app.get("/api/signatures/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const signatures = await storage.getSignaturesByUser(userId);
      res.json(signatures);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch signatures" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      const totalDocuments = documents.length;
      const pendingSignatures = documents.filter(doc => doc.status === "pending").length;
      const completed = documents.filter(doc => doc.status === "signed").length;
      const templates = await storage.getAllTemplates();
      const templatesUsed = documents.filter(doc => doc.templateId).length;

      res.json({
        totalDocuments,
        pendingSignatures,
        completed,
        templatesUsed: templatesUsed,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
