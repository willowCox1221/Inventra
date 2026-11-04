# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## Status

**Planning stage: no code yet.** This file describes the *intended* design. As code lands, replace the planned sections with the real structure, commands and conventions, and delete anything that turns out to be wrong.

- Remote: https://github.com/willowCox1221/Inventra.git (branch `main`)

## What Inventra is

Inventra is a tool management and organization system. Users scan tool barcodes with their device's camera to check items in and out of inventory, and a dashboard shows stock health.

### Core features

1. **Scan in.** The camera reads a barcode and the item is added to the database.
2. **Scan out.** Scanning a barcode during removal takes the item out of the database.
3. **Dashboard** with inventory stats, including:
   - Total inventory numbers
   - Low stock items
   - Out of stock items

## Planned tech stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React                          |
| Backend  | ASP.NET, plus JavaScript       |
| Database | MongoDB Atlas (cloud-hosted)   |
| Scanning | Browser camera access (`getUserMedia`) and a barcode decoding library (not yet chosen) |

## Open design decisions

Settle these before or during the first implementation. Record each answer here once it's decided.

- **What the backend JavaScript does.** Decide what runs in ASP.NET and what runs in JavaScript (for example, a Node service for some endpoints) and how they talk to each other.
- **Quantity vs. unique items.** Decide whether a barcode is a product type with a count (scanning in adds 1, scanning out subtracts 1) or a single physical tool (scanning in creates a record, scanning out deletes it or marks it checked out). This choice drives the data model and how the out-of-stock stat works.
- **Delete vs. check out.** "Removed from the database" could mean a hard delete or a status change with history. Keeping history makes auditing possible (who took what, and when).
- **Low-stock threshold.** Decide whether it's set per item or globally.
- **Unknown barcodes.** Decide what happens when someone scans a code that isn't in the database yet.
- **Barcode library.** Candidates include ZXing (`@zxing/browser`), `html5-qrcode` and QuaggaJS.
- **Auth.** Decide whether users log in, and whether scans are recorded per user.

## Conventions and notes

- **Never commit secrets.** Keep MongoDB Atlas connection strings in environment variables, ASP.NET user-secrets or a git-ignored `.env`, never in source control.
- **Camera access needs a secure context** (HTTPS or `localhost`). Keep this in mind for local development and when testing on phones over the LAN.

## Build / run / test

_Not defined yet. Add the real commands here once the frontend and backend projects are scaffolded._
