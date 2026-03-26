# YIM Shared Context

Referentiemateriaal uit de YIM codebase, bedoeld als context voor feature-prototypes.
Geextraheerd op 2026-03-25.

## Structuur

### `models/` — Generated TypeScript models
Gegenereerde TS interfaces vanuit de C# backend. Dit zijn de datatypes die de frontend gebruikt.
- `registration.ts` — Personen, bedrijven, autorisaties, registraties
- `common.ts` — Gedeelde types (paginatie, filters, enums)
- `identity.ts` — Gebruikers, rollen, authenticatie
- `common-shared.ts` — Shared library types

### `api/` — C# API Models (DTOs)
Request/response models van de Registration API.
- `Person*.cs` — Persoon detail, lijst, filters
- `Company*.cs` — Bedrijf detail, lijst
- `Authorizations/` — Autorisatie CRUD models
- `PersonRole.cs` — Rollen enum

### `domain-entities/` — C# Domain Entities
Database entities (EF Core) — de bron van waarheid voor datastructuren.
- `Person.cs` + partials (Authorizations, Dossier, Certificates)
- `Company.cs` + partials (Dossier, Vca)
- `Authorization.cs`, `AuthorizationRule.cs`
- `Blacklist.cs`, `ViewBlacklist.cs` — AEOS connector blacklist (enige bestaande blacklist code)

### `frontend-views/` — Vue 3 Components
Bestaande Vue frontend views als referentie voor UI patronen.
- `person/` — Persoonsdossier views (detail, autorisaties, identificatie, certificaten)
- `company/` — Bedrijfsdossier views (detail, personen, gebruikers, evenementen)
- `authorization/` — Autorisatie views (overzicht, toevoegen, details)

### `translations/` — Nederlandse vertalingen
i18n JSON bestanden met alle veldlabels en berichten.
- `registration-nl.json` — Hoofdapp vertalingen
- `common-nl.json` — Gedeelde vertalingen
- `admin-nl.json` — Admin vertalingen

## Gebruik
Deze bestanden zijn read-only referentie. Bij het bouwen van prototypes:
1. Raadpleeg `models/registration.ts` voor correcte veldnamen en types
2. Raadpleeg `translations/registration-nl.json` voor Nederlandse labels
3. Raadpleeg `frontend-views/` voor bestaande UI patronen
4. Raadpleeg `domain-entities/` voor database-level datastructuren

## Architectuur
- **Backend:** .NET 8, C#, EF Core, Azure
- **Frontend:** Vue 3 + TypeScript + Vite + Kendo UI
- **Apps:** yim-admin (super-admin), yim-registration (operationeel), yim-common (shared lib)
- **Blacklist:** Bestaat alleen in AEOS emulator — is een volledig nieuwe feature voor YIM core
