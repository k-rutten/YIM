# Feature: Hiding Information

## Pipeline State
- **Speed tier:** Deep (120-180 min) — high uncertainty, 6 concepts, multiple rounds
- **Current step:** Decision gate — concepts scored, winner identified, Concept G planned but not yet built
- **Status:** Iteration round 3 complete. Ready for final concept selection + ship ready.

## Challenge

**What user problem does this solve?**
YIM admins need to control which personal data is visible per role — but the current platform has no granular data privacy controls. Workers' sensitive information (BSN, government ID, salary data) is either fully visible or fully hidden. There's no middle ground.

**For whom, primarily?**
YIM platform administrators configuring role-based data access for their organization.

**What if we don't build this?**
Organizations can't comply with data minimization principles (AVG/GDPR). All roles see all data, creating unnecessary privacy exposure. Competitors with granular controls win enterprise deals.

**What are we assuming?**
1. 9 authorization categories are sufficient granularity (not per-field)
2. Admins can configure 5+ roles in under 10 minutes
3. Cross-company (subcontractor) data access needs hard platform boundaries
4. Presets reduce cognitive load significantly vs. blank-slate configuration
5. Task-driven derivation could eliminate manual category configuration entirely

## Constraint Map

### Hard Boundaries (platform-level, non-negotiable)
- **Zeer gevoelige persoonsgegevens** (government_id, VOG, contracts): BLOCKED cross-company
- **Loongegevens** (sociale_lasten): BLOCKED cross-company
- These are enforced by the platform regardless of admin configuration

### Tech Constraints
- YIM stack: .NET 8 + Vue 3 + Kendo UI (production)
- Prototype stack: Single-file React 18 SPA, Tailwind CSS, CDN only
- No build step, no backend — all fixture data
- 9 authorization categories map to existing YIM data model

### UX Constraints
- Must feel like YIM (teal color palette, Nunito font, card-based layout)
- Desktop only (admin application)
- Existing YIM patterns: role-based RBAC, tabbed views, modal editors
- Admin configures roles first, then assigns to users (not shown in prototype)

### Business Constraints
- Must support both own-company and cross-company (subcontractor) contexts
- Audit trail required for all data reveals
- canReveal (temporary 5-second unmask) is a differentiating feature

## Hypotheses

### H1: Category-level granularity is sufficient
Per-field permissions are overkill for v1. 9 categories (identity, contact, government_id, employment, compliance, time_tracking, access, certificates, documents) cover all realistic admin needs.
**Status:** Confirmed across all concepts. No stakeholder has requested per-field control.

### H2: Presets reduce configuration effort by 60%+
Starting from a preset (full/standard/operational/minimal) and adjusting is faster than building from scratch.
**Status:** Confirmed in Concepts B, E, F. Presets are the primary interaction pattern.

### H3: Hard platform boundaries build trust
Admins trust the system more when they see that sensitive data is automatically blocked cross-company, regardless of their configuration.
**Status:** Confirmed in Concept E. The hard boundary table is the most positively received UI element.

### H4: Sensitivity levels are intuitive (Concept C)
A single slider (level 1-4) that auto-determines category visibility is simpler than manual toggles.
**Status:** Partially disproven. The abstraction hides too much — admins want to see and control individual categories. The slider creates a "what does level 3 actually mean?" problem.

### H5: Task-driven derivation eliminates manual configuration (Concept G — untested)
If the system derives required data categories from role settings (tasks, dossier levels, file access), admins never need to manually configure data visibility. The system explains WHY each category is enabled.
**Status:** Untested. Derivation engine exists (`deriveCategories()`), justification tracking exists, but no dedicated concept UI built yet.

## Concepts

### Concept A: Profielen (Shared Profiles)
- **Hypothesis:** Centralized visibility profiles reduce duplication
- **Mechanism:** Shared profiles linked to roles via `visibilityProfileId`
- **Data model:** `allowedCategories` + `allowedScopes` on profiles, roles reference profiles
- **UX deviation from YIM:** High — profiles are a new abstraction not in current YIM
- **Status:** Alive. Functional but complex admin flow.
- **Score:** 21/30

### Concept B: Categorieen (Direct Category Toggles)
- **Hypothesis:** Direct control per role is more intuitive than shared profiles
- **Mechanism:** 9 category toggles + presets per role
- **Data model:** `allowedCategories` + `allowedScopes` directly on roles
- **UX deviation from YIM:** Low — matches existing role editor patterns
- **Status:** Alive. Solid baseline.
- **Score:** 24/30

### Concept C: Inzageniveau (Sensitivity Levels)
- **Hypothesis:** A single sensitivity slider is simpler than category toggles
- **Mechanism:** Level 1-4 slider → auto-derives categories via `getCategoriesForLevel()`
- **Data model:** Legacy 4-bucket model bridged to 9 categories via `FIELD_TO_CATEGORY`
- **UX deviation from YIM:** Medium — slider is novel but hides granularity
- **Status:** Alive but weak. Bridge fix applied (was broken). Lowest score.
- **Score:** 14/30

### Concept E: Harde Grenzen (Hard Boundaries) — WINNER
- **Hypothesis:** Platform-enforced boundaries + manual categories is the optimal balance
- **Mechanism:** Category toggles + presets + hard boundary table + cross-company blocking
- **Data model:** Same as B + `HARD_BOUNDARY_RULES` + `HARD_BLOCKED` enforcement
- **UX deviation from YIM:** Low — extends existing patterns naturally
- **Status:** Winner (27/30). Functionally complete. Demo-ready.
- **Score:** 27/30

### Concept F: Gecombineerd (Combined)
- **Hypothesis:** Best-of-all combines B's model + E's boundaries + preset badges
- **Mechanism:** Category toggles + presets + hard boundaries + visual preset matching
- **Data model:** Same as E + `matchPreset()` for live preset badge
- **UX deviation from YIM:** Low-medium
- **Status:** Alive. Runner-up. Wizard removed (was UX depth not in YIM).
- **Score:** 26/30

### Concept G: Taakafleiding (Task-Driven Derivation) — PLANNED
- **Hypothesis:** H5 — system derives categories from role settings, eliminating manual config
- **Mechanism:** `deriveCategories()` + `FIELD_TO_CATEGORY` bridge + justification display + manual overrides
- **Data model:** `allowedCategories` (derived) + `_derivedCategories` + `_justifications9` + `_overrides`
- **UX deviation from YIM:** Very low — role settings are already configured in YIM, this just auto-derives data visibility from them
- **Status:** Planned. Derivation engine exists. UI not yet built.
- **Score:** TBD

## Scoring Matrix (6 criteria, 1-5 scale)

| Criterion | A | B | C | E | F | G |
|---|---|---|---|---|---|---|
| Admin UX | 3 | 4 | 2 | 5 | 5 | TBD |
| Viewer UX | 4 | 4 | 3 | 5 | 4 | TBD |
| Data Model | 4 | 4 | 2 | 4 | 4 | TBD |
| Cross-Company | 3 | 4 | 2 | 5 | 5 | TBD |
| Scalability | 3 | 4 | 2 | 4 | 4 | TBD |
| UX Deviation | 4 | 4 | 3 | 4 | 4 | TBD |
| **Total** | **21** | **24** | **14** | **27** | **26** | **TBD** |

## Iteration History

### Round 1: Initial 5 concepts (A, B, C, E, F)
- Built all 5 concepts with shared viewer + admin
- Standardized data model: 9 authorization categories across all concepts
- Added cross-company support to Concept A
- Removed wizard from Concept F

### Round 2: Edge case fixes + cleanup
- Fixed Concept C viewer (bridge `allowedCategories` in `getCategoriesForLevel`)
- Removed orphaned `activeTab` state
- Removed ~193 lines wizard dead code
- Verified all 5 concepts work in viewer + admin

### Round 3: Concept validation review
- Scored all concepts across 6 criteria including UX deviation
- E wins (27/30), F runner-up (26/30), C lowest (14/30)
- Identified Concept G as unexplored direction
- Plan written for G implementation (~210 lines)

## Decision Log

| Decision | Rationale | Date |
|---|---|---|
| 9 categories (not per-field) | Sufficient for v1, matches existing YIM data groups | 2026-03-26 |
| Keep Concept C (bridge, don't drop) | Demonstrates sensitivity-level approach for comparison | 2026-03-26 |
| Concept E = winner | Highest score, lowest UX deviation, clearest mental model | 2026-03-26 |
| Plan Concept G | Task-driven derivation is lowest UX deviation + highest automation | 2026-03-26 |

---
*Last updated: 2026-03-26*
