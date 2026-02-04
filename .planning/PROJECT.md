# Poppies — Visual Overhaul

## What This Is

Poppies is een browser-based 2D platformer (piratenthema) gebouwd met vanilla JavaScript en HTML5 Canvas. Het project vervangt de procedureel gegenereerde achtergrond door eigen artwork in meerdere parallax-lagen: een foto als verre achtergrond, getekende wolken als middenlaag, een eigen zon-sprite, en een handgetekende voorgrond voor de grond.

## Core Value

De game krijgt een unieke, persoonlijk getekende visuele identiteit door de procedurele achtergrond te vervangen met handgemaakte artwork in lagen — zonder de bestaande gameplay aan te raken.

## Requirements

### Validated

- ✓ Game loop met physics (gravity, velocity, collision) — existing
- ✓ Procedurele wereldgeneratie (vloer, platformen, vijanden, munten, kanonnen) — existing
- ✓ Spelerbesturing (keyboard + touch) — existing
- ✓ AABB collision detection — existing
- ✓ Camera-volgsysteem — existing
- ✓ Procedurele audio via Web Audio API — existing
- ✓ Responsive canvas scaling (1200×700 logische resolutie) — existing
- ✓ High score persistence (localStorage) — existing
- ✓ 3 levels met moeilijkheidsprogressie — existing
- ✓ Custom player sprites (poppy1-4.png) — existing
- ✓ Custom enemy sprites (enemy1-4.png) — existing
- ✓ Custom cannon sprite (canon.png) — existing
- ✓ Doodle/hand-drawn visuele stijl voor platformen — existing
- ✓ Start/game-over/level-complete/game-won schermen — existing
- ✓ iPad touch controls — existing
- ✓ Fullscreen support — existing

### Active

- [ ] Verre achtergrond: foto (lucht + water) als langzaamste parallax-laag (~5% camerasnelheid), ~1400×700px
- [ ] Middenlaag: handgetekend wolkenbeeld als vast beeld op ~15% parallax, ~1800×700px
- [ ] Zon-sprite: eigen getekende zon als apart element met eigen parallax-snelheid
- [ ] Voorgrond: handgetekende grond (5000×700px) die de procedurele vloertekening vervangt, scrollt op 100%
- [ ] Image loading systeem voor de nieuwe lagen (met fallback naar huidig procedureel systeem)
- [ ] Verwijder procedurele achtergrond-rendering (wolken, zon, zee uit drawBackground())

### Out of Scope

- Zwevende platformen visueel vervangen — blijven in doodle-stijl, past bij het thema
- Vijanden/munten visueel vervangen — blijven procedureel getekend
- Nieuwe gameplay mechanics — focus is puur visueel
- Audio wijzigingen — procedurele audio blijft ongewijzigd
- Nieuw level design — wereldgeneratie blijft hetzelfde

## Context

- Bestaande codebase: 3 bestanden (index.html, style.css, game.js ~1942 regels)
- Geen build process, geen dependencies, geen frameworks
- `drawBackground()` functie (regels 1013-1110) tekent momenteel procedureel: lucht, wolken, zon met gezichtje, zee met golven
- Parallax werkt nu op `cameraX * 0.15` voor wolken en `cameraX * 0.03` voor de zon
- Camera verplaatst max ~3800px (worldWidth 5000 - scherm 1200)
- Assets staan in `assets/` directory
- Alle artwork moet nog gemaakt worden door de gebruiker — is bezig met tekenen

### Asset specificaties

| Asset | Formaat | Afmetingen | Status |
|-------|---------|------------|--------|
| Achtergrond foto | PNG/JPG | ~1400×700px | Nog niet klaar |
| Wolkenlaag | PNG (transparant) | ~1800×700px | Nog niet klaar |
| Zon sprite | PNG (transparant) | Klein (bijv. 200×200px) | Nog niet klaar |
| Voorgrond grond | PNG (transparant) | 5000×700px | In productie |

## Constraints

- **Tech stack**: Vanilla JS, HTML5 Canvas, CSS — geen frameworks, geen build process
- **Compatibiliteit**: Moet werken op alle huidige browsers + iPad (touch)
- **Performance**: Image loading mag de game loop niet blokkeren — lazy loading met fallback
- **Assets**: Afbeeldingen worden aangeleverd door gebruiker, code moet werken met of zonder ze (graceful fallback)
- **Bestaande code**: Gameplay, collision, entities mogen niet veranderen

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Foto als verre achtergrond (niet getekend) | Mix van fotorealisme en cartoon geeft uniek effect | — Pending |
| Wolken als vast beeld (niet tileable) | Eenvoudiger te tekenen, wereld is eindig (5000px) | — Pending |
| Zon als apart sprite (niet in achtergrondlaag) | Kan eigen parallax-snelheid hebben, flexibeler | — Pending |
| Graceful fallback naar procedureel | Assets zijn nog niet klaar, game moet altijd speelbaar blijven | — Pending |

---
*Last updated: 2026-02-04 after initialization*
