import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertProjectSchema, insertBrandColorSchema, insertBrandTypographySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Auth check - isAuthenticated:", req.isAuthenticated?.());
    console.log("Auth check - user:", req.user);
    console.log("Auth check - session:", req.session);
    
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      console.log("Authentication failed");
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Project routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjectsByUser(req.user!.id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectWithDetails(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user has access to this project
      if (project.userId !== req.user!.id) {
        // Check if user is a member
        const members = await storage.getProjectMembers(projectId);
        const isMember = members.some(member => member.userId === req.user!.id);
        if (!isMember) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      console.log("Creating project with data:", req.body);
      console.log("User:", req.user);
      
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...validatedData,
        userId: req.user!.id
      });
      
      console.log("Project created:", project);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      
      // Check ownership
      const existingProject = await storage.getProject(projectId);
      if (!existingProject || existingProject.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const project = await storage.updateProject(projectId, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Check ownership
      const existingProject = await storage.getProject(projectId);
      if (!existingProject || existingProject.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteProject(projectId);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Brand color routes
  app.get("/api/projects/:id/colors", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const colors = await storage.getProjectColors(projectId);
      res.json(colors);
    } catch (error) {
      console.error("Error fetching colors:", error);
      res.status(500).json({ message: "Failed to fetch colors" });
    }
  });

  app.post("/api/projects/:id/colors", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = insertBrandColorSchema.parse(req.body);
      
      // Check access
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const color = await storage.createBrandColor({
        ...validatedData,
        projectId
      });
      res.status(201).json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating color:", error);
      res.status(500).json({ message: "Failed to create color" });
    }
  });

  app.put("/api/colors/:id", requireAuth, async (req, res) => {
    try {
      const colorId = parseInt(req.params.id);
      const validatedData = insertBrandColorSchema.partial().parse(req.body);
      
      const color = await storage.updateBrandColor(colorId, validatedData);
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      res.json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating color:", error);
      res.status(500).json({ message: "Failed to update color" });
    }
  });

  app.delete("/api/colors/:id", requireAuth, async (req, res) => {
    try {
      const colorId = parseInt(req.params.id);
      const deleted = await storage.deleteBrandColor(colorId);
      if (!deleted) {
        return res.status(404).json({ message: "Color not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting color:", error);
      res.status(500).json({ message: "Failed to delete color" });
    }
  });

  // Typography routes
  app.get("/api/projects/:id/typography", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const typography = await storage.getProjectTypography(projectId);
      res.json(typography);
    } catch (error) {
      console.error("Error fetching typography:", error);
      res.status(500).json({ message: "Failed to fetch typography" });
    }
  });

  app.post("/api/projects/:id/typography", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = insertBrandTypographySchema.parse(req.body);
      
      // Check access
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const typography = await storage.createBrandTypography({
        ...validatedData,
        projectId
      });
      res.status(201).json(typography);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating typography:", error);
      res.status(500).json({ message: "Failed to create typography" });
    }
  });

  // File upload route
  app.post("/api/upload", requireAuth, upload.single('logo'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Export routes
  app.get("/api/projects/:id/export/css", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectWithDetails(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Generate CSS variables
      let css = `:root {\n`;
      project.colors.forEach(color => {
        const varName = color.name.toLowerCase().replace(/\s+/g, '-');
        css += `  --${varName}: ${color.hexCode};\n`;
      });
      css += `}\n\n`;

      // Add typography
      project.typography.forEach(typo => {
        if (typo.type === 'primary') {
          css += `.font-primary {\n  font-family: '${typo.fontFamily}', sans-serif;\n}\n\n`;
        } else {
          css += `.font-secondary {\n  font-family: '${typo.fontFamily}', monospace;\n}\n\n`;
        }
      });

      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name}-variables.css"`);
      res.send(css);
    } catch (error) {
      console.error("Error exporting CSS:", error);
      res.status(500).json({ message: "Failed to export CSS" });
    }
  });

  app.get("/api/projects/:id/export/json", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectWithDetails(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const brandData = {
        name: project.name,
        tagline: project.tagline,
        category: project.category,
        colors: project.colors.map(color => ({
          name: color.name,
          hex: color.hexCode,
          usage: color.usage
        })),
        typography: project.typography.map(typo => ({
          type: typo.type,
          fontFamily: typo.fontFamily,
          googleFontUrl: typo.googleFontUrl,
          weights: typo.weights
        })),
        voice: {
          tone: project.toneOfVoice,
          guidelines: project.usageGuidelines
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name}-brand.json"`);
      res.json(brandData);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      res.status(500).json({ message: "Failed to export JSON" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
