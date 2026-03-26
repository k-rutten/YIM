# Design System

Per-client design system dat groeit met elke feature. Begint klein — tokens + eerste componenten uit feature 1 — en wordt rijker naarmate meer features door de pipeline gaan.

## Structuur

```
design-system/
├─ tokens.css        ← Client-level tokens, single source of truth
├─ components/       ← Bewezen componenten gepromoveerd na Ship Ready
│  ├─ index.md       ← Registry: wat bestaat, wanneer te gebruiken
│  └─ [naam].jsx     ← Componentcode + inline docs
└─ README.md         ← Dit bestand
```

## Hoe het groeit

1. **Feature 1:** Tech Agent extraheert tokens uit `ui-kit.md` → `design-system/tokens.css`. Bouwt componenten voor de feature.
2. **Ship Ready:** Bij Knowledge Capture beoordeelt Tech Agent welke componenten herbruikbaar zijn. Alleen componenten die de Decision gate doorstaan worden gepromoveerd.
3. **Feature 2+:** Tech Agent leest `design-system/` eerst. Hergebruikt wat er is, bouwt alleen wat nieuw is.

## Promotiecriteria

Een component wordt gepromoveerd wanneer:
- Het de Decision gate heeft doorstaan (niet alleen gebouwd, maar bewezen)
- Het generiek genoeg is voor hergebruik (niet feature-specifiek)
- Het tokens uit `tokens.css` gebruikt (geen hardcoded waarden)

## tokens.css

Eenmalig aangemaakt bij eerste feature, daarna geïmporteerd door alle prototypes.
Bron: `ui-kit.md` → gedestilleerd naar CSS custom properties.

Bij discrepanties tussen `ui-kit.md` en `tokens.css`: ui-kit.md wint (dat is de bron van waarheid van de klant).
