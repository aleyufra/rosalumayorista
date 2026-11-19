import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import { decodeCart, getTotals, type CartLine } from '../lib/cart';

// El sufijo -v1 de la clave permite cambiar el formato del carrito a futuro (v2) sin romper
// los carritos ya guardados en los navegadores.
export const CART_STORAGE_KEY = 'rosalu-cart-v1';

// Se guarda en localStorage; decodeCart descarta datos corruptos en vez de romper la pagina.

export const $cart = persistentAtom<CartLine[]>(CART_STORAGE_KEY, [], {
  encode: JSON.stringify,
  decode: decodeCart,
});

export const $cartTotals = computed($cart, getTotals);
