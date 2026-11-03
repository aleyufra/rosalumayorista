import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import { decodeCart, getTotals, type CartLine } from '../lib/cart';

export const CART_STORAGE_KEY = 'rosalu-cart-v1';

export const $cart = persistentAtom<CartLine[]>(CART_STORAGE_KEY, [], {
  encode: JSON.stringify,
  decode: decodeCart,
});

export const $cartTotals = computed($cart, getTotals);
