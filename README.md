# Car Dealership Inventory System

A full-stack Car Dealership Inventory System built with Node.js, TypeScript, Express (backend) and React, TypeScript, Tailwind CSS (frontend).

## Project Structure

```
car-dealership-inventory/
├── backend/       # Node.js + TypeScript + Express API
└── frontend/      # React + TypeScript + Tailwind CSS SPA
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

Health check: `GET http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint       | Description        | Auth Required |
|--------|----------------|--------------------|---------------|
| GET    | /api/health    | Health check       | No            |

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.


