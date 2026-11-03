import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'public/admin/',
      '.wrangler/',
      'scripts/.tmp/',
      'scripts/.cache/',
    ],
  },
  tseslint.configs.strict,
  astro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
