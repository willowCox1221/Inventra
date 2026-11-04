---
name: writing-tests
description: How to write and run unit tests in Inventra (frontend Vitest + React Testing Library, backend xUnit + NSubstitute). Use when adding, fixing or running tests, or when verifying a code change.
---

# Writing and running Inventra tests

## Frontend (`frontend/`)

- **Stack:** Vitest 2 + React Testing Library + jsdom. Stay on Vitest 2 while the project is on Vite 5.
- **Where:** next to the code, as `Name.test.ts` or `Name.test.tsx` (for example `src/components/StatCard.test.tsx`).
- **Setup:** `src/test/setup.ts` already loads `jest-dom` matchers and runs `cleanup()` after each test. Don't repeat that in test files.
- **Globals** are on (`describe`, `it`, `expect` work without imports), but importing them from `vitest` is fine too. Match the file you're in.
- **Mock network calls by stubbing `fetch`**, never by hitting a real backend:
  ```ts
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => { fetchMock.mockReset(); vi.unstubAllGlobals(); });
  ```
  Components that fetch on mount (for example `BackendStatus` in the layout) need `fetch` stubbed even when the test isn't about them.
- **Routing:** wrap in `<MemoryRouter initialEntries={[path]}>`.
- **Queries:** prefer `getByRole` with an accessible `name`, then `getByLabelText` and `getByText`. Avoid test IDs and CSS selectors.
- **Commands** (run from `frontend/`):
  - `npm test`: run once
  - `npm run lint`: type-check, including test files. Run this too, because a test can pass and still have type errors.

## Backend (`backend/Inventra.Api.Tests/`)

- **Stack:** xUnit + NSubstitute, in a separate project. Name files `<ClassUnderTest>Tests.cs`, using namespace `Inventra.Api.Tests`.
- **Never touch real MongoDB.** Substitute `IMongoDatabase` and other Mongo interfaces with `Substitute.For<T>()`. Tests must run with no connection string or user-secrets.
- **Settings:** pass `Options.Create(new MongoDbSettings { ... })`.
- **Logging:** use `NullLogger<T>.Instance`, or a substitute `ILogger<T>` with `IsEnabled` returning `true` when you need to assert on logs.
- **Test names:** `Method_Condition_ExpectedResult`, for example `Get_PingThrows_ReportsUnreachable`.
- **Layout:** arrange / act / assert, separated by blank lines. Put shared construction in a private static `Create(...)` helper.
- **Security check:** when code reports errors to clients, assert that secrets (connection strings, passwords) don't leak into the response.
- **Commands** (run from the repo root):
  - `dotnet test backend/Inventra.Api.Tests`

## Workflow

1. Read the code under test and the nearest existing test file, and copy its style.
2. Cover the happy path, edge cases (empty or unknown input, 0 and negative quantities) and error paths.
3. Run the relevant test command, plus `npm run lint` for frontend changes.
4. Report the pass/fail counts. For each failure, give the test name, the assertion message and the likely cause.
5. If a test exposes a real bug in the app code, report it. Don't change app code unless asked.
