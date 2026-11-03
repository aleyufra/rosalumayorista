---
name: Rosalu
description: Mayorista desde 3. A downtown Jujuy wholesale shop's market price sign, set on the web.
colors:
  charcoal: "#262626"
  white: "#ffffff"
  magenta: "#d128af"
  magenta-dark: "#a51f8a"
  paper: "#ededed"
  muted: "#5c5c5c"
  mist: "#c9c9c9"
  rule: "#d4d4d4"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(8rem, 4rem + 18vw, 13.75rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0em"
    fontVariation: "'wdth' 70"
  headline-1:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(2.441rem, 1.9rem + 2.8vw, 3.33rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.015em"
  headline-2:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1.953rem, 1.6rem + 1.8vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title-3:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1.5625rem, 1.35rem + 1vw, 1.875rem)"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title-4:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.15rem + 0.5vw, 1.414rem)"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  tag-md:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 2rem + 2.4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 70"
    fontFeature: "'tnum' 1"
  tag-sm:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 70"
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Archivo Variable, Archivo Fallback, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.15
rounded:
  none: "0"
  field: "2px"
  button: "4px"
spacing:
  gutter: "1rem"
  gutter-wide: "2rem"
  section: "clamp(3.5rem, 2.5rem + 5vw, 7rem)"
  header: "3.5rem"
  header-wide: "4rem"
  content-max: "75rem"
components:
  button-primary:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.magenta-dark}"
    textColor: "{colors.white}"
  button-outline-dark:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-outline-dark-hover:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
  button-outline-light:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-outline-light-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.magenta-dark}"
    typography: "{typography.label}"
    height: "2.75rem"
  button-disabled:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.button}"
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.field}"
    padding: "0.6rem 0.85rem"
    height: "3rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "2.75rem"
  chip-selected:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
  market-tag:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.white}"
    typography: "{typography.tag-md}"
    rounded: "{rounded.none}"
  market-tag-sold-out:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    typography: "{typography.tag-sm}"
  site-header:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
    height: "{spacing.header}"
  pending-value:
    backgroundColor: "transparent"
    textColor: "currentColor"
    rounded: "{rounded.field}"
    padding: "0.05em 0.45em"
---

# Design System: Rosalu

## Overview

**Creative North Star: "The Hand-Hung Price Tag"**

Rosalu is a market price sign, faithful to the logo: a heavy italic wordmark in white on a charcoal field, and a magenta card tag hung by a string with a punched hole. Everything else on the site is the shop around that tag: white floor, paper-grey tables, full-bleed charcoal blocks, and published prices that hang off product photos the way they hang off goods on Gorriti street. The tag is the headline, not decoration; on the home page it is the H1.

The system is flat, square and loud only where money is. Photos are full-cornered rectangles without radius or shadow; surfaces are separated by tone (white, paper, charcoal), never by boxed cards. Magenta is reserved for tags, the primary action and small marks, so a magenta shape on screen almost always means a price or the next step. Missing business facts are never hidden or faked: they show as dashed "pending" frames, the same language a disabled control uses.

Motion is sparse. One orchestrated moment, the hero tag dropping onto its string, plus motion that answers an action (cart badge bump, menu, toasts) and product photos that morph between card and detail through cross-document view transitions. Everything respects reduced motion.

**Key Characteristics:**
- One signature form: the pointed, punched, tilted market tag, in three sizes.
- Three Archivo voices from one variable family: black italic titles, condensed 800 uppercase prices, regular body.
- Tonal blocks (white, paper, charcoal) instead of cards and shadows.
- Square geometry: 0 on photos and surfaces, 2px on fields, 4px on buttons.
- Dashed borders mean "pending", everywhere.
- 12-column grid from 64rem, content capped at 75rem.

## Colors

A three-colour brand (charcoal, white, magenta) fixed by the owner, with one darker magenta for small text and a short neutral ramp for structure.

### Primary
- **Market Magenta** (`magenta`): the tag body, the primary button, selection, the active nav underline, the cart badge, and short 2px marks such as list ticks. It carries white text at 4.5:1, so white labels on it stay at 16px bold or larger.
- **Deep Magenta** (`magenta-dark`): magenta that has to work as small text on light ground: text buttons, "Ver detalles", inline errors, the focus ring on light surfaces, the caret. Also the hover state of the primary button and of charcoal labels (category tiles, WhatsApp button), always with white text.

### Neutral
- **Logo Charcoal** (`charcoal`): body text, the header, full-bleed dark blocks (hero, guarantee, closing), category labels, selected chips and options, 2px field and chip strokes, heavy top rules over totals and trust items.
- **White** (`white`): page ground, text on charcoal and magenta, the focus ring on dark surfaces.
- **Shop Paper** (`paper`): alternating section ground (categories), image wells behind photos, disabled-button fill, stepper hover.
- **Muted Ink** (`muted`): secondary text on white or paper (meta, intros, counts, captions); the dashed stroke and text of disabled buttons.
- **Mist** (`mist`): secondary text on charcoal (hours, counts, guarantee list), and the tag's string.
- **Rule Grey** (`rule`): hairline dividers on light ground.

### Named Rules
**The Money Colour Rule.** Magenta is spent on tags, the primary button and small marks. It never fills a section, a card, or a heading.

**The Charcoal Contrast Rule.** Magenta on charcoal is for large text and graphics only (3.3:1): the tag body, the 2px nav underline, ticks. Deep Magenta never sits on charcoal as text or mark (2.3:1); on dark blocks, small accents are white or mist.

**The Focus Flip Rule.** The focus ring is 3px Deep Magenta at 3px offset on light ground and flips to white inside any dark (`on-dark`) block.

## Typography

**Display Font:** Archivo Variable (wght 100-900, wdth 62-125%), with a metric-matched Arial fallback (`Archivo Fallback`) so the swap does not shift layout.
**Body Font:** the same family.

**Character:** one family, three voices, mirroring the logo: a black italic for anything that names a thing, a condensed tabular uppercase for anything that costs money, and a plain regular for talking.

### Hierarchy
- **Display / Tag XL** (800, 70% width, `display` clamp up to 13.75rem, line-height 1): only the hero tag numeral; its words sit inside at 0.205em.
- **Headline 1** (900 italic, `headline-1`, line-height 1, -0.015em): page titles and the closing call.
- **Headline 2** (900 italic, `headline-2`, line-height 1.05): section titles; the product name on the detail page.
- **Title 3 / 4** (900 italic, `title-3` / `title-4`): related-products and empty-state titles, category tile names, dialog titles.
- **Lead** (500, `lead`, 1.45): the hero subtitle, about 34ch.
- **Body** (400, `body`, 1.5): running text, held to 65ch by the measure helper.
- **Small** (400, 0.875rem, 1.45): meta, counts, captions.
- **Label** (600-700, 1rem): buttons (700), nav and chip labels (600), product names on cards (600).
- **Tag MD / SM** (800, 70% width, tabular, uppercase): product-page price and cart total (md), prices on photos (sm).

### Named Rules
**The Three Voices Rule.** Titles are black italic; prices are condensed 800 tabular uppercase; everything else is regular or medium upright. No fourth voice, no second family.

**The Price Voice Rule.** The condensed uppercase voice belongs to prices: inside a market tag, or as a bare price figure (cart total, mobile buy bar, the "Los 3 juntos" total). It never sets a heading, a label or a sentence.

**The Sentence Case Rule.** Outside the price voice, all copy is sentence case. No tracked-out uppercase labels.

## Layout

Mobile-first single column with a 1rem gutter, becoming a 12-column grid (1.5rem gaps) with a 2rem gutter at 64rem. The content column is capped at 75rem plus gutters and centred. A 2-column step appears at 48rem where it helps (hero buttons side by side, product grids). Sections breathe on a fluid rhythm (`section`, 3.5rem to 7rem) and alternate tonal ground (white, paper, full-bleed charcoal) rather than drawing borders between them.

The header is sticky charcoal, 3.5rem tall (4rem from 64rem), and the hero continues the same charcoal so the tag's string can cross the header's bottom rail (a 1px white line at 14%). On desktop the hero tag spans columns 1 to 7 and a white sample-mix panel sits in 8 to 12.

Photos carry fixed aspect tokens: product 1:1, category 4:5 (the lead "ropa" tile 4:3), storefront 3:2, person 4:5, map 3:2. Touch targets are at least 2.75rem; primary controls 3rem.

## Elevation & Depth

The world is flat. Depth comes from tone (white over paper, white over charcoal) and from heavy 2px charcoal strokes and top rules, not from lifted boxes. The single shadow in the system belongs to the market tag, because a card tag hanging off goods physically casts one.

### Shadow Vocabulary
- **Tag cast** (`filter: drop-shadow(0 2px 0 rgb(0 0 0 / 0.18)) drop-shadow(0 6px 8px rgb(0 0 0 / 0.16))`): on every market tag; a filter, so it follows the clipped point and the punched hole.

### Named Rules
**The One Shadow Rule.** Only the tag casts a shadow. Panels, cards, photos, buttons and dialogs stay flat; a dialog separates with a 2px charcoal stroke and a charcoal scrim at 60%.

## Shapes

Square by default. Photos, sections, panels and the confirm dialog have no radius. Inputs, chips, option pills, steppers and pending frames take a barely softened 2px corner; buttons take 4px. Fully round forms appear only where the control is round by nature: the cart count badge, the switch track and knob, colour swatch dots.

The recurring silhouette is the market tag: a rectangle with a pointed left end (a five-point polygon), a round hole punched through it (a radial mask, so the real background shows through), tilted -2deg (-2.5deg in the hero), and optionally threaded on a 2px mist string. All of its geometry is in em, so it keeps its proportions at every size. Under forced colours it drops the clip and mask and becomes a 2px bordered box.

The dashed border is a shape with a meaning: 1.5px to 2px dashed means "pending", used by the pending-value marker, disabled buttons and photo placeholders.

## Components

### Market Tag (signature)
The price, hung on the thing. Magenta body, white condensed figures, pointed left end, punched hole, tilt, tag cast.
- **Sizes:** XL is the hero H1 ("Mayorista desde 3"), with small stacked words and a giant numeral. MD is the product-page price and cart total. SM sits on product photos, overhanging the photo's left edge by about 0.35rem near the bottom.
- **Tones:** magenta for a live price; charcoal for "Agotado", with the sold-out photo grayscaled at 55% opacity and the old price struck through in the meta line.
- **String:** optional 2px mist line from the hole, rotated 24deg; in the hero it reaches up through the header rail.
- **Drop:** the hero tag falls 0.35em from -9deg and settles on its tilt in 650ms with the overshoot easing `ease-drop`. Transform only, opacity stays 1. Skipped under reduced motion and when the page was reached through a view transition.

### Buttons
- **Shape:** gently squared (4px), 2px border, 3rem minimum height, 0.75rem by 1.25rem padding, 1rem bold label.
- **Primary:** magenta with white text; hover Deep Magenta. One per view region, for the next step ("Ver catálogo", sending the order).
- **Outline dark / light:** 2px charcoal or white stroke on transparent; hover fills with the stroke colour and inverts the text. Light outline is the secondary action on charcoal blocks.
- **Text:** Deep Magenta, 2px underline, 2.75rem tall; hover turns charcoal.
- **Active:** nudges down 1px. Colour transitions are 140ms ease-out.
- **Disabled:** reads as pending: paper fill, 2px dashed muted stroke, muted text, and a label saying what is missing ("WhatsApp: falta cargar el número").

### Chips and Options
- **Style:** 2px charcoal stroke, 2px radius, 600 label, 2.75rem tall, on transparent.
- **Selected:** charcoal fill, white text. Focus ring is drawn on the visible pill when the hidden input has focus.
- Category filter chips scroll horizontally on mobile; size and colour options wrap, colours with a round swatch dot.

### Product Card
- **Corner Style:** none. No border, no shadow, no card fill.
- **Photo:** 1:1 on a paper well, cover-cropped, carrying `view-transition-name: product-<slug>` so it morphs into the detail gallery.
- **Body:** 600 name at 1rem, small muted category line, and a Deep Magenta underlined "Ver detalles" pinned to the bottom. Hover underlines the name and turns the link charcoal.
- **Sample marker:** a small charcoal "Ejemplo" label in the photo's top right for fictitious products.

### Inputs / Fields
- **Style:** 2px charcoal stroke, 2px radius, white fill, 3rem tall, 0.6rem by 0.85rem padding, labels above in 600-700.
- **Steppers:** the same stroke with 2.75rem square buttons and a tabular 700 centre field divided by 2px charcoal rules; hover fills paper.
- **Focus:** the global 3px focus ring; caret is Deep Magenta.
- **Error:** a Deep Magenta 600 message under the group, and the group legend turns Deep Magenta.

### Navigation
- **Header:** sticky charcoal bar, white wordmark, white 600 links. Hover and current page get a 2px magenta underline at the link's bottom edge. Cart icon with a round magenta tabular count that bumps (scale 1.35, 320ms) when units increase.
- **Mobile:** a menu button opens a charcoal panel under the bar with 3rem links at 1.125rem, entering in 200ms; Escape closes it and returns focus.
- **View transitions:** the header is its own transition group and does not animate, so it holds still while the page changes under it.

### Section Blocks
- **Charcoal block:** full-bleed charcoal with white text, mist secondary text, white focus ring, white-outline secondary button.
- **Paper block:** full-bleed paper ground with white tiles on it.
- **Trust items and totals:** a heavy charcoal top rule (2px or more) over a bold title or total row, instead of an icon or a box.
- **Category tile:** photo or dashed placeholder with a charcoal label block at bottom left (900 italic name, mist count); hover turns the label Deep Magenta.

### Pending Value
An honest placeholder for a business fact the owner has not loaded yet: "Falta cargar: <dato>" in a 1.5px dashed currentColor frame with a 2px radius, at 0.875em, medium weight, 85% opacity. It inherits colour, so it works on white and on charcoal.

## Do's and Don'ts

### Do:
- **Do** put every price in a market tag or in the condensed price voice; never hide a number.
- **Do** keep magenta for tags, the primary button and small marks; use Deep Magenta for small magenta text on light ground.
- **Do** separate sections by tone (white, paper, full-bleed charcoal) and group content with 2px charcoal rules.
- **Do** keep photos square-cornered on paper wells at their aspect tokens, and give each product photo its `product-<slug>` transition name exactly once per page.
- **Do** show missing data and unavailable actions with the dashed pending language and a label that says what is missing.
- **Do** gate every animation behind `prefers-reduced-motion: no-preference`, animate transform (and opacity only for entering panels), and use `ease-settle` for state changes.
- **Do** keep touch targets at 2.75rem or more and the focus ring visible on every interactive element.

### Don't:
- **Don't** set magenta or Deep Magenta text on charcoal below large size; Deep Magenta never appears on charcoal at all.
- **Don't** use the condensed uppercase voice for headings, labels, navigation or sentences.
- **Don't** add shadows to cards, panels, photos, buttons or dialogs; the tag cast is the only shadow.
- **Don't** round photos or surfaces, or go past 4px on rectangular controls.
- **Don't** add a second orchestrated entrance; the hero tag drop is the only one, and its overshoot easing (`ease-drop`) is reserved for it.
- **Don't** use dashed borders for anything other than "pending" or disabled.
