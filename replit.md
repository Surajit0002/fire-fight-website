# FireFight Arena - Gaming Tournament Platform

## Overview

FireFight Arena is a comprehensive gaming tournament platform that enables players to participate in competitive esports tournaments, manage teams, and earn prizes. The platform supports popular mobile games like BGMI, Free Fire, and COD Mobile, providing features for tournament discovery, team management, wallet transactions, and real-time match tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with custom design system featuring fire-themed gradients and dark mode
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: OpenID Connect with Replit authentication integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Middleware**: Custom logging, error handling, and authentication middleware

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: 
  - Users with wallet balances and KYC status
  - Teams with member management and roles
  - Tournaments with entry fees and prize pools
  - Matches with result tracking
  - Wallet transactions for payment history

### Authentication & Authorization
- **Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Security**: HTTP-only cookies with secure flags for production
- **User Management**: Profile management with KYC verification support
- **Admin Controls**: Role-based access for administrative functions

### Real-time Features
- **WebSocket Server**: Integrated WebSocket support for live updates
- **Live Notifications**: Tournament updates, match results, and payment confirmations
- **Live Matches**: Real-time match status and result broadcasting

### File Structure
- `/client` - React frontend application
- `/server` - Express.js backend server
- `/shared` - Shared TypeScript schemas and types
- Component organization follows feature-based structure with reusable UI components

## External Dependencies

### Payment Processing
- **Stripe Integration**: Complete payment processing with webhooks for wallet top-ups
- **Wallet System**: Internal balance management with transaction history
- **Withdrawal Support**: Admin-managed withdrawal processing

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connection Pooling**: @neondatabase/serverless for optimized connections

### Development Tools
- **Replit Integration**: Development environment with hot reloading and error overlays
- **Vite Plugins**: Development banner, cartographer, and runtime error handling

### UI/UX Libraries
- **Radix UI**: Comprehensive component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management
- **Date-fns**: Date manipulation and formatting utilities

### Authentication & Security
- **OpenID Client**: Replit authentication integration
- **Passport.js**: Authentication middleware with OpenID strategy
- **Connect-pg-simple**: PostgreSQL session store for Express

### Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time features
- **Client-side WebSocket Hooks**: Custom React hooks for WebSocket integration

### Form Management
- **React Hook Form**: Performant form library with validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod