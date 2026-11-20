import { expect, test } from '@playwright/test';

test('catálogo filtra por búsqueda', async ({ page }) => {
  await page.goto('/catalogo');
  await page.fill('[data-q]', 'zzzzzz');
  await expect(page.locator('[data-count]')).toContainText('0');
  await expect(page).toHaveURL(/q=zzzzzz/);
});

test('agregar un producto al carrito lo muestra en /carrito', async ({ page }) => {
  await page.goto('/catalogo/camiseta-de-argentina');
  await page.click('[data-add-button]');
  await expect(page.locator('[data-missing]')).toBeVisible();
  await page.click('label.option:has-text("M")');
  await page.click('[data-add-button]');
  await expect(page.locator('[data-cart-count]').first()).toHaveText('1');

  await page.goto('/carrito');
  await expect(page.locator('[data-lines] li')).toHaveCount(1);
  await expect(page.locator('[data-units]')).toContainText('1');
});

test('carrito corrupto en localStorage se muestra vacío', async ({ page }) => {
  await page.goto('/carrito');
  await page.evaluate(() => localStorage.setItem('rosalu-cart-v1', '{corrupt'));
  await page.reload();
  await expect(page.locator('[data-empty]')).toBeVisible();
});
