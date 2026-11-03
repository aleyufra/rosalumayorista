// Builds every brand asset from the original logo and the typeface it was set in.
//
// Finding (Phase 1): the "Rosalu" wordmark in logo-original.jpg is Roboto Black Italic
// (98.7 % pixel overlap, same 3.95 aspect ratio), so the wordmark is rebuilt as vector
// paths instead of shipping a raster. Roboto is Apache-2.0 licensed.
//
// Usage (Git Bash or any shell): pnpm logo
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { exists, loadFont, textPath } from './lib/text-paths.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(ROOT, 'src/assets/brand');
const PUBLIC = path.join(ROOT, 'public');

const CHARCOAL = '#262626';
const MAGENTA = '#D128AF';
const MIST = '#C9C9C9';
const WHITE = '#FFFFFF';

/** Hanging tag outline: pointed left end, the same geometry as the MarketTag component. */
function tagShape(x, y, w, h, fill) {
  const tip = h * 0.32;
  const hole = { cx: x + tip + h * 0.08, cy: y + h / 2, r: h * 0.075 };
  return `<g transform="rotate(-2.5 ${x + w / 2} ${y + h / 2})">
    <path fill-rule="evenodd" fill="${fill}" d="M${x} ${y + h / 2} L${x + tip} ${y} H${x + w} V${y + h} H${x + tip} Z
      M${hole.cx - hole.r} ${hole.cy} a${hole.r} ${hole.r} 0 1 0 ${hole.r * 2} 0 a${hole.r} ${hole.r} 0 1 0 ${-hole.r * 2} 0 Z"/>
  </g>`;
}

async function main() {
  const original = path.join(BRAND, 'logo-original.jpg');
  if (!(await exists(original))) {
    console.error(
      'Falta src/assets/brand/logo-original.jpg. Copiá el logo ahí y volvé a correr pnpm logo.',
    );
    process.exit(1);
  }

  // 1. Crop the black band at the bottom of the original (rows darker than the #262626 field).
  const { data, info } = await sharp(original)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rowMean = (y) => {
    let sum = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / info.width;
  };
  let bandTop = info.height;
  for (let y = info.height - 1; y >= 0 && rowMean(y) < 15; y--) bandTop = y;
  const side = Math.min(info.width, bandTop);
  await sharp(original)
    .extract({
      left: Math.round((info.width - side) / 2),
      top: Math.round((bandTop - side) / 2),
      width: side,
      height: side,
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND, 'logo-cropped.png'));
  console.log(`Franja negra recortada: ${info.height - bandTop} px. Logo cuadrado de ${side} px.`);

  // 2. Vector wordmark (currentColor, so the header can paint it).
  const roboto = await loadFont('roboto');
  const word = textPath(roboto, 'Rosalu', 1000);
  const vb = `${word.x.toFixed(1)} ${word.y.toFixed(1)} ${word.w.toFixed(1)} ${word.h.toFixed(1)}`;
  const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor"><path d="${word.d}"/></svg>\n`;
  await writeFile(path.join(BRAND, 'wordmark.svg'), wordmark);

  // 3. Favicons: the italic "R" from the wordmark on the charcoal field.
  const r = textPath(roboto, 'R', 1000);
  const pad = r.h * 0.22;
  const box = r.h + pad * 2;
  const rx = r.x - (box - r.w) / 2;
  const ry = r.y - pad;
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rx.toFixed(1)} ${ry.toFixed(1)} ${box.toFixed(1)} ${box.toFixed(1)}"><rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${box.toFixed(1)}" height="${box.toFixed(1)}" fill="${CHARCOAL}"/><path fill="${WHITE}" d="${r.d}"/></svg>\n`;
  await mkdir(PUBLIC, { recursive: true });
  await writeFile(path.join(PUBLIC, 'favicon.svg'), faviconSvg);
  await sharp(Buffer.from(faviconSvg), { density: 72 })
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC, 'favicon-32.png'));

  // 4. Apple touch icon: full wordmark on charcoal, 180 x 180.
  const touchW = 150;
  const touchH = (touchW * word.h) / word.w;
  const touchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="${CHARCOAL}"/><svg x="${(180 - touchW) / 2}" y="${(180 - touchH) / 2}" width="${touchW}" height="${touchH}" viewBox="${vb}"><path fill="${WHITE}" d="${word.d}"/></svg></svg>`;
  await sharp(Buffer.from(touchSvg)).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));

  // 5. Open Graph 1200 x 630: wordmark plus the "Mayorista desde 3" tag, text set as Archivo paths.
  const archivo = await loadFont('archivo');
  const ogWordW = 560;
  const ogWordH = (ogWordW * word.h) / word.w;
  const line = textPath(archivo, 'MAYORISTA DESDE 3', 64);
  const tagH = 120;
  const tagW = line.w + tagH * 0.32 + 120;
  const tagX = 1200 - 80 - tagW;
  const tagY = 630 - 80 - tagH;
  const textArea = tagX + tagH * 0.32 + 40;
  const textX = textArea + (tagX + tagW - textArea - line.w) / 2 - line.x;
  const textY = tagY + (tagH - line.h) / 2 - line.y;
  const body = await loadFont('archivoBody');
  const sub = textPath(body, 'Ropa, juguetería y bazar en San Salvador de Jujuy', 34);
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="${CHARCOAL}"/>
    <svg x="80" y="96" width="${ogWordW}" height="${ogWordH}" viewBox="${vb}"><path fill="${WHITE}" d="${word.d}"/></svg>
    <path fill="${MIST}" transform="translate(${80 - sub.x} ${96 + ogWordH + 44 - sub.y})" d="${sub.d}"/>
    ${tagShape(tagX, tagY, tagW, tagH, MAGENTA)}
    <g transform="rotate(-2.5 ${tagX + tagW / 2} ${tagY + tagH / 2})"><path fill="${WHITE}" transform="translate(${textX} ${textY})" d="${line.d}"/></g>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, 'og.png'));

  console.log(
    'Listo: wordmark.svg, logo-cropped.png, favicon.svg, favicon-32.png, apple-touch-icon.png, og.png',
  );
}

await main();
