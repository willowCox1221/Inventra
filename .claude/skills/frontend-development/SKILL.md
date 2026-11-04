---
name: frontend-development
description: Conventions for building and changing the Inventra frontend (React 18 + TypeScript + Tailwind 3 + React Router 6, in frontend/). Use when adding or editing pages, components, styling, API calls or types in the frontend.
---

# Inventra frontend development

The frontend lives in `frontend/`: Vite 5 + React 18 + TypeScript (strict) + Tailwind CSS 3 + React Router 6. There's no component library, so everything is built with plain Tailwind classes.

## Where things go

| Folder | What goes there |
|---|---|
| `src/pages/` | One component per route (`DashboardPage`, `ScanInPage`, …). Keep pages thin and put the reusable parts in components. |
| `src/components/` | Reusable UI (`StatCard`, `BarcodeEntryForm`, `ScanPageContent`, `Layout`, `BackendStatus`). |
| `src/api/client.ts` | **All** backend calls. Components never call `fetch` directly. |
| `src/types/index.ts` | Shared types, including API request and response shapes. |
| `src/App.tsx` | Routes. Every page sits inside `<Route element={<Layout />}>`. |

When adding a page, add its route in `App.tsx` and a nav entry in the `links` array in `Layout.tsx`.

## Component conventions

- **One component per file**, as a `default export function Name()`, in a PascalCase file name.
- **Props:** `interface NameProps { ... }` above the component, destructured in the signature.
- **Doc comment:** a one-line `/** ... */` above each component saying what it is.
- **Function components and hooks only.** For local state use `useState`. For form `id`/`htmlFor` pairs use `useId()`, never hard-coded ids.
- **Type-only imports:** `import type { X } from '../types'`.
- **Shared logic:** when two pages share behavior, put it in one component with props (see how `ScanInPage`/`ScanOutPage` both use `ScanPageContent` and pass in `onScan`).
- **Unbuilt features:** leave a `// TODO:` comment explaining what's missing (camera scanner, real dashboard data, backend contract).

## Calling the API

- Add a typed function to `src/api/client.ts` that uses the internal `request<T>()` helper. It adds the JSON headers, the base URL (`VITE_API_BASE_URL`, falling back to `/api`, which Vite proxies to `http://localhost:5000`) and throws `ApiError` on non-2xx responses.
- Add the response type to `src/types/index.ts`.
- **Fetching in a component:** use `useEffect` with a `cancelled` flag so state isn't set after unmount (see `BackendStatus.tsx`). Model state as a discriminated union, like `{ kind: 'loading' } | { kind: 'ready'; data } | { kind: 'error' }`.
- **Errors:** catch them and show a friendly message to the user. Never show raw error text.
- **Backend contract:** the scan and dashboard endpoints aren't built yet (see the open design decisions in `.claude/CLAUDE.md`). Don't invent new backend contracts silently. Mark guesses with `TODO`.

## Styling (Tailwind)

Use utility classes inline, with no custom CSS and no `@apply`. Match the existing look:

- **Page:** `bg-slate-50 text-slate-900`. Content width `mx-auto max-w-5xl px-4`.
- **Page title:** `<h1 className="text-2xl font-bold">`. Section heading: `text-lg font-semibold`.
- **Cards:** `rounded-lg border border-slate-200 bg-white p-5 shadow-sm`.
- **Primary button:** `rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50`.
- **Text input:** `rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`.
- **Muted text:** `text-slate-600`. Status colors: green-700 / green-600 = ok, amber-500 = warning, red-700 / red-600 = error.
- **Mobile first:** the base styles are for phones, since people scan with a phone camera. Add `sm:` variants for wider screens (for example `flex-col sm:flex-row`, `grid sm:grid-cols-3`).

## Accessibility (required)

- Use semantic elements: `<main>`, `<nav aria-label>`, `<section>`, headings in order, and `<dl>` for label/value pairs.
- Every input needs a `<label htmlFor>`.
- Every interactive element needs a visible focus style (`focus-visible:ring-2 ...`).
- For status messages that change, use `role="status"` (and `aria-live="polite"` where needed).
- Decorative elements get `aria-hidden="true"`. Don't use color as the only signal; pair it with text.
- These matter for tests too, because tests find elements by role and accessible name.

## Camera scanning (not built yet)

- `getUserMedia` only works in a secure context (`localhost` or HTTPS). Testing on a phone over the LAN needs HTTPS.
- The barcode library isn't chosen yet. Don't add one without asking.
- The scanner goes where the placeholder sits in `ScanPageContent.tsx`, and calls `handleSubmit(decodedValue)` on a successful decode. Keep `BarcodeEntryForm` as the fallback.
- Stop the camera tracks when the component unmounts.

## Dependencies

Ask before adding any npm package. Stay on Vite 5 / Vitest 2 / Tailwind 3 / React 18 unless an upgrade is the task.

## Finish every change

Run from `frontend/`:

1. `npm run lint`: type-check (strict, no unused locals or params).
2. `npm test`: unit tests. Add or update tests for what you changed, following the `writing-tests` skill.
3. `npm run build`, if you changed config or routing.

Report what changed and the results of these commands.
