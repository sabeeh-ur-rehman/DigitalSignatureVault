import { type User, type InsertUser, type Document, type InsertDocument, type Template, type InsertTemplate, type Signature, type InsertSignature } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document methods
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentBySecureToken(token: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Template methods
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Signature methods
  getSignaturesByUser(userId: string): Promise<Signature[]>;
  createSignature(signature: InsertSignature): Promise<Signature>;
  getSignature(id: string): Promise<Signature | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, Document>;
  private templates: Map<string, Template>;
  private signatures: Map<string, Signature>;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.templates = new Map();
    this.signatures = new Map();
    this.initializeTemplates();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document methods
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentBySecureToken(token: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.secureToken === token,
    );
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: now,
      signedAt: null,
      status: insertDocument.status || "draft",
      clientEmail: insertDocument.clientEmail || null,
      signatureData: insertDocument.signatureData || null,
      secureToken: insertDocument.secureToken || null,
      templateId: insertDocument.templateId || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument: Document = {
      ...document,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Template methods
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.category === category
    );
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      description: insertTemplate.description || null,
      thumbnailPath: insertTemplate.thumbnailPath || null,
    };
    this.templates.set(id, template);
    return template;
  }

  // Signature methods
  async getSignaturesByUser(userId: string): Promise<Signature[]> {
    return Array.from(this.signatures.values()).filter(
      (signature) => signature.userId === userId
    );
  }

  async createSignature(insertSignature: InsertSignature): Promise<Signature> {
    const id = randomUUID();
    const signature: Signature = {
      ...insertSignature,
      id,
      createdAt: new Date(),
      userId: insertSignature.userId || null,
      signatureText: insertSignature.signatureText || null,
    };
    this.signatures.set(id, signature);
    return signature;
  }

  async getSignature(id: string): Promise<Signature | undefined> {
    return this.signatures.get(id);
  }

  private initializeTemplates() {
    const defaultTemplates: Template[] = [
      {
        id: randomUUID(),
        title: "Service Agreement",
        description: "Professional service contract template with signature fields",
        category: "contracts",
        filePath: "/templates/service-agreement.pdf",
        thumbnailPath: "/templates/thumbs/service-agreement.png",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Non-Disclosure Agreement",
        description: "Standard NDA template for confidential business relationships",
        category: "ndas",
        filePath: "/templates/nda.pdf",
        thumbnailPath: "/templates/thumbs/nda.png",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Employment Contract",
        description: "Comprehensive employment agreement with terms and conditions",
        category: "contracts",
        filePath: "/templates/employment-contract.pdf",
        thumbnailPath: "/templates/thumbs/employment-contract.png",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Freelance Contract",
        description: "Independent contractor agreement for project-based work",
        category: "contracts",
        filePath: "/templates/freelance-contract.pdf",
        thumbnailPath: "/templates/thumbs/freelance-contract.png",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Partnership Agreement",
        description: "Business partnership contract with profit sharing terms",
        category: "contracts",
        filePath: "/templates/partnership-agreement.pdf",
        thumbnailPath: "/templates/thumbs/partnership-agreement.png",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Consulting Agreement",
        description: "Professional consulting services contract template",
        category: "contracts",
        filePath: "/templates/consulting-agreement.pdf",
        thumbnailPath: "/templates/thumbs/consulting-agreement.png",
        createdAt: new Date(),
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

export const storage = new MemStorage();
