import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  category: text("category"),
  description: text("description"),
  logoUrl: text("logo_url"),
  toneOfVoice: text("tone_of_voice"),
  usageGuidelines: text("usage_guidelines"),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brandColors = pgTable("brand_colors", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  hexCode: text("hex_code").notNull(),
  usage: text("usage"),
  order: integer("order").default(0),
});

export const brandTypography = pgTable("brand_typography", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  type: text("type").notNull(), // 'primary' or 'secondary'
  fontFamily: text("font_family").notNull(),
  googleFontUrl: text("google_font_url"),
  weights: text("weights").array(),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("viewer"), // 'admin', 'contributor', 'viewer'
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  projectMemberships: many(projectMembers),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.userId], references: [users.id] }),
  colors: many(brandColors),
  typography: many(brandTypography),
  members: many(projectMembers),
}));

export const brandColorsRelations = relations(brandColors, ({ one }) => ({
  project: one(projects, { fields: [brandColors.projectId], references: [projects.id] }),
}));

export const brandTypographyRelations = relations(brandTypography, ({ one }) => ({
  project: one(projects, { fields: [brandTypography.projectId], references: [projects.id] }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandColorSchema = createInsertSchema(brandColors).omit({
  id: true,
  projectId: true,
});

export const insertBrandTypographySchema = createInsertSchema(brandTypography).omit({
  id: true,
  projectId: true,
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  invitedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type BrandColor = typeof brandColors.$inferSelect;
export type InsertBrandColor = z.infer<typeof insertBrandColorSchema>;
export type BrandTypography = typeof brandTypography.$inferSelect;
export type InsertBrandTypography = z.infer<typeof insertBrandTypographySchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;

// Extended types for API responses
export type ProjectWithDetails = Project & {
  colors: BrandColor[];
  typography: BrandTypography[];
  owner: Pick<User, 'id' | 'name' | 'username'>;
  members: (ProjectMember & { user: Pick<User, 'id' | 'name' | 'username'> })[];
};
