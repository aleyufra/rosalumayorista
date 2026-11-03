// Generates placeholder photos (same aspect ratio as the real ones) and seeds the 9 sample
// products. Existing files are never overwritten, so real photos and edited products are safe.
//
// Usage (Git Bash or any shell): pnpm placeholders
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { exists, loadFont, textPath } from './lib/text-paths.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PLACEHOLDERS = path.join(ROOT, 'src/assets/placeholders');
const PRODUCTS = path.join(ROOT, 'src/content/products');

const PAPER = '#EDEDED';
const CHARCOAL = '#262626';
const MUTED = '#5C5C5C';

const font = await loadFont('archivoBody');

/** A flat paper-grey frame with a dashed inset and a centred two-line label. */
async function placeholder(file, width, height, kicker, label) {
  if (await exists(file)) return false;
  const size = Math.round(width / 18);
  const big = textPath(font, label, size);
  const small = textPath(font, kicker, Math.round(size * 0.55));
  const scale = Math.min(1, (width * 0.82) / big.w);
  const inset = Math.round(width * 0.04);
  const cy = height / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="${PAPER}"/>
    <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" fill="none"
      stroke="${CHARCOAL}" stroke-opacity=".35" stroke-width="${Math.max(2, width / 400)}" stroke-dasharray="${width / 60} ${width / 90}"/>
    <path fill="${MUTED}" transform="translate(${(width - small.w) / 2 - small.x} ${cy - size * 0.9 - small.y})" d="${small.d}"/>
    <path fill="${CHARCOAL}" transform="translate(${(width - big.w * scale) / 2} ${cy + size * 0.2}) scale(${scale}) translate(${-big.x} ${-big.y})" d="${big.d}"/>
  </svg>`;
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(file);
  return true;
}

const PAGE_PHOTOS = [
  ['storefront.webp', 1500, 1000, 'Foto pendiente', 'Frente del local en calle Gorriti'],
  ['person.webp', 1000, 1250, 'Foto pendiente', 'Quien te atiende en el local'],
  ['map.webp', 1200, 800, 'Mapa', 'Calle Gorriti, San Salvador de Jujuy'],
];

const SAMPLES = [
  {
    slug: 'ejemplo-remera-basica-de-algodon',
    name: 'Remera básica de algodón',
    category: 'ropa',
    cashPrice: 9000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Negro', hex: '#262626' },
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    featured: true,
    photos: 2,
    description: 'Producto de ejemplo para probar el catálogo. Remera de algodón, cuello redondo.',
  },
  {
    slug: 'ejemplo-calza-deportiva',
    name: 'Calza deportiva',
    category: 'ropa',
    cashPrice: 8500,
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Negro', hex: '#262626' }],
    featured: true,
    photos: 1,
  },
  {
    slug: 'ejemplo-buzo-con-capucha',
    name: 'Buzo con capucha',
    category: 'ropa',
    cashPrice: 18000,
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Gris' }],
    available: false,
    photos: 1,
  },
  {
    slug: 'ejemplo-juego-de-te-infantil',
    name: 'Juego de té infantil',
    category: 'jugueteria',
    cashPrice: 7500,
    featured: true,
    photos: 2,
    description: 'Producto de ejemplo para probar el catálogo. Juego de té de plástico, 12 piezas.',
  },
  {
    slug: 'ejemplo-muneca-articulada',
    name: 'Muñeca articulada',
    category: 'jugueteria',
    cashPrice: 12000,
    featured: true,
    photos: 1,
  },
  {
    slug: 'ejemplo-autito-a-friccion',
    name: 'Autito a fricción',
    category: 'jugueteria',
    cashPrice: 4000,
    colors: [
      { name: 'Rojo', hex: '#C62828' },
      { name: 'Azul', hex: '#1E4FA3' },
    ],
    photos: 1,
  },
  {
    slug: 'ejemplo-taza-de-ceramica',
    name: 'Taza de cerámica',
    category: 'bazar',
    cashPrice: 2800,
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#262626' },
    ],
    featured: true,
    photos: 1,
  },
  {
    slug: 'ejemplo-set-de-6-vasos',
    name: 'Set de 6 vasos',
    category: 'bazar',
    cashPrice: 6500,
    photos: 1,
  },
  {
    slug: 'ejemplo-organizador-de-cocina',
    name: 'Organizador de cocina',
    category: 'bazar',
    cashPrice: 5000,
    featured: true,
    photos: 1,
  },
];

function frontmatter(p) {
  const lines = [
    '---',
    `name: '${p.name}'`,
    `category: ${p.category}`,
    `cashPrice: ${p.cashPrice}`,
    'photos:',
    ...Array.from({ length: p.photos }, (_, i) => `  - ./photo-${i + 1}.webp`),
  ];
  if (p.sizes?.length) lines.push('sizes:', ...p.sizes.map((s) => `  - '${s}'`));
  if (p.colors?.length) {
    lines.push('colors:');
    for (const c of p.colors) {
      lines.push(`  - name: ${c.name}`);
      if (c.hex) lines.push(`    hex: '${c.hex}'`);
    }
  }
  lines.push(`available: ${p.available ?? true}`, `featured: ${p.featured ?? false}`);
  if (p.description) lines.push(`description: '${p.description}'`);
  lines.push('isSample: true', `updatedAt: ${new Date().toISOString()}`, '---', '');
  return lines.join('\n');
}

let created = 0;
for (const [file, w, h, kicker, label] of PAGE_PHOTOS) {
  if (await placeholder(path.join(PLACEHOLDERS, file), w, h, kicker, label)) created++;
}
for (const p of SAMPLES) {
  const dir = path.join(PRODUCTS, p.slug);
  for (let i = 1; i <= p.photos; i++) {
    const kicker = i === 1 ? 'Foto de ejemplo' : `Foto de ejemplo ${i}`;
    if (await placeholder(path.join(dir, `photo-${i}.webp`), 1200, 1200, kicker, p.name)) created++;
  }
  const md = path.join(dir, 'index.md');
  if (!(await exists(md))) {
    await writeFile(md, frontmatter(p));
    created++;
  }
}
console.log(
  created ? `Listo: ${created} archivos nuevos.` : 'No había nada para generar: todo ya existe.',
);
