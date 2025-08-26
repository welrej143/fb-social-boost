# Overview

This is a Facebook social media boost service platform that allows users to purchase engagement services like page likes, followers, post likes, reactions, and video views. The application provides a complete e-commerce experience with user authentication, service ordering, payment processing via PayPal, and administrative tools for managing users and orders.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (January 2025)

## Payment System Migration (January 26, 2025)
- **Removed PayPal Integration**: Completely removed PayPal payment system to focus on Philippines market
- **Implemented GCash Manual Processing**: Added GCash payment system with manual processing via WhatsApp
- **Currency Display**: ALL amounts now shown in Philippine Pesos (PHP) only - no USD amounts visible
- **Exchange Rate**: Fixed rate of 1 USD = 60 PHP for backend calculations
- **Contact Information**: 
  - GCash: JE***L N. (09678361036)
  - WhatsApp: +639678361036 for payment confirmations
- **Processing Time**: Manual processing within 2-24 hours
- **Discount Update**: Changed maximum discount from 66% to 50%
  - 5000+ items: 20% discount
  - 10000+ items: 30% discount  
  - 20000+ items: 50% discount
- **Minimum Deposit**: Set to $5 (₱300 PHP) 
- **Login Persistence**: Extended session to 30 days with rolling refresh
- **Timer Persistence**: Flash sale countdown now persists across page refreshes using localStorage

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. It implements a modern component-based architecture with:
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
The backend follows a REST API pattern built with Express.js and TypeScript:
- **Web Framework**: Express.js with TypeScript for type safety
- **Database ORM**: Drizzle ORM for PostgreSQL database operations
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **Session Storage**: Express sessions with PostgreSQL store for production
- **File Structure**: Modular separation with dedicated files for routes, storage, and authentication

## Data Storage Solutions
The application uses PostgreSQL as the primary database with the following key tables:
- **Users**: Stores user accounts with email authentication and balance tracking
- **Services**: Facebook engagement services with pricing and limits
- **Orders**: Purchase records linking users to services with status tracking
- **Deposits**: Payment records for account balance top-ups
- **Tickets**: Support ticket system for customer service
- **Chat System**: Real-time messaging between users and administrators

## Authentication and Authorization
- **Session-based Authentication**: Uses Express sessions with secure HTTP-only cookies
- **Password Security**: bcrypt hashing with salt rounds for password protection
- **Role-based Access**: Admin routes protected with authentication middleware
- **Development vs Production**: Different session stores for development (memory) and production (PostgreSQL)

## External Dependencies

### Payment Processing
- **PayPal Integration**: Complete PayPal SDK implementation for payment processing
- **Order Management**: PayPal order creation and capture workflow
- **Balance System**: Account credit system for purchasing services

### SMM Service Provider
- **SMM Valley API**: Third-party service provider for Facebook engagement services
- **Service Synchronization**: Automated fetching and updating of available services
- **Order Fulfillment**: API integration for placing orders with the service provider

### Communication Services
- **SendGrid**: Email service integration for notifications and support
- **Slack API**: Administrative notifications and monitoring
- **Live Chat System**: Real-time customer support chat functionality

### Analytics and Monitoring
- **Google Analytics**: Conversion tracking and user behavior analysis
- **Crisp Chat**: Customer support chat widget integration
- **PayPal Click Tracking**: Analytics for payment button interactions

### Development and Deployment
- **Replit Integration**: Development environment with live preview capabilities
- **Environment Configuration**: Separate configurations for development and production
- **SSL Support**: Database connections with SSL for production environments