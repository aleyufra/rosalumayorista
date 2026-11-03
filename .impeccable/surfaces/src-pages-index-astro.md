---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/catalogo","src/pages/carrito.astro"]
---

## Scope

Landing page `/` (Persuade). Catalogue, product and cart routes are Operate surfaces that inherit this world.

## Audience and job

Vero, a reseller from Jujuy on a phone with mobile data, arriving from a WhatsApp status or social bio. She must believe Rosalu is a real shop with a known face and published prices, then open the catalogue or message on WhatsApp.

## Section order (user-approved)

Hero, trust strip, categories, featured, how to buy, real shop ("No comprás por una foto"), guarantee, profit example, season (only when active), FAQ, closing.

## Direction contract

THESIS: the hand-hung price tag is the promise. The page opens with the "Mayorista desde 3" tag as its headline; it refuses the photo hero with overlaid text and the icon row of benefits.

OWN-WORLD: white ground and neutral paper grey (#EDEDED) with full-bleed charcoal (#262626) blocks like the logo's field. Magenta (#D128AF) only on tags, primary buttons and small details. Archivo in three voices: black italic headings, condensed 800 uppercase inside tags only, regular body. Photos without radius, no shadowed boxes; product photos travel between pages.

STORY: in one viewport Vero understands "from 3, mixed, real shop". She sees prices on the second scroll, trusts the face and the street address, and builds her order or taps WhatsApp.

FIRST VIEWPORT: at 360 px, a 56 px charcoal header; a charcoal block holding the giant hanging tag as the H1, rotated -2.5 degrees, "MAYORISTA DESDE" small and the "3" huge, about 80 % wide, hung by a string that crosses the header's bottom rail (the crossing between blocks; amended during the build so the H1 stays first in reading order; approved by the user on 2026-11-03, answer: "Dejarlo colgando del hilo"); an 18 px white subtitle; full-width magenta "Ver catálogo" and white-outline "Consultar por WhatsApp"; the line "Hoy abrimos de 10 a 20" with the address. On desktop the tag spans columns 1 to 7 and columns 8 to 12 show a sample mix of 3 featured products with their small tags.

FORM: brief-pinned direction, market price sign; no candidate list. seed:face1ac6dea28f30 (direction pinned by the brief; the roll was run for the reference only)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

On load the hero tag drops and settles into its tilt (650 ms, transform only, opacity stays 1). Skipped when arriving through a view transition and under reduced motion. Cross-document view transitions morph product photos between card and detail.

## Unresolved

Logo as SVG versus PNG, decided in Phase 1 by overlay against Archivo 900 italic and Roboto Black Italic.
