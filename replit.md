# InterBridge Trans & Trade

## Overview

InterBridge Trans & Trade is a professional B2B service platform connecting businesses directly to Chinese manufacturers and suppliers. The platform emphasizes transparency, credibility, and direct factory access for import/export sourcing, eliminating middlemen from the supply chain. It provides bilingual support, product sourcing, negotiation services, and logistics coordination for clients ranging from small-batch orders to OEM projects.

The application is built as a full-stack web application with an editable content management system, allowing administrators to modify website content in real-time without code deployments.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (January 19, 2026)

**InterBridge Trade Guard & Legal Support:**
- Added comprehensive Trade Guard section for dispute resolution and recovery services
- "Is This You?" scenarios: Golden Sample Bait & Switch, Ghost Manufacturer, Ransom Price Hike
- Recovery & Protection Toolkit: Corporate Background Deep-Dive, On-Site Factory Verification, Legal Demand Letters, Mediation & Negotiation, Asset & Credit Investigation, Recovery Action Plan
- Case Assessment form with dispute type, amount at risk, supplier info, and description fields
- Dispute cases database table with pending/reviewed status tracking
- API endpoints for case submission and admin management

## Previous Updates (January 16, 2026)

**Customer Review System:**
- Added customer review submission page at /submit-review with star ratings, service selection, and feedback form
- Implemented moderation workflow: reviews start as "pending" and require admin approval before display
- Admin reviews management panel with approve/reject actions and shareable review link
- Customer Reviews section on homepage displays only approved reviews with ratings, customer details, and service badges
- Reviews database table with status field (pending/approved/rejected) and full CRUD API routes

## Previous Updates (December 14, 2025)

**Enhanced CMS Features:**
- Added flexible custom section creation with 5 templates: Text Block, Features Grid, Call-to-Action, Testimonial, Image Gallery
- Implemented section management panel with duplicate, delete, reorder, and visibility toggle controls
- Custom sections stored as JSON in siteContent table
- Full inline editing support for custom sections with visual feedback
- Section order persistence and management

**Email Integration:**
- Migrated from Nodemailer to Resend email service
- Contact form submissions now trigger email notifications to Moda232320315@gmail.com
- Requires RESEND_API_KEY secret (user must provide their own API key)
- Email notifications are optional - form submissions are saved to database even if email sending fails

**Domain Setup:**
- Domain interbridge-solutions.com connected via Namecheap DNS records
- A record (34.111.179.208) and TXT verification record configured
- Domain verified in Replit deployment settings
- Note: May take time for DNS propagation to complete fully

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing (SPA architecture)
- **TanStack Query** for server state management and data fetching

**UI Component System**
- **shadcn/ui** component library based on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design system
- Components follow the "new-york" style variant from shadcn/ui
- Custom color scheme with HSL-based theming system supporting light/dark modes

**Design Philosophy**
- Professional B2B aesthetic inspired by Stripe and modern SaaS platforms
- Conversion-focused layouts with clear visual hierarchy
- Typography system using bold/extrabold weights for impact
- Consistent spacing system based on Tailwind's 4px grid (units: 2, 4, 6, 8, 12, 16, 20, 24, 32)
- Gradient backgrounds and backdrop blur effects for modern visual appeal

**State Management**
- React Context API for global state (admin authentication, content management)
- Custom contexts: `AdminContext` for authentication state, `ContentContext` for CMS functionality
- Local component state with React hooks

**CMS System**
- Section visibility toggles with UI indicators
- Section reordering with up/down controls
- Add custom section feature with type selection
- Duplicate and delete controls for custom sections
- Inline editing with visual focus indicators (blue rings)
- Content change tracking with unsaved changes counter

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- HTTP server created with Node's native `http` module
- Middleware stack includes JSON parsing, URL encoding, and request logging

**API Design**
- RESTful API endpoints under `/api` prefix
- Admin authentication endpoints: `/api/admin/login`, `/api/admin/logout`, `/api/admin/verify`
- Content management endpoints for retrieving and updating site content
- Token-based authentication using bearer tokens stored in `localStorage`
- Contact form submission endpoints with email notification trigger

**Session Management**
- Custom session system using database-backed tokens
- Sessions stored in `adminSessions` table with expiration timestamps
- Automatic cleanup of expired sessions
- 24-hour session lifetime

**Email Service**
- Resend API integration for transactional emails
- Requires RESEND_API_KEY environment variable
- Email template with HTML and text fallback
- Contact notifications include: name, email, service interest, and message

**Development vs Production**
- Development mode uses Vite middleware for HMR and SSR of React application
- Production mode serves pre-built static assets from `dist/public`
- Conditional Replit-specific plugins (cartographer, dev-banner) only in development

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- WebSocket-based connection for serverless compatibility
- Connection pooling with `Pool` from Neon driver

**ORM & Schema Management**
- **Drizzle ORM** for type-safe database queries and migrations
- **Drizzle-Zod** integration for automatic schema validation
- Schema defined in `shared/schema.ts` for code sharing between client and server

**Database Schema**

Tables:
1. **users** - Admin user accounts
   - `id` (UUID primary key, auto-generated)
   - `username` (unique text)
   - `password` (text, hashed)

2. **siteContent** - CMS content storage
   - `id` (varchar primary key, semantic content IDs)
   - `content` (text, stores the actual content or JSON for custom sections)
   - `updatedAt` (timestamp, tracks last modification)

3. **adminSessions** - Authentication sessions
   - `id` (UUID primary key, auto-generated)
   - `token` (unique text, bearer token)
   - `createdAt` (timestamp)
   - `expiresAt` (timestamp for automatic expiration)

4. **contactRequests** - Customer inquiry submissions
   - `id` (UUID primary key, auto-generated)
   - `firstName` (text)
   - `lastName` (text)
   - `email` (text)
   - `interestedIn` (text: sourcing, oem, interpretation, qc, other)
   - `message` (text)
   - `createdAt` (timestamp)

**Custom Section Storage**
- Stored in `siteContent` table using key `_custom_sections`
- Value is JSON array of section objects with full configuration
- Section order stored separately in `_section_order` key

**Storage Layer**
- Abstraction via `IStorage` interface for potential future database swaps
- `DatabaseStorage` class implements interface with Drizzle queries
- Supports CRUD operations for users, content, and sessions

### Authentication & Authorization

**Authentication Flow**
1. Admin submits credentials to `/api/admin/login`
2. Server validates against hardcoded credentials (username: "Mirabelle", password: "Mira.112233")
3. On success, generates cryptographically random 32-byte hex token
4. Token stored in database with 24-hour expiration
5. Token returned to client and stored in `localStorage`
6. Subsequent requests include token in `Authorization: Bearer {token}` header

**Authorization Model**
- Single admin user (hardcoded credentials, no user management UI)
- Token-based session verification on protected routes
- Client-side auth state managed via `AdminContext`
- Admin privileges enable edit mode for site content

**Security Considerations**
- Credentials are hardcoded in source (suitable for single-admin MVP)
- No password hashing implemented for the hardcoded admin (users table supports hashed passwords for future expansion)
- Session tokens generated with crypto.randomBytes for sufficient entropy
- Sessions automatically expire after 24 hours

### Content Management System

**Inline Editing System**
- `EditableText` component wraps any text content on the site
- In edit mode, text becomes editable via `contentEditable` HTML attribute
- Changes tracked in `ContentContext` as pending modifications
- Content identified by semantic IDs (e.g., "hero-headline", "service-card-1-title")

**Custom Sections**
- Support for 5 section types: Text Block, Features Grid, Call-to-Action, Testimonial, Image Gallery
- Each section type has customizable title, description, background color, and items
- Sections stored with unique IDs (`custom-{timestamp}-{random}`)
- Full CRUD operations: create, read, update, delete
- Duplicate functionality to quickly create variations

**Content Persistence**
- Pending changes stored in context state (not immediately saved)
- Admin must explicitly trigger save to persist all changes
- Batch update via `/api/content` endpoint (one request for all changes)
- Content stored as plain text in database, JSON for structured data
- Default values provided inline for missing content

**Edit Mode UX**
- Toggle switch in admin panel to enable/disable editing
- Section manager sidebar on left showing all sections with controls
- Visual indicators for editable elements (blue rings on focus)
- Unsaved changes tracker with count
- Save/cancel operations for all pending modifications
- Toast notifications for success/error feedback
- Section visibility indicator in sidebar (eye/crossed-eye icon)

## External Dependencies

### Third-Party Services

**Database**
- **Neon PostgreSQL** - Serverless Postgres database
  - Requires `DATABASE_URL` environment variable
  - WebSocket-based connection for serverless environments
  - Auto-scaling and connection pooling

**Email Notifications**
- **Resend** - Transactional email service
  - Target email: Moda232320315@gmail.com
  - Requires `RESEND_API_KEY` secret (user must provide from Resend account)
  - Sends HTML + text emails for contact form submissions
  - If API key not configured, form submissions still save to database but email notifications are skipped
  - Note: Resend starter plan uses `onboarding@resend.dev` sender domain until custom domain verified

**Domain**
- **Namecheap** - Domain registrar for interbridge-solutions.com
  - A record points to Replit IP: 34.111.179.208
  - TXT record for domain verification

### UI Libraries

**Component Primitives**
- **Radix UI** - Unstyled, accessible component primitives
  - Full suite: accordion, dialog, dropdown, popover, tooltip, etc.
  - WAI-ARIA compliant for accessibility
  - Headless architecture styled with Tailwind

**Styling**
- **Tailwind CSS** - Utility-first CSS framework
  - PostCSS for processing
  - Autoprefixer for browser compatibility
  - Custom theme extending default Tailwind tokens

**Icons**
- **Lucide React** - Icon library (imported in attached assets, used throughout UI)

### Development Tools

**Type Safety**
- TypeScript with strict mode enabled
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)
- Shared types between client and server

**Build Tools**
- **esbuild** - Fast bundler for server code (production builds)
- **Vite** - Frontend build tool and dev server
- **tsx** - TypeScript execution for Node.js (development)

**Code Quality**
- TSC for type checking (`npm run check`)
- No linting configuration present in repository

**Replit Integration**
- `@replit/vite-plugin-runtime-error-modal` - Error overlay in development
- `@replit/vite-plugin-cartographer` - Code navigation (dev only)
- `@replit/vite-plugin-dev-banner` - Development banner (dev only)

### Runtime Dependencies

**Server**
- `express` - Web server framework
- `ws` - WebSocket client (required by Neon driver)

**Data & Validation**
- `drizzle-orm` - Database ORM
- `drizzle-zod` - Schema validation
- `zod` - TypeScript-first schema validation

**Client State**
- `@tanstack/react-query` - Async state management
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation integration

**Utilities**
- `clsx` & `tailwind-merge` - Conditional CSS class handling
- `class-variance-authority` - Component variant utilities
- `date-fns` - Date manipulation
- `nanoid` - Unique ID generation

## Known Issues & Notes

- Domain DNS propagation may take 24-48 hours after configuration
- Custom domain routing (www subdomain) may require additional Namecheap DNS records
- Email sender from Resend uses default `onboarding@resend.dev` until custom domain verified
- No custom email domain verification yet - Resend account needs to be configured
