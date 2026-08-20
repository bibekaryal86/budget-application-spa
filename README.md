# Personal Expenses Tracking System

## Overview

A modern, responsive single-page application built with React and TypeScript for managing personal budget and expense
tracking. The system consists of two components:

- **Frontend SPA**: A React-based user interface for tracking budgets, expenses, and financial data
- **Backend BFF (Backend for Frontend)**: A Node.js/Express proxy server that sits between the frontend and upstream
  backend services, handling CORS and routing

This is the frontend for Budget Application [https://github.com/bibekaryal86/budget-application]

## Features

### Core Functionality

- Platform Management: Create, read, update, and delete application platforms
- Profile Management: Configure user profiles and their settings
- Role Management: Define and assign user roles with specific permissions
- Permission Management: Set granular access controls for system actions
- Platform-Role-Permission (PRP) Assignments: Link permissions to roles across different platforms
- Platform-Profile-Role (PPR) Assignments: Link profiles to roles across different platforms
- History Tracking: View audit trails for all entities
- Soft Delete Support: Recover deleted items with superuser privileges

### User Experience

- Responsive design for desktop and mobile
- Dark/Light theme support with persistence
- Real-time form validation
- Comprehensive error handling
- Loading states and progress indicators
- Intuitive navigation and search functionality

### Tech Stack

#### Backend BFF

- Node.js with TypeScript for type-safe server-side code
- Express.js 5 as the HTTP server framework
- node-fetch for proxying requests to upstream services
- CORS middleware for cross-origin request handling
- nodemon for hot-reloading during development

#### Frontend Framework

- React with TypeScript for type-safe development
- Vite for fast development and optimized builds
- React Router v6 for client-side navigation

#### UI Components & Styling

- Material-UI (MUI) v5 for beautiful, accessible components
- Emotion for CSS-in-JS styling
- Responsive Grid System for flexible layouts

#### State Management

- **Zustand** for lightweight, predictable client-side state
  - Used for UI-driven state such as modals, authentication session, alerts, and theme
  - Selector-based subscriptions for minimal re-renders
  - Session Storage persistence for selected stores
- **TanStack Query (React Query)** for server-state management
  - Declarative data fetching and caching
  - Automatic background refetching to keep data fresh
  - Mutation handling for create/update/delete/restore operations
  - Cache invalidation and optimistic updates for responsive UX
- Integrated Devtools for debugging queries and mutations

#### Code Quality & Development

- ESLint for code linting and quality checks
- Prettier for consistent code formatting
- TypeScript for type safety and better developer experience

### Development Tools

- Hot Module Replacement (HMR) for fast development cycles
- Environment Configuration for different deployment stages
- Build Optimization for production deployments

## Architecture

```
Browser (React SPA)
       │
       ▼
Backend BFF (Express, :7201)
  ├── /auth/api/*  ──▶  Auth Service (AUTH_API_BASE_URL)
  └── /api/*       ──▶  Main API Service (API_BASE_URL)
```

The BFF acts as a reverse proxy, forwarding all frontend requests to the appropriate upstream service. It handles:

- **CORS**: Enforces allowed origins, methods, and headers centrally so the frontend does not need to deal with
  cross-origin restrictions
- **Request proxying**: Forwards HTTP method, body, and headers (excluding `host`) to the upstream service
- **Cookie pass-through**: Explicitly forwards `set-cookie` headers to maintain session state
- **Timeout enforcement**: Aborts upstream requests after 15 seconds to prevent hung connections
- **Graceful shutdown**: Drains in-flight requests before shutting down (20-second window)
- **Health check**: `GET /api/tests/ping` returns `{ status: 'ok', timestamp: <number> }`

## Data Flow

The application separates UI state and server state to keep the architecture predictable, scalable, and easy to maintain.

#### User Interaction (UI Layer)

- Users interact with forms, tables, dialogs, and navigation components.
- UI components trigger actions such as opening modals, submitting forms, or selecting entities.

These interactions update Zustand stores for local UI state (e.g., modal visibility, selected permission, theme, alerts).

#### Client-Side State (Zustand)

Zustand manages all ephemeral UI state that does not come from the backend:

- Modal open/close state
- Selected entities
- Authentication session
- Alerts and notifications
- Theme preference

Zustand stores act as the “UI event layer,” coordinating what the user sees and what actions are available.

#### Server-Side State (TanStack Query)

TanStack Query handles all remote data from the Auth Service API:

- Fetching lists of entities
- Fetching single entities
- Mutations for create/update/delete/restore
- Automatic caching and background refetching
- Cache invalidation after mutations

This ensures the UI always reflects the latest backend state without manual state management.

#### Service Layer (API Calls)

All network requests flow through a dedicated service layer:

- Axios-based API clients pointing to the BFF (`/api/*`, `/auth/api/*`)
- Centralized error extraction and normalization
- Consistent request/response handling
- Shared configuration (base URL, interceptors, headers)

TanStack Query calls these services inside queries and mutations. The BFF then proxies those calls to the appropriate
upstream service.

#### Data Rendering (UI Components)

Once data is fetched or mutated:

- TanStack Query provides cached results to components
- Zustand controls UI behavior (modals, alerts, selections)
- Components render the final state to the user

This creates a clean separation:

- Zustand = UI state
- TanStack Query = server state
- Service Layer = API communication
- Components = presentation

## Local Development

### Prerequisites

- Node.js 24+ (frontend), Node.js 24+ (BFF)
- npm package manager

### Backend BFF Setup

The BFF lives in the `backend/` directory and must be started before the frontend.

**Environment Setup**

- Create a `backend/.env` file (copy from `backend/.env.example`)
- Required variables:
  - `API_BASE_URL` — base URL for the main API service
  - `AUTH_API_BASE_URL` — base URL for the authentication service
- Optional variables:
  - `PORT` — BFF server port (default: `7201`)
  - `CORS_ORIGINS` — comma-separated allowed origins (e.g. `http://localhost:7101`)
  - `CORS_HEADERS` — comma-separated allowed request headers
  - `CORS_METHODS` — comma-separated allowed HTTP methods

**Start BFF development server**

```bash
cd backend
npm install
npm run dev
```

**Build for production**

```bash
cd backend
npm run build   # compiles TypeScript to dist/
npm start       # runs dist/server.js with NODE_ENV=production
```

### Frontend Setup

**Environment Setup**

- Create a `.env` file in the backend and frontend directories
  - `.env.example` is provided for required variables

**Start development server**

```bash
npm run dev
```

This will start the frontend and backend servers concurrently.
The frontend will be served at `http://localhost:7101`.
The backend will be served at `http://localhost:7201`.

**Deploy to GCP App Engine**

1. `npm run build`
2. `npm run gcp:prepare`
3. `gcloud init`
4. `gcloud app deploy gcp/backend/app.yaml`
5. `gcloud app deploy gcp/frontend/app.yaml`
6. `gcloud app deploy gcp/dispatch.yaml`

### Things to do:

TODO

- Budget Page
- Home Page
  - Show unbudgeted but with txn
  - Show overbudget items
  - Show under budget items
- Tests
