# Account Statement Backend

## Overview
A Node.js/TypeScript REST API backend for an account statement management system. Built with Express, TypeORM, and PostgreSQL. Supports Arabic-language data (Palestinian/Jordanian banks, user types, record types).

## Architecture
- **Runtime**: Node.js 20, TypeScript (compiled to CommonJS in `dist/`)
- **Framework**: Express.js
- **ORM**: TypeORM with PostgreSQL
- **Database**: Replit managed PostgreSQL (connected via `DATABASE_URL`)
- **Port**: 3000 (backend/console workflow)

## Project Structure
```
index.ts           - App entry point, Express setup
controlers/        - Request handlers (user, reminder, report)
db/
  dataSource.ts    - TypeORM DataSource config
  index.ts         - DB init, default data seeding, backup cron
  entity/          - TypeORM entities (User, Record, Check, Bank, Image, Reminder, RecordType, UserType)
middleware/        - File upload middleware (multer)
routers/           - Express route definitions for all API endpoints
services/          - Background services (cron reminders, DB backup, Dropbox, WhatsApp)
dist/              - Compiled JavaScript output (git-ignored)
```

## Authentication & Authorization

JWT-based auth system with three roles:

| Role | GET | POST/PUT/DELETE | Account Management |
|------|-----|-----------------|-------------------|
| **admin** | ✅ | ✅ | ✅ |
| **editor** | ✅ | ✅ | ❌ |
| **viewer** | ✅ | ❌ | ❌ |

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/login` — public, returns JWT token (expires in 7 days)
- `GET /api/auth/me` — any authenticated user
- `POST /api/auth/register` — admin only, creates new accounts
- `GET /api/auth/` — admin only, list all accounts
- `PUT /api/auth/:id` — admin only, update role/password/active status
- `DELETE /api/auth/:id` — admin only

### Default Admin Account
Created automatically on first startup if no accounts exist:
- Username: `admin`
- Password: `admin123` (or `DEFAULT_ADMIN_PASSWORD` env var)

### Entity: Account (`db/entity/Account.ts`)
Fields: `id` (uuid), `username`, `password` (bcrypt), `role` (admin/editor/viewer), `active`, `createdAt`, `updatedAt`

### Middleware (`middleware/auth.ts`)
- `authenticate` — verifies JWT Bearer token
- `writeProtect` — allows all roles for GET, restricts POST/PUT/DELETE to editor+admin
- `adminOnly`, `editorOrAdmin`, `anyRole` — role-based guards

## API Endpoints
- `POST/GET /api/users` - User management
- `GET/POST /api/records` - Financial records (supports file uploads)
- `GET/POST /api/usertypes` - User type lookup
- `GET/POST /api/recordtypes` - Record type lookup
- `GET/POST /api/checks` - Check management
- `GET/POST /api/banks` - Bank listing
- `GET/POST /api/images` - Image management
- `GET/POST /api/reminders` - Reminder management
- `GET/POST /api/reports` - Report generation

## Default Seeded Data
- **Banks**: 14 Palestinian/Jordanian banks seeded on startup
- **User Types**: زبون (customer), تاجر (merchant)
- **Record Types**: نقدي, دين, دفعة, مشتريات, دفعة له

## Build & Run
```bash
npm run build   # Compile TypeScript to dist/
node dist/index.js  # Run the server
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (managed by Replit)
- `PORT` - Server port (defaults to 3000)
- `NODE_ENV` - Environment (controls sync, cron, backups)

## Deployment
- Target: autoscale
- Build: `npm run build`
- Run: `node dist/index.js`
