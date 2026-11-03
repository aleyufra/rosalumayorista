import { describe, expect, it } from 'vitest';
import type { CartLine } from './cart';
import { buildOrderMessage, buildWhatsAppUrl } from './whatsapp';

const lines: CartLine[] = [
  {
    slug: 'remera',
    name: 'Remera básica',
    cashPrice: 9000,
    size: 'M',
    color: 'Negro',
    quantity: 2,
    photo: '',
  },
  { slug: 'te', name: 'Juego de té infantil', cashPrice: 7500, quantity: 1, photo: '' },
  { slug: 'taza', name: 'Taza cerámica', cashPrice: 2800, color: 'Blanco', quantity: 3, photo: '' },
];

// The brief's sample message says "$ 34.400", but 2 x 9.000 + 7.500 + 3 x 2.800 = 33.900.
// Format is matched exactly; the total is the correct sum.
const BRIEF_MESSAGE = [
  '¡Hola Rosalu! Soy Vero. Quiero consultar por este pedido:',
  '',
  '- 2 x Remera básica (Talle M, Color Negro): $ 9.000 c/u',
  '- 1 x Juego de té infantil: $ 7.500',
  '- 3 x Taza cerámica (Color Blanco): $ 2.800 c/u',
  '',
  'Unidades: 6',
  'Total estimado en efectivo: $ 33.900',
  '',
  'Lo retiro en el local. ¿Me confirman disponibilidad?',
].join('\n');

describe('buildOrderMessage', () => {
  it('matches the brief byte for byte', () => {
    expect(buildOrderMessage(lines, 'Vero')).toBe(BRIEF_MESSAGE);
  });

  it('uses plain spaces, never non-breaking ones', () => {
    expect(buildOrderMessage(lines, 'Vero')).not.toMatch(/ /);
  });

  it('drops the name sentence when the name is empty', () => {
    expect(buildOrderMessage(lines, '   ').split('\n')[0]).toBe(
      '¡Hola Rosalu! Quiero consultar por este pedido:',
    );
  });

  it('leaves excluded lines out of items, units and total', () => {
    const soldOut: CartLine = {
      slug: 'x',
      name: 'Muñeca',
      cashPrice: 12000,
      quantity: 1,
      photo: '',
      excluded: 'sold-out',
    };
    const message = buildOrderMessage([...lines, soldOut]);
    expect(message).not.toContain('Muñeca');
    expect(message).toContain('Unidades: 6');
    expect(message).toContain('$ 33.900');
  });

  it('trims and caps the customer name', () => {
    const first = buildOrderMessage(lines, `  ${'a'.repeat(80)}  `).split('\n')[0];
    expect(first).toBe(`¡Hola Rosalu! Soy ${'a'.repeat(60)}. Quiero consultar por este pedido:`);
  });
});

describe('buildWhatsAppUrl', () => {
  it('encodes line breaks and accents', () => {
    expect(buildWhatsAppUrl('5493880000000', 'Hola\nqué tal')).toBe(
      'https://wa.me/5493880000000?text=Hola%0Aqu%C3%A9%20tal',
    );
  });
});
