# YIM (Nsecure) — DTS Pipeline

This repo uses the **Design That Ships** pipeline for prototype development.

## Setup

1. Clone the DTS pipeline repo alongside this client repo:
   ```
   git clone https://github.com/blisdigital/Claude-DesignThatShips.git
   ```
2. Ensure MCP connections are configured (see MCP Setup below).
3. Open this folder in Claude Code or Cowork.

## How to Use

Start every session by telling Claude:

```
Read the DTS pipeline from ../Claude-DesignThatShips/SKILL.md and work on feature [feature-name].
```

Claude will load the pipeline, bootstrap the session via Context Agent, and pick up where you left off.

## Pipeline Reference

- **SKILL.md** — Main pipeline: philosophy, steps, agent routing
- **agents/** — Agent instructions (Context, Brief, UX, Tech)
- **references/** — Figma skills, design principles, MCP tool mapping
- **templates/** — Context file templates

All pipeline files live in the DTS repo. This client repo contains only client-specific context.

## Context Structure

```
├─ constraints.md       ← Tech + platform constraints
├─ patterns.md          ← Confirmed patterns (grows over features)
├─ ui-kit.md            ← Design tokens + DS Health from Figma
├─ insights.md          ← User research, stakeholder feedback
├─ backlog.md           ← Queued features, deferred items
├─ figma-links.md       ← Figma file references
├─ process-lessons.md   ← Pipeline learnings
├─ design-system/
│  ├─ tokens.css        ← Client tokens (Tech Agent creates)
│  └─ components/       ← Promoted components after Ship Ready
├─ sources/
│  ├─ codebase/         ← Extracted YIM codebase (models, API, views, translations)
│  ├─ meetings/
│  ├─ input/
│  ├─ design/
│  └─ screenshots/
└─ features/
   └─ blacklist/        ← Blacklist beheer prototype (active)
```

## SharePoint Integration

Business context lives on SharePoint. The Context Agent reads from SharePoint at bootstrap.

- **Input (SharePoint → repo):** Team drops meeting notes, transcripts, screenshots, business docs on SharePoint. Context Agent processes new materials and routes to the right context files in this repo.
- **Output (repo → SharePoint):** Ship Ready deliverables (brief.md, prototype links, learnings) are shared back to SharePoint for the wider team.

SharePoint site: `CreativeBusinessStudio-Projectdocumentation` (Nsecure/YIM)

## Client: Nsecure / YIM

**Product:** YIM (Your Identity Management) — B2B SaaS platform voor identiteits- en toegangsbeheer.
**Stack:** .NET 8 + Vue 3 + TypeScript + Kendo UI, Azure hosted.
**Prototype stack:** Single-file React 18 SPA (CDN), Tailwind CSS, Vercel deploy.
**Blacklist:** Nieuw feature — bestaat alleen in AEOS connector, niet in YIM core.

## MCP Setup (required)

| MCP | Purpose | How to connect |
|---|---|---|
| **Figma Remote** (`mcp.figma.com/mcp`) | Read + write Figma files, DS audit | Add as remote MCP in Claude settings |
| **SharePoint** | Business context, meeting notes | Connect via Microsoft 365 MCP |

Optional but recommended:
- **ui-ux-pro-mcp** — Design pattern research
- **studio-design-mcp** — Mobbin/Dribbble reference
- **magic-mcp (21st.dev)** — Component generation

## Team Collaboration

Multiple people can work in this repo on different features simultaneously:
- Each feature has its own `features/[feature]/briefing.md` with independent pipeline state
- Client-level context (`constraints.md`, `patterns.md`, `ui-kit.md`) is shared and enriched by all
- Work sequentially on the same feature, or in parallel on different features

### What teammates need
1. Clone this repo + the DTS pipeline repo
2. Configure MCP connections (Figma, SharePoint)
3. Start a Claude session pointing at this folder

### What teammates DON'T need
- No special IDE or tooling beyond Claude Code/Cowork
- No knowledge of the pipeline internals — Claude handles routing
- No manual file editing — agents manage all context files
