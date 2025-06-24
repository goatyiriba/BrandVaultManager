# BrandVault - Brand Identity Management Application

## Overview

BrandVault is a full-stack web application for managing brand identity assets including logos, color palettes, typography, and usage guidelines. It's built as a collaborative platform where teams can create, manage, and share brand guidelines across multiple projects.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Material Design-inspired theme
- **State Management**: TanStack Query for server state, React hooks for local state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Authentication**: Passport.js with local strategy and express-session
- **File Upload**: Multer for handling image uploads
- **Password Security**: Node.js crypto module with scrypt hashing

### Database Layer
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL via Neon serverless
- **Schema**: Centralized schema definitions in `/shared/schema.ts`
- **Session Store**: PostgreSQL-backed session storage via connect-pg-simple

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with scrypt and salt
- Protected routes with authentication middleware
- User registration and login functionality

### Project Management
- Multi-tenant project structure with user ownership
- Project categories (mobile app, web app, e-commerce, SaaS)
- Project collaboration through member management
- Real-time project updates via query invalidation

### Brand Asset Management
- **Logo Upload**: Image file handling with validation (JPEG, PNG, SVG, WebP)
- **Color Palette**: Custom color picker with hex codes and usage descriptions
- **Typography**: Google Fonts integration with multiple font weights
- **Guidelines**: Rich text fields for tone of voice and usage guidelines

### File Storage
- Local file system storage in `/uploads` directory
- File type validation and size limits (5MB)
- Unique filename generation to prevent conflicts

## Data Flow

1. **Authentication Flow**: User logs in → Passport validates credentials → Session created → Protected routes accessible
2. **Project Creation**: User creates project → Form validation → Database insertion → Real-time UI update
3. **Asset Upload**: File selected → Validation → Multer processing → File saved → URL returned to client
4. **Brand Management**: Asset creation/update → Database transaction → Query cache invalidation → UI refresh

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **passport**: Authentication middleware
- **multer**: File upload handling
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized React bundle to `/dist/public`
- Backend: esbuild bundles Node.js server to `/dist/index.js`
- Static files served from build output directory

### Environment Configuration
- **Development**: `npm run dev` - runs tsx with hot reload
- **Production**: `npm run build && npm run start` - builds and serves optimized bundles
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Session**: Requires `SESSION_SECRET` for secure session management

### Replit Integration
- Configured for Replit autoscale deployment
- PostgreSQL module enabled for database provisioning
- Development server runs on port 5000 with proxy configuration
- File upload directory automatically created on startup

## Changelog
- June 24, 2025. Initial setup
- June 24, 2025. Added error handling for unhandled promise rejections
- June 24, 2025. Simplified navigation (removed Team/Export), prepared for Vercel deployment

## User Preferences

Preferred communication style: Simple, everyday language.
Focus on dashboard and project creation only - removed team management and export features.
Target deployment platform: Vercel.