# 🚗 Car Dealership Inventory System

A full-stack Car Dealership Inventory System built with a **Test-Driven Development (TDD)** approach. The application allows users to browse, purchase, and manage vehicle inventory with role-based access control.

---

## Features

### User Features
- Register and log in securely
- Browse the full vehicle inventory
- Search vehicles by make, model, or category
- Filter by price range (min/max)
- Purchase vehicles (quantity decrements atomically)
- Real-time stock updates after purchase
- Purchase button disabled when out of stock

### Admin Features
- Add new vehicles to inventory
- Edit existing vehicle details
- Delete vehicles (with confirmation)
- Restock vehicles (increase quantity)
- All admin actions protected by server-side role checks

### Technical Highlights
- JWT token-based authentication
- bcrypt password hashing
- Atomic inventory operations (no negative stock)
- Role-based access control (USER / ADMIN)
- 161 backend tests with Jest + Supertest
- TDD Red → Green → Refactor commit history

---

## Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime + type safety |
| Express.js | HTTP framework |
| PostgreSQL | Production database |
| Prisma ORM | Database access + migrations |
| JWT (jsonwebtoken) | Token-based authentication |
| bcrypt | Password hashing |
| Jest + Supertest | Testing |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | SPA framework |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Vite | Build tool |

---

## Project Structure

```
CarDelarship/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models (User, Vehicle)
│   │   ├── migrations/            # Prisma migration files
│   │   └── seed.ts                # Sample data seeder
│   ├── src/
│   │   ├── app.ts                 # Express app configuration
│   │   ├── server.ts              # Entry point
│   │   ├── auth/                  # Registration & login
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── vehicles/              # Vehicle CRUD + inventory
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── vehicle.service.ts
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── vehicle.validation.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── inventory.validation.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts    # JWT verification middleware
│   │   │   └── requireAdmin.ts    # Admin-only middleware
│   │   ├── config/
│   │   │   └── database.ts        # Prisma client singleton
│   │   ├── utils/
│   │   │   ├── apiResponse.ts     # Standardised response helpers
│   │   │   └── jwt.ts             # Sign/verify JWT
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── vehicle.types.ts
│   │   │   └── express.d.ts       # req.user type extension
│   │   └── tests/
│   │       ├── health.test.ts
│   │       ├── auth/
│   │       │   ├── register.test.ts
│   │       │   ├── login.test.ts
│   │       │   └── middleware.test.ts
│   │       ├── vehicles/
│   │       │   ├── vehicles.test.ts
│   │       │   └── inventory.test.ts
│   │       ├── helpers/testClient.ts
│   │       └── setup/
│   │           ├── env.ts
│   │           ├── globalSetup.ts
│   │           └── globalTeardown.ts
│   ├── .env.example
│   ├── .env.test
│   ├── jest.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx                # Router + AuthProvider
    │   ├── main.tsx
    │   ├── index.css              # Tailwind directives
    │   ├── context/
    │   │   └── AuthContext.tsx    # Global auth state
    │   ├── services/
    │   │   └── apiClient.ts       # Centralised API client
    │   ├── types/
    │   │   ├── auth.types.ts
    │   │   └── vehicle.types.ts
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── DashboardPage.tsx
    │   └── components/
    │       ├── layout/
    │       │   ├── Navbar.tsx
    │       │   └── ProtectedRoute.tsx
    │       ├── ui/
    │       │   ├── Alert.tsx
    │       │   ├── InputField.tsx
    │       │   ├── Modal.tsx
    │       │   └── Spinner.tsx
    │       └── vehicles/
    │           ├── VehicleCard.tsx
    │           ├── VehicleForm.tsx
    │           ├── RestockForm.tsx
    │           └── SearchBar.tsx
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

---

## PostgreSQL Setup

### Option A — Install PostgreSQL locally
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings (port 5432)
3. Open SQL Shell (psql) and run:

```sql
CREATE DATABASE car_dealership;
CREATE DATABASE car_dealership_test;
```

### Option B — Docker
```bash
docker run --name car-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=car_dealership \
  -p 5432:5432 \
  -d postgres:16
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/car_dealership?schema=public` |
| `JWT_SECRET` | Secret key for JWT signing | `your-long-random-secret` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### `.env` format
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/car_dealership?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### `.env.test` (already configured)
```env
PORT=5001
NODE_ENV=test
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/car_dealership_test?schema=public"
JWT_SECRET=test_jwt_secret_for_testing_only
JWT_EXPIRES_IN=1h
```

---

## Setup & Running

### Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create your .env file
copy .env.example .env
# Edit .env with your database credentials

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed sample data (optional but recommended)
npm run db:seed

# 6. Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

Health check: **http://localhost:5000/api/health**

### Frontend Setup

Open a second terminal:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Database Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (drops and recreates)
npm run db:reset

# View database in browser
npm run db:studio

# Seed sample data
npm run db:seed
```

---

## Running Tests

All test commands run from the `backend/` directory.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only auth tests
npm run test:auth

# Run only vehicle tests
npm run test:vehicles

# Run only inventory (purchase/restock) tests
npm run test:inventory
```

### Test Database Setup
Tests use a separate `car_dealership_test` database.
Create it before running tests:
```sql
CREATE DATABASE car_dealership_test;
```

---

## API Endpoint Documentation

### Base URL
`http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive JWT |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```
Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number.

**Login request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Login response:**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "email": "...", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Vehicles (All require `Authorization: Bearer <token>`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/vehicles` | USER/ADMIN | List all vehicles |
| GET | `/vehicles/search` | USER/ADMIN | Search/filter vehicles |
| POST | `/vehicles` | USER/ADMIN | Create a vehicle |
| PUT | `/vehicles/:id` | USER/ADMIN | Update a vehicle |
| DELETE | `/vehicles/:id` | ADMIN only | Delete a vehicle |

**Vehicle object:**
```json
{
  "id": "uuid",
  "make": "Toyota",
  "model": "Camry",
  "category": "Sedan",
  "price": "25000.00",
  "quantity": 8,
  "createdAt": "2026-08-22T...",
  "updatedAt": "2026-08-22T..."
}
```

**Search query params:** `?make=Toyota&model=Camry&category=Sedan&minPrice=20000&maxPrice=50000`

### Inventory

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/vehicles/:id/purchase` | USER/ADMIN | Purchase a vehicle (qty -1) |
| POST | `/vehicles/:id/restock` | ADMIN only | Restock a vehicle |

**Restock request body:**
```json
{ "quantity": 10 }
```

---

## Authentication Explanation

1. User registers → password is hashed with **bcrypt** (10 salt rounds)
2. User logs in → credentials verified → **JWT** signed with `JWT_SECRET`
3. JWT contains: `{ userId, role, iat, exp }`
4. Protected routes require `Authorization: Bearer <token>` header
5. The `authenticate` middleware verifies the JWT on every protected request
6. Expired/invalid tokens return HTTP 401
7. The frontend stores the JWT in `localStorage` and attaches it automatically
8. On 401, the frontend clears auth state and redirects to login

---

## User vs Admin Permissions

| Action | USER | ADMIN |
|--------|------|-------|
| Register / Login | ✅ | ✅ |
| View vehicles | ✅ | ✅ |
| Search vehicles | ✅ | ✅ |
| Purchase vehicle | ✅ | ✅ |
| Create vehicle | ✅ | ✅ |
| Update vehicle | ✅ | ✅ |
| Delete vehicle | ❌ | ✅ |
| Restock vehicle | ❌ | ✅ |

> **Note:** Even if the frontend hides admin controls, the backend enforces authorization on every request. A USER attempting to delete or restock will receive HTTP 403.

---

## Default Admin Account (after seeding)

```
Email:    admin@cardealership.com
Password: Admin123
```

---

## Screenshots

> Add screenshots of your running application here.

| Page | Screenshot |
|------|-----------|
| Login Page | *(add screenshot)* |
| Register Page | *(add screenshot)* |
| Dashboard — User View | *(add screenshot)* |
| Dashboard — Admin View | *(add screenshot)* |
| Search / Filter | *(add screenshot)* |
| Purchase Success | *(add screenshot)* |
| Add Vehicle (Admin) | *(add screenshot)* |
| Edit Vehicle (Admin) | *(add screenshot)* |
| Restock Vehicle (Admin) | *(add screenshot)* |
| Delete Confirmation | *(add screenshot)* |

---

## Test Report

Run the following command to generate the full test report:

```bash
cd backend
npm run test:coverage
```

### Test Suites Summary

| Suite | Tests | Description |
|-------|-------|-------------|
| `health.test.ts` | 9 | Health endpoint + 404 handling |
| `auth/register.test.ts` | 27 | Registration, validation, bcrypt, DB persistence |
| `auth/login.test.ts` | 21 | Login, JWT payload, invalid credentials |
| `auth/middleware.test.ts` | 13 | JWT middleware, expired/invalid tokens |
| `vehicles/vehicles.test.ts` | 57 | CRUD, search, auth, admin delete |
| `vehicles/inventory.test.ts` | 34 | Purchase atomicity, out-of-stock, restock |
| **Total** | **161** | |

---

## My AI Usage

### Tool Used
**Kiro** — an AI-powered development environment (IDE agent).

### How I Used It

**Project Scaffolding:**
Used Kiro to generate the initial project structure including `package.json`, `tsconfig.json`, Express app setup, Vite + React + Tailwind configuration, and ESLint/Prettier configs. This saved significant time on boilerplate setup.

**TDD Test Writing:**
For each feature (registration, login, JWT middleware, vehicles, purchase, restock), I provided the requirements to Kiro and had it generate the test suite first — before any implementation existed. I then reviewed each test case to verify it accurately tested the described behaviour, removing or adjusting any that were incorrect.

**Implementation Generation:**
After confirming tests failed (RED phase), I used Kiro to implement the corresponding service, controller, validation, and route files. I manually reviewed the generated code for security issues (e.g., ensuring passwords were never returned in responses, JWT secrets came from environment variables, and error messages didn't leak information).

**Bug Fixing:**
When the search functionality had a race condition (overlapping loading states causing the grid to flash), I described the bug to Kiro and reviewed the proposed fix — separating `initialLoading` from `searchLoading` state.

**Documentation:**
Used Kiro to generate this README structure, then manually verified all commands, API docs, and descriptions for accuracy.

### What I Manually Reviewed and Changed
- Verified all password security requirements (no plaintext storage, no response exposure)
- Confirmed JWT payload structure matched what the tests expected
- Checked that generic error messages were used for auth failures (preventing email enumeration)
- Reviewed Prisma transaction logic for the atomic purchase operation
- Tested all API endpoints manually with the seeded data

### How AI Affected My Workflow
AI assistance approximately doubled development speed for the initial implementation phases. The most valuable use was generating comprehensive test suites — Kiro could produce 20–30 tests covering edge cases that I might have missed or taken much longer to write manually. The main cost was review time: every generated file needed careful reading before acceptance.

### How I Verified AI-Generated Code
- Ran the full test suite after each implementation step
- Manually tested the UI in the browser
- Checked the Prisma schema and migrations were correct
- Reviewed TypeScript types to ensure they were accurate
- Tested edge cases like concurrent purchases and invalid tokens

---

## Git Commit History (TDD Pattern)

The commit history demonstrates the Red → Green → Refactor TDD cycle:

```
chore: initialize project structure
test: add health endpoint tests
feat: implement health endpoint
test: add user registration tests
feat: implement user registration
test: add login and JWT authentication tests
feat: implement login and JWT authentication
test: add vehicle management tests
feat: implement vehicle management API
test: add purchase and restock tests
feat: implement vehicle purchase and restock
feat: implement frontend authentication
feat: implement vehicle dashboard and admin interface
docs: finalize project documentation
```

---

## Running the Complete Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.
