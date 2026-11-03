// Shared helpers for build scripts: download a font once and turn text into SVG path data.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import opentype from 'opentype.js';

const CACHE = path.resolve(import.meta.dirname, '../.cache');

export const FONTS = {
  roboto: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-900-italic.woff',
  archivo: 'https://cdn.jsdelivr.net/fontsource/fonts/archivo@latest/latin-800-normal.woff',
  archivoBody: 'https://cdn.jsdelivr.net/fontsource/fonts/archivo@latest/latin-500-normal.woff',
};

export async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function loadFont(name) {
  const file = path.join(CACHE, `${name}.woff`);
  if (!(await exists(file))) {
    const res = await fetch(FONTS[name]);
    if (!res.ok) throw new Error(`Could not download ${FONTS[name]} (${res.status})`);
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  const buf = await readFile(file);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Lays out text glyph by glyph (with kerning) and returns its path data and bounding box. */
export function textPath(font, text, size) {
  const p = new opentype.Path();
  const glyphs = [...text].map((c) => font.charToGlyph(c));
  const scale = size / font.unitsPerEm;
  let x = 0;
  glyphs.forEach((g, i) => {
    p.extend(g.getPath(x, 0, size));
    x += g.advanceWidth * scale;
    const next = glyphs[i + 1];
    if (next) x += font.getKerningValue(g, next) * scale;
  });
  const bb = p.getBoundingBox();
  return { d: pathData(p.commands), x: bb.x1, y: bb.y1, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
}

// opentype.js toPathData() glues numbers together when a coordinate is -0 ("12.90" instead of
// "12.9 0"), which corrupts every glyph after it. Serialize the commands ourselves.
function pathData(commands) {
  const n = (v) => (Math.round(v * 10) / 10 || 0).toString();
  return commands
    .map((c) => {
      if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return 'Z';
    })
    .join('');
}
