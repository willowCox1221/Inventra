---
name: mongodb
description: Inventra's MongoDB Atlas rules - connection and secrets, C# driver patterns, collections, indexes, data changes and safety. Use when writing code that reads or writes the database, designing collections or indexes, fixing data, or troubleshooting MongoDB/Atlas connection problems.
---

# Inventra MongoDB

Inventra stores its data in **MongoDB Atlas** (cloud-hosted). The backend accesses it with the official **MongoDB.Driver v3** for C#. The default database name is `inventra`.

## Safety first (required)

The Atlas database may hold real inventory data, so treat it as production.

- **Start with read-only work** (finds, counts, `explain`, listing indexes) when investigating a problem.
- **Ask the user and wait for a yes before any write against Atlas.** That covers `insert`, `update` and `delete` operations, `drop`, `dropIndex`, renaming collections, and bulk changes. Before asking, say exactly what will run and how many documents it will affect (run a `countDocuments` with the same filter first).
- **Destructive changes need a way back.** Before deleting or rewriting data, export the affected documents first (`mongoexport`, or a copy collection) and tell the user where the export is.
- **Prefer changes in code over one-off shell commands.** For example, create indexes at startup with idempotent C# rather than by hand, so every environment matches.
- **Unit tests never touch Atlas.** They mock `IMongoDatabase` and `IMongoCollection<T>` with NSubstitute (see the `writing-tests` skill).

## Connection and secrets

- The connection string comes from user-secrets (`MongoDb:ConnectionString`) or the `MongoDb__ConnectionString` environment variable, and binds to `Configuration/MongoDbSettings.cs`. In `appsettings.json` it stays `""`.
- **Never read, print, log or commit the connection string.** Never read the user-secrets file, and never put the string in commands, files, docs or chat. If a command needs it, ask the user to run that command themselves.
- `Program.cs` registers `IMongoClient` and `IMongoDatabase` as **lazy singletons** with a 5-second server-selection timeout, so the app starts even when Mongo isn't configured. Keep it that way.
- **Check connectivity** with `GET http://localhost:5000/api/health`, which reports `mongo` as one of:
  - `ok`
  - `not_configured`: no connection string is set.
  - `unreachable`: the connection failed. `mongoDetail` gives only the exception type.
- **Common Atlas connection problems:**
  - Your IP address isn't in the Atlas **Network Access** list (the classic cause of a `TimeoutException`).
  - Wrong username or password, or the database user lacks rights to `inventra`.
  - The password contains characters that aren't URL-encoded.
  - A network or VPN blocks port 27017 or the SRV DNS lookup.
  - The cluster is paused (free-tier clusters pause when idle).

## C# driver patterns

- Use the database only inside **services** (`Services/`), never in controllers. The health check is the one exception.
- **Collections:** get them with `db.GetCollection<T>(CollectionName)`. Use lowercase plural names (`items`, `scans`), each kept in a `const`.
- **Document models** live in `Models/`. Give each one:
  ```csharp
  [BsonId]
  [BsonRepresentation(BsonType.ObjectId)]
  public string Id { get; set; } = string.Empty;
  ```
  Store times in UTC. Use `[BsonElement("camelCase")]` or a camelCase convention so field names match the JSON the frontend sees.
- **Filters and updates:** build them with `Builders<T>.Filter` / `Builders<T>.Update`. Never build queries by joining strings that contain user input.
- **Concurrent changes:** use atomic updates (`$inc`, `FindOneAndUpdateAsync`, `upsert`) instead of read-modify-write, so two scans at the same moment can't lose a count.
- **Counts and stats:** use `CountDocumentsAsync` or an aggregation pipeline. Never load a whole collection into memory. Page long lists.
- **Cancellation:** pass the request's `CancellationToken` into every driver call.
- **Duplicate keys:** catch `MongoWriteException` with `ServerErrorCategory.DuplicateKey` and turn it into a `409 Conflict`, not a 500.

## Indexes

- Add an index for every field you regularly filter or sort on. `barcode` must have a **unique** index if barcodes identify items.
- Define indexes in code with `CreateOneAsync`/`CreateManyAsync`, run once at startup. These calls are idempotent: re-creating an existing index with the same options is a no-op.
- Check that a query actually uses its index with `explain` (look for `IXSCAN`, not `COLLSCAN`).

## Data model (not decided yet)

The collections depend on the open design decisions in `.claude/CLAUDE.md`:
- whether an item is counted by quantity or tracked as a unique tool
- whether removal deletes the record or checks it out
- how the low-stock threshold is set
- what happens with unknown barcodes
- auth

**Don't pick a data model silently.** If a task needs one, stop and ask. Once it's decided, replace this section with the real collections, their fields and their indexes.
