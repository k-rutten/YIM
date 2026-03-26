# YIM — UI Kit

> Extracted from Figma and prototype implementation.

## Colors
| Role | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary 700 | #265263 | yim-700 | Sidebar bg, headers, primary actions |
| Primary 600 | #346474 | yim-600 | Table headers, active states |
| Primary 500 | #6DAEBA | yim-500 | Buttons, tab active state, accents |
| Primary 400 | #92C3CC | yim-400 | Muted text, secondary text |
| Primary 300 | #B8D7DD | yim-300 | Borders, dividers |
| Primary 200 | #D8E6EA | yim-200 | Light borders, subtle dividers |
| Primary 100 | #ECF2F5 | yim-100 | Section dividers, row borders |
| Primary 50 | #F5F9FA | yim-50 | Hover states, subtle bg |
| Background | #F0F4F5 | yim-bg | Page background |
| Green | #2DA87E | yim-green | Success, "Actief" status |
| Red | #C84B5E | yim-red | Danger, destructive actions, "Geblokkeerd" |
| Orange | #E6A23C | yim-orange | Warnings |

## Typography
| Role | Font | Size | Weight |
|---|---|---|---|
| Page title | Nunito | 40px | Bold (700) |
| Section title | Nunito | 24px | Bold (700) |
| Sidebar title | Nunito | 32px | Normal (400) |
| Body | Nunito | 14px | Regular (400) |
| Table header | Nunito | 14px | Normal (400), white |
| Button | Nunito | 14px | Semibold (600) |
| Menu item | Nunito | 16px | Bold (700) |
| Caption | Nunito | 12px | Regular (400) |

## Spacing
Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Components
- Buttons: `rounded-md`, teal (`bg-yim-600`) filled primary, white outline secondary
- Cards: `rounded-[10px]`, `border border-yim-200`, white bg
- Tables: `rounded-[6px]`, teal header row, white body, `border #d8e6ea`
- Modals: White bg, `rounded-[10px]`, shadow, X close button, teal confirm / outline cancel
- Sidebar (Beheer): `bg-yim-700`, `border-radius: 0 0 100px 0`, white text
- Sidebar (MijnActies): `bg-yim-700`, `border-radius: 10px 110px 10px 10px`, decorative SVG
- Segmented tabs: `bg-[#f8fafb]`, `rounded-[8px]`, active `bg-[#6daeba]` white text
- Search: `border #b8babb`, `rounded-[4px]`, search icon on RIGHT in gray square
- Dropdown menu: `border #d8e6ea`, `rounded-[6px]`, `shadow-[0_4px_12px_rgba(0,0,0,0.1)]`

## DS Health

### Token Coverage
- Collections: Custom Tailwind config with `yim-*` prefix
- Modes: Light only (geen dark mode)
- Variable count: ~15 color tokens + spacing scale
- Gaps: Geen formele design token system in Figma, handmatig geextraheerd

### Gaps & Decisions
| Gap | Impact | Decision | Owner |
|---|---|---|---|
| Geen Figma variables/tokens | Kleuren hardcoded in prototype | Handmatig geextraheerd naar Tailwind config | Tech Agent |
| Blacklist niet in YIM core | Geen bestaande API/models | Fixture data in prototype, structuur volgt bestaande Person/Company models | Tech Agent |

*Last audited: 2026-03-26*
*Scope: Feature: blacklist*

## Figma Source
[YIM Visual Design](https://www.figma.com/design/2ysJdQTxQX7hLnYiMhBIFG/YIM---Visual-Design)
