# Inventra

Inventra is a tool management and organization system. Users scan tool barcodes with their device's camera to check items in and out of inventory, and a dashboard shows stock health.

> **Status: early development.** The frontend UI skeleton and a backend health endpoint exist. Scanning, the data model and the scan and dashboard endpoints are not built yet.

## Features

| Feature | Status |
|---------|--------|
| Frontend shell with Dashboard, Scan In and Scan Out pages (React Router) | Built (placeholder data) |
| Manual barcode entry form on the Scan In and Scan Out pages | Built (calls endpoints that don't exist yet) |
| Backend health check (`GET /api/health`) reporting MongoDB status | Built |
| Camera barcode scanning | Planned |
| Scan in: add an item to the database | Planned |
| Scan out: remove an item from the database | Planned |
| Dashboard stats: total inventory, low stock, out of stock | Planned (the page shows zeros) |
| Authentication | Undecided |

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Vitest |
| Backend | ASP.NET Core Web API on .NET 9 |
| Database | MongoDB Atlas (cloud-hosted), via the official MongoDB .NET driver |
| Scanning (planned) | Browser camera access (`getUserMedia`) and a barcode decoding library (not yet chosen) |

## Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account and cluster (optional for now, since the backend starts without it)

## Getting started

Clone the repository:

```bash
git clone https://github.com/willowCox1221/Inventra.git
cd Inventra
```

### Backend

Run these commands from the repository root.

1. Store your Atlas connection string in user-secrets (kept outside the repo):

   ```bash
   dotnet user-secrets set "MongoDb:ConnectionString" "<atlas-connection-string>" --project backend/Inventra.Api
   ```

   Optionally set the database name (defaults to `inventra`):

   ```bash
   dotnet user-secrets set "MongoDb:DatabaseName" "inventra" --project backend/Inventra.Api
   ```

2. Build and run:

   ```bash
   dotnet build backend/Inventra.Api
   dotnet run --project backend/Inventra.Api
   ```

   The API listens on http://localhost:5000 in Development.

3. Check that it works:

   ```bash
   curl http://localhost:5000/api/health
   ```

   The response includes a `mongo` field with one of these values:

   | Value | Meaning |
   |-------|---------|
   | `ok` | Connected to MongoDB |
   | `not_configured` | No connection string set |
   | `unreachable` | A connection string is set but MongoDB didn't respond |

   The app starts fine without MongoDB configured.

In Development, the API also serves an OpenAPI document and allows CORS requests from `http://localhost:5173`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app at http://localhost:5173 and proxies `/api` requests to http://localhost:5000, so start the backend first.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only (`tsc --noEmit`; there is no ESLint yet) |
| `npm test` | Run the tests once (Vitest) |
| `npm run test:watch` | Run the tests in watch mode |

To point the frontend at a different API, set `VITE_API_BASE_URL` (defaults to `/api`).

## Project structure

```
Inventra/
├── frontend/             Vite + React + TypeScript + Tailwind app
│   └── src/              Pages, components, API client and types
└── backend/
    └── Inventra.Api/     ASP.NET Core Web API
        ├── Controllers/  API controllers (currently the health check)
        ├── Configuration/ Settings classes (MongoDB)
        ├── Models/
        └── Services/
```

## Configuration and secrets

- Never commit secrets. Keep MongoDB Atlas connection strings in ASP.NET user-secrets or environment variables, never in source control.
- Environment variables also work for the backend: `MongoDb__ConnectionString` and `MongoDb__DatabaseName`.
- Camera access requires a secure context (HTTPS or `localhost`). Keep this in mind when testing on a phone over your local network.

## Roadmap

Open design decisions to settle before or during the first implementation:

- Quantity vs. unique items: is a barcode a product type with a count, or a single physical tool?
- Delete vs. check out: hard delete, or a status change that keeps history?
- Low-stock threshold: per item or global?
- Unknown barcodes: what happens when a scanned code isn't in the database?
- Barcode library: ZXing (`@zxing/browser`), `html5-qrcode` or QuaggaJS.
- Authentication: whether users log in and whether scans are recorded per user.
- What the backend JavaScript does, if anything, alongside ASP.NET.

Planned work: choose the data model, build the scan in, scan out and dashboard endpoints, add camera scanning to the frontend, and connect the dashboard to real data.
