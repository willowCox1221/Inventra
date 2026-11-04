# Inventra frontend

Vite + React 18 + TypeScript + Tailwind CSS v3.

## Setup

```
npm install
cp .env.example .env   # optional; defaults to /api
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint` (type-check only).

## API

Requests go to `VITE_API_BASE_URL` (default `/api`). In dev, Vite proxies `/api` to `http://localhost:5000` (the `/api` prefix is kept). The dev server expects the backend there; start it from the repo root with:

```
dotnet run --project backend/Inventra.Api
```

The header shows a backend status indicator based on `GET /api/health`. Apart from `getHealth`, the endpoints in `src/api/client.ts` are stubs.

## Camera access

Camera scanning needs a secure context: HTTPS or `localhost`. Testing on a phone over the LAN requires HTTPS. Scanning isn't wired in yet; the scan pages currently offer manual barcode entry only.
