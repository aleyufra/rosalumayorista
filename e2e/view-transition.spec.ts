import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

// Anota que elementos tienen nombre de transicion cuando aparece cada pagina.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    addEventListener('pagereveal', (e) => {
      const vt = (e as Event & { viewTransition?: ViewTransition }).viewTransition;
      void vt?.ready.then(() => {
        const names = [...document.querySelectorAll('*')]
          .map((el) => getComputedStyle(el).viewTransitionName)
          .filter((n) => n && !['none', 'root', 'site-header'].includes(n));
        sessionStorage.setItem(`vt:${location.pathname}`, JSON.stringify(names));
      });
    });
  });
});

const namesOn = (page: import('@playwright/test').Page, path: string) =>
  page.evaluate((p) => JSON.parse(sessionStorage.getItem(`vt:${p}`) ?? 'null'), path);

test('solo la foto del producto abierto se transforma, ida y vuelta', async ({ page }) => {
  const slug = 'camiseta-de-argentina';
  // Calienta el servidor de desarrollo: si la pagina tarda mas de ~4 s, Chrome cancela la transicion.
  await page.goto(`/catalogo/${slug}`);
  await page.goto('/catalogo');
  await page.locator(`a[href="/catalogo/${slug}"]`).first().click();
  await page.waitForURL(`**/catalogo/${slug}`);
  await expect.poll(() => namesOn(page, `/catalogo/${slug}`)).toEqual([`product-${slug}`]);

  await page.goBack();
  await page.waitForURL('**/catalogo');
  await expect.poll(() => namesOn(page, '/catalogo')).toEqual([`product-${slug}`]);
});
