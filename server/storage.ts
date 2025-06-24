import { 
  users, 
  projects, 
  brandColors, 
  brandTypography, 
  projectMembers,
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type BrandColor,
  type InsertBrandColor,
  type BrandTypography,
  type InsertBrandTypography,
  type ProjectMember,
  type InsertProjectMember,
  type ProjectWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithDetails(id: number): Promise<ProjectWithDetails | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject & { userId: number }): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Brand color methods
  getProjectColors(projectId: number): Promise<BrandColor[]>;
  createBrandColor(color: InsertBrandColor & { projectId: number }): Promise<BrandColor>;
  updateBrandColor(id: number, color: Partial<InsertBrandColor>): Promise<BrandColor | undefined>;
  deleteBrandColor(id: number): Promise<boolean>;
  
  // Typography methods
  getProjectTypography(projectId: number): Promise<BrandTypography[]>;
  createBrandTypography(typography: InsertBrandTypography & { projectId: number }): Promise<BrandTypography>;
  updateBrandTypography(id: number, typography: Partial<InsertBrandTypography>): Promise<BrandTypography | undefined>;
  deleteBrandTypography(id: number): Promise<boolean>;
  
  // Project member methods
  getProjectMembers(projectId: number): Promise<(ProjectMember & { user: Pick<User, 'id' | 'name' | 'username'> })[]>;
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  updateProjectMemberRole(projectId: number, userId: number, role: string): Promise<ProjectMember | undefined>;
  removeProjectMember(projectId: number, userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectWithDetails(id: number): Promise<ProjectWithDetails | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    
    if (!project) return undefined;

    const [colors, typography, members, owner] = await Promise.all([
      this.getProjectColors(id),
      this.getProjectTypography(id),
      this.getProjectMembers(id),
      this.getUser(project.userId)
    ]);

    return {
      ...project,
      colors,
      typography,
      members,
      owner: owner ? { id: owner.id, name: owner.name, username: owner.username } : { id: project.userId, name: '', username: '' }
    };
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async createProject(project: InsertProject & { userId: number }): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Brand color methods
  async getProjectColors(projectId: number): Promise<BrandColor[]> {
    return await db
      .select()
      .from(brandColors)
      .where(eq(brandColors.projectId, projectId))
      .orderBy(brandColors.order);
  }

  async createBrandColor(color: InsertBrandColor & { projectId: number }): Promise<BrandColor> {
    const [newColor] = await db.insert(brandColors).values(color).returning();
    return newColor;
  }

  async updateBrandColor(id: number, color: Partial<InsertBrandColor>): Promise<BrandColor | undefined> {
    const [updatedColor] = await db
      .update(brandColors)
      .set(color)
      .where(eq(brandColors.id, id))
      .returning();
    return updatedColor || undefined;
  }

  async deleteBrandColor(id: number): Promise<boolean> {
    const result = await db.delete(brandColors).where(eq(brandColors.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Typography methods
  async getProjectTypography(projectId: number): Promise<BrandTypography[]> {
    return await db
      .select()
      .from(brandTypography)
      .where(eq(brandTypography.projectId, projectId));
  }

  async createBrandTypography(typography: InsertBrandTypography & { projectId: number }): Promise<BrandTypography> {
    const [newTypography] = await db.insert(brandTypography).values(typography).returning();
    return newTypography;
  }

  async updateBrandTypography(id: number, typography: Partial<InsertBrandTypography>): Promise<BrandTypography | undefined> {
    const [updatedTypography] = await db
      .update(brandTypography)
      .set(typography)
      .where(eq(brandTypography.id, id))
      .returning();
    return updatedTypography || undefined;
  }

  async deleteBrandTypography(id: number): Promise<boolean> {
    const result = await db.delete(brandTypography).where(eq(brandTypography.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project member methods
  async getProjectMembers(projectId: number): Promise<(ProjectMember & { user: Pick<User, 'id' | 'name' | 'username'> })[]> {
    return await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        invitedAt: projectMembers.invitedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        }
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));
  }

  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db.insert(projectMembers).values(member).returning();
    return newMember;
  }

  async updateProjectMemberRole(projectId: number, userId: number, role: string): Promise<ProjectMember | undefined> {
    const [updatedMember] = await db
      .update(projectMembers)
      .set({ role })
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .returning();
    return updatedMember || undefined;
  }

  async removeProjectMember(projectId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
