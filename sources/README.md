# Sources

Gedeelde context voor dit project. De Context Agent verwerkt alles wat hier binnenkomt.

## Folders

### meetings/
Meeting transcripties, call notes, workshop output. De Context Agent leest ze,
bespreekt de inzichten met je, en verwerkt de conclusies in de relevante bestanden
(constraints.md, briefing.md, patterns.md).

Naamconventie: `YYYY-MM-DD-onderwerp.md`

### input/
Jouw notities, inzichten, stakeholder feedback, en losse markdown. Alles wat je
handmatig wilt aanleveren als context — van een snelle observatie tot een uitgewerkte
analyse. De Context Agent verwerkt dit naar de juiste bestanden.

Naamconventie: `YYYY-MM-DD-onderwerp.md` of vrij.

### design/
UI Kits, Figma exports, design tokens, style guides. De Context Agent destilleert
hieruit `ui-kit.md` en verwijst ernaar vanuit `figma-links.md`.

### screenshots/
Referentiescreenshots voor visuele inspiratie. De Context Agent beschrijft
wat hij ziet en meldt het aan de UX Agent. Jouw curatie is sterker dan welke
MCP search ook.

## Routing

De Context Agent verwerkt alles wat hier binnenkomt en routeert naar het juiste bestand:

| Bron | Routeert naar |
|---|---|
| Meeting transcript | `constraints.md`, `insights.md`, flag voor `briefing.md` |
| Jouw notities/input | `insights.md`, `backlog.md`, of flag voor Brief Agent |
| UI Kit / Figma export | `ui-kit.md`, `figma-links.md` |
| Screenshot | UX Agent context, `patterns.md` kandidaat |
| SharePoint / DevOps link | `sources/` + samenvatting in relevant bestand |
