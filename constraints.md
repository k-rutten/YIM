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

---
*Last updated: 2026-03-26*
