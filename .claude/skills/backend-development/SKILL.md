---
name: backend-development
description: Conventions for building and changing the Inventra backend (ASP.NET Core Web API on .NET 9 with MongoDB, in backend/Inventra.Api). Use when adding or editing controllers, services, models, configuration, MongoDB access or API endpoints.
---

# Inventra backend development

The backend is an ASP.NET Core Web API on .NET 9 in `backend/Inventra.Api`, using the official `MongoDB.Driver` (v3) with MongoDB Atlas. In Development it listens on `http://localhost:5000`. Tests live in the separate `backend/Inventra.Api.Tests` project. There's no `.sln` yet.

## Where things go

| Folder | What goes there |
|---|---|
| `Controllers/` | Thin API controllers: validate input, call a service, return a result. |
| `Services/` | Business logic and MongoDB access, as an interface plus an implementation (`IInventoryService` / `InventoryService`). |
| `Models/` | MongoDB documents and request/response DTOs. |
| `Configuration/` | Options classes bound from configuration (see `MongoDbSettings`). |
| `Program.cs` | Dependency injection, CORS and middleware. Register new services here. |

`Models/` and `Services/` are empty for now (they only hold a `.gitkeep`), so the first real code there sets the pattern. Follow this guide.

## Code style (match the existing files)

- **File-scoped namespaces** that follow the folders: `namespace Inventra.Api.Controllers;`.
- **Primary constructors** for dependency injection: `public class XController(IXService service, ILogger<XController> logger) : ControllerBase`.
- **Nullable reference types** are on, and so are implicit usings. Don't add usings that are already implicit.
- **`/// <summary>` comments** on public classes and on anything that isn't obvious.
- **`async` all the way down.** Every action and service method takes a `CancellationToken ct` and passes it on to Mongo calls.

## Controllers

- Use `[ApiController]` and an explicit route, `[Route("api/<resource>")]`. Every route starts with `/api` (the Vite dev proxy forwards `/api` to port 5000).
- Return `IActionResult` or `ActionResult<T>` and use the standard results: `Ok`, `NotFound`, `BadRequest`, `Conflict` and `CreatedAtAction`.
- Keep logic out of controllers. Use a service, which makes the code easy to unit test with NSubstitute.
- JSON is camelCase by default. Keep it that way, because the frontend types in `frontend/src/types/index.ts` expect camelCase.
- When you add or change an endpoint, update the matching function in `frontend/src/api/client.ts` and its type, or tell the caller they need updating.

## MongoDB

Follow the **`mongodb` skill** (`.claude/skills/mongodb/SKILL.md`) for all database work: connection and secrets, driver patterns, collections, indexes and safety.

In short:
- Inject `IMongoDatabase` into services, never into controllers.
- If `MongoDbSettings.IsConfigured` is false, return 503 with a clear message instead of crashing.

## Security (required)

- **Never commit secrets.** The connection string comes from user-secrets (`MongoDb:ConnectionString`) or the `MongoDb__ConnectionString` environment variable. It stays `""` in `appsettings.json`.
- **Never put exception messages, connection strings or stack traces in responses.** Log them with `ILogger` and return a generic message or just the exception type name (see `HealthController`).
- **Validate all input** (barcode not empty, a sensible length, trimmed) before it reaches Mongo. Build queries with the driver's `Builders<T>.Filter`, never from strings.
- **CORS** allows `http://localhost:5173` in Development only. Don't widen it without asking.

## Decisions still open

These are listed in `.claude/CLAUDE.md` under open design decisions:
- whether an item is counted by quantity or tracked as a unique tool
- whether removal deletes the record or checks it out
- how the low-stock threshold is set
- what happens with unknown barcodes
- auth

**Don't decide them silently.** If a task depends on one of them, stop and ask. Once one is decided, record the answer in `CLAUDE.md`.

The frontend currently expects these endpoints (they're placeholders; check before building them):
- `GET /api/dashboard/stats` returns `{ totalInventory, lowStock, outOfStock }`
- `POST /api/scan-in` and `POST /api/scan-out`, each taking `{ barcode }` and returning `{ barcode, message? }`

## Dependencies

Ask before adding a NuGet package. Stay on .NET 9 and MongoDB.Driver 3.

## Finish every change

Run from the repo root:

1. `dotnet build backend/Inventra.Api`
2. `dotnet test backend/Inventra.Api.Tests`. Add or update tests for what you changed, following the `writing-tests` skill (Mongo is always mocked).
3. Optionally, run the app (`dotnet run --project backend/Inventra.Api`) and check `GET http://localhost:5000/api/health`.

Report what changed, the results of these commands, and any frontend changes that are now needed.
