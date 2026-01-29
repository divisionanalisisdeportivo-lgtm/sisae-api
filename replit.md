# Overview

SISAE (Sistema Integral de Sanciones y Estadísticas) is a comprehensive sports sanctions management system designed for sports clubs in Córdoba Province, Argentina. The application provides a modern web interface for managing disciplinary sanctions for both clubs and individual athletes, with features for filtering, searching, and tracking sanctions across multiple sports categories.

The system is built as a full-stack web application with a React frontend and Express.js backend, designed to handle sports sanctions management with offline capabilities and automated backups.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Form Handling**: React Hook Form with Zod for validation
- **Styling**: Tailwind CSS with custom SISAE brand colors and responsive design

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with CRUD operations for sanctions management
- **Data Layer**: In-memory storage with Map-based data structures for development
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling with structured error responses
- **Development**: Hot reload with Vite middleware integration

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Separate tables for club sanctions and personal sanctions
- **Fields**: Comprehensive sanction tracking including dates, sports, locations, and observations
- **Primary Keys**: UUID-based identifiers for all entities

## Component Architecture
- **Design System**: shadcn/ui components with consistent theming
- **Modal System**: Dialog components for creating/editing sanctions
- **Data Display**: Responsive cards and lists with real-time filtering
- **Form Components**: Reusable form inputs with validation feedback

# External Dependencies

## Database
- **Primary**: PostgreSQL (via Drizzle ORM configuration)
- **Development**: In-memory storage using JavaScript Maps
- **Connection**: Neon Database serverless PostgreSQL expected in production

## UI Libraries
- **Component Library**: Radix UI primitives via shadcn/ui
- **Icons**: Font Awesome 6.0 and Lucide React icons
- **Styling**: Tailwind CSS with custom configuration
- **Forms**: React Hook Form with Hookform Resolvers for Zod integration

## Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript with strict configuration
- **Development**: Replit-specific plugins for development environment integration

## Data Management
- **Query Client**: TanStack React Query for caching and synchronization
- **Validation**: Zod for runtime type checking and schema validation
- **Date Handling**: date-fns for date manipulation and formatting

The system supports 25+ sports categories including traditional sports (football, basketball), combat sports (boxing, martial arts), regional Argentine sports (polo, pato), and emerging sports (paddle, crossfit). The architecture supports both online and offline operation with automatic data synchronization.