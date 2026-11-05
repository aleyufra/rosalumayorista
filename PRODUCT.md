# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 (100 % static output, no adapter), TypeScript strict, Tailwind CSS 4 via `@tailwindcss/vite`, Archivo variable (Fontsource, `wght` + `wdth` axes), nanostores for cart state, Sveltia CMS at `/admin` with the GitHub backend, deployed on Cloudflare Workers Static Assets. Chosen by the user; Workers over Pages confirmed by the user.

## Users

Primary: "Vero", a reseller from Jujuy, 28 to 45, a mother from neighbourhoods like Alto Comedero, Palpalá, Perico or El Carmen. She resells clothing, toys and housewares through WhatsApp statuses, Facebook, her neighbourhood or her workplace to add to or sustain her household income. Small capital she guards closely; buys often and in small quantities. She opens the site on her phone, often on mobile data, from a link in a WhatsApp status or an Instagram/TikTok bio. Her first fear is being scammed (paying and receiving nothing, or receiving something different from the photo); for her, trust outweighs price. Other fears: unsold stock, minimums she cannot afford, prices that change without notice, suppliers who look down on small buyers. She compares against Shein, Temu, second-hand American clothing and crossing to Bolivia.

Secondary: families buying at wholesale prices for their own use around Christmas, Reyes, Día del Niño and back to school.

## Product Purpose

Rosalu is a wholesale store (clothing, toys, housewares) with a physical shop on Juana Manuela Gorriti street, downtown San Salvador de Jujuy, Argentina. It sells through WhatsApp, Facebook, Instagram and TikTok; customers pick up in the shop. The website does not sell or charge online. Its three jobs, in order: build trust (real shop, visible face, published prices, guarantee); show the catalogue with prices so Vero can assemble her mix before coming; take her to WhatsApp with her order assembled, or to the shop.

## Positioning

"Mayorista desde 3": wholesale prices from only 3 products, mixed across the three categories, in a real local shop you can visit, with a known face. "En Rosalu no comprás por una foto: venís, lo ves y te lo llevás." A formal, physical store in a market full of faceless Instagram sellers.

## Operating Context

- Customers browse on low-end Android phones over mobile data; the site must work on a weak network.
- Orders are sent as a pre-filled WhatsApp message; the shop confirms availability and the customer pays and picks up in person.
- The catalogue and business data are edited by the developer and by the owner or shop manager, who is not technical, through Sveltia CMS. A change goes live after a Cloudflare build (a few minutes).

## Capabilities and Constraints

- Minimum purchase: 3 units, mixable across categories. Units of the same product count.
- Special price paying cash; Mercado Pago or bank transfer adds a fixed ARS amount per unit (editable in the CMS); each product shows that final price below the cash price.
- Garantía Rosalu 24 hs: exchange (not refund) within 24 hours for a faulty item or a different size/colour, with receipt, unused and with tag.
- No shipping, no online payment, no customer accounts, no per-variant stock (only available / sold out per product), no blog, single language.
- All prices published; never "info al privado" or "consultar precio".
- Same treatment for whoever buys 3 or 30.
- Code identifiers (folders, files, components, classes, tokens, variables, collections, field names) are in English; every visitor- or editor-facing text is in Spanish. Routes and URL parameters stay in Spanish because visitors see and share them.
- Undecided business facts (street number, Maps link, WhatsApp number, transfer surcharge, Mercado Pago, social links, visible person's name and role, domain, subcategories, real profit example) are tracked in `docs/PENDING.md` and shown as visible editable placeholders.

## Brand Commitments

- Logo: the word "Rosalu" in a very heavy italic grotesque, white on charcoal (`src/assets/brand/logo-original.jpg`; the black band at its bottom is an error to crop).
- Palette fixed by the user: charcoal `#262626`, white, magenta `#D128AF` as the brand colour.
- Typeface fixed by the user: Archivo, in three roles (black italic headings, condensed price tags, regular body).
- Design direction fixed by the user: "market price sign, faithful to the logo".
- Voice: Rioplatense Spanish with voseo, warm and direct like the owner of a downtown shop. Sentence case everywhere outside price tags. Buttons say exactly what happens.

## Evidence on Hand

- The logo file. Nothing else yet.
- No real product photos, no shop or staff photos, no testimonials, no contact data. None of these may be invented; sample products are clearly labelled as samples with fictitious round prices.

## Product Principles

1. Trust before price: every screen answers "is this real, and will I get what I see?".
2. Prices are always visible and stable; never hide a number.
3. The small buyer is the main buyer: 3 units is a full order, not a favour.
4. The physical shop is the proof: point to the street, the hours and the face.
5. Light on the phone: usable on a weak mobile connection before it is pretty.

## Accessibility & Inclusion

WCAG 2.2 AA contrast with the ratios recorded in the plan (magenta on charcoal only for large text and graphics), 44 px touch targets, full keyboard navigation, visible focus, real labels, `aria-live` for cart notices, `prefers-reduced-motion` respected.
