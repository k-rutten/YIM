# YIM — Constraints

## Tech Limits
- Architecture: .NET 8 backend, Vue 3 + TypeScript + Kendo UI frontend, Azure hosted
- APIs: Registration API (90+ controllers), Admin API, Identity API — Blacklist is NEW (geen bestaande API)
- Data: Prototypes gebruiken hardcoded fixture data (localStorage), geen live API connectie
- Prototype stack: Single-file React 18 SPA via CDN (geen build tooling), Tailwind CSS

## UX / Platform
- Device: Desktop only (beheerders-applicatie)
- Existing patterns: Kendo UI grids/tables, sidebar navigatie, tabbed dossier views, modal confirmations
- Font: Nunito (Google Fonts), weights 400/600/700
- Color palette: Custom `yim-*` prefix Tailwind scale (#265263 primary teal)
- Accessibility: Standaard WCAG 2.1 AA (geen specifieke eisen gecommuniceerd)

## Business
- Timeline: Feature prototypes worden iteratief opgeleverd, geen harde deadline
- Stakeholders: Nsecure product team, feedback loops via Figma + prototype reviews
- Blacklist context: Bestaat alleen in AEOS emulator (access control connector), niet in YIM core domain
- Hiding Information: Rolgebaseerde data-inzage met 9 autorisatiecategorieen, cross-company hard boundaries, AVG/GDPR compliance

## Hiding Information — Feature-Specific Constraints
- **Data model:** 9 authorization categories (identity, contact, government_id, employment, compliance, time_tracking, access, certificates, documents)
- **Hard boundaries:** Zeer gevoelige data (BSN, VOG, contracts) en loongegevens ALTIJD geblokkeerd cross-company — platform-enforced
- **Scope model:** own_company (altijd) + subcontractors (optioneel per rol)
- **Existing YIM patterns to match:** Role settings editor (taken, dossierniveau, bestandtoegang), role-based access control
- **Derivation engine:** `deriveCategories()` maps role settings → required data categories via TASK_CATEGORY_MAP, DOSSIERNIVEAU_MAP, BESTAND_MAP
- **canReveal:** Tijdelijk onthullen (5 sec) van gemaskeerde velden, gelogd in audit trail

---
*Last updated: 2026-03-26*
