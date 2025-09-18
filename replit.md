# Digital Document Management Platform

## Overview

This is a full-stack digital document management platform focused on electronic signature workflows. The application allows managers to upload PDF documents, create signing links for clients, and manage the entire document signing lifecycle. Built as a React-based single-page application with an Express.js backend, it provides a complete solution for digital document workflows without requiring user authentication for the signing process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas
- **File Handling**: React Dropzone for PDF upload functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints for document and template management
- **File Storage**: Local filesystem storage with multer for file uploads
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (prepared for database integration)

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Four main entities - users, documents, templates, and signatures
- **Database**: Currently using in-memory storage with Neon Database serverless PostgreSQL ready for production
- **Migration**: Drizzle Kit for schema migrations

### Key Features
- **Document Upload**: PDF-only uploads with 10MB size limit and validation
- **Template System**: Categorized document templates (contracts, invoices, proposals, NDAs, receipts)
- **Signature Workflow**: Two-mode signature creation (drawing pad and text input)
- **Secure Links**: Token-based secure signing URLs for client access without authentication
- **Status Tracking**: Document lifecycle management (draft, pending, signed, completed)

### Security Considerations
- **File Validation**: Strict PDF MIME type checking and size limits
- **Secure Tokens**: UUID-based secure tokens for client signing links
- **CORS**: Configured for secure cross-origin requests
- **Input Sanitization**: Zod schema validation for all API inputs

### Development Tooling
- **Build**: Vite with ESBuild for production bundling
- **Type Checking**: TypeScript strict mode enabled
- **Hot Reload**: Vite HMR with Replit-specific development plugins
- **Code Quality**: ESLint and Prettier configuration implied through project structure

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: Vite plugin for React support
- **express**: Web application framework for Node.js
- **typescript**: Static type checking for JavaScript

### Database and ORM
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Schema migration and management tool
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **@radix-ui/react-**: Complete suite of accessible React components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight React router

### Form Handling and Validation
- **react-hook-form**: Performant forms library
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod

### File Handling
- **multer**: Multipart form data handling for file uploads
- **react-dropzone**: File upload component with drag-and-drop

### Development and Build Tools
- **vite**: Fast build tool and development server
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution and REPL for Node.js
- **@replit/vite-plugin-**: Replit-specific development enhancements

### Utility Libraries
- **date-fns**: Modern date utility library
- **nanoid**: URL-safe unique string ID generator
- **lucide-react**: Beautiful and consistent icon pack