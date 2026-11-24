import { expect, test, type Page } from '@playwright/test';

const line = {
  slug: 'pava-electrica-philco',
  name: 'Pava Electrica Philco',
  cashPrice: 34000,
  quantity: 3,
  photo: '',
};

async function seedCart(page: Page, quantity = 3) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    ['rosalu-cart-v1', JSON.stringify([{ ...line, quantity }])] as const,
  );
}

test('enviar pedido abre WhatsApp con el mensaje armado', async ({ page }) => {
  await seedCart(page);
  await page.addInitScript(() => {
    (window as unknown as { opened: string[] }).opened = [];
    window.open = (url) => {
      (window as unknown as { opened: string[] }).opened.push(String(url));
      return null;
    };
  });
  await page.goto('/carrito');
  await expect(page.locator('[data-units]')).toContainText('3');
  await page.fill('#customer-name', 'Vero');
  await page.getByRole('button', { name: /Enviar pedido por WhatsApp/ }).click();

  const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
  expect(opened).toHaveLength(1);
  const url = new URL(opened[0] ?? '');
  expect(url.href).toContain('5493885846033');
  const text = url.searchParams.get('text') ?? '';
  expect(text).toContain('Vero');
  expect(text).toContain('Pava Electrica Philco');
});

test('reservar con Mercado Pago manda solo slug y cantidad y redirige a initPoint', async ({
  page,
}) => {
  await seedCart(page);
  let body: { name: string; phone: string; lines: Record<string, unknown>[] } | undefined;
  await page.route('**/api/checkout', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      json: { initPoint: 'http://localhost:4321/mp-simulado', orderCode: 'TEST-1' },
    });
  });
  await page.route('**/mp-simulado', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Mercado Pago simulado</h1>' }),
  );

  await page.goto('/carrito');
  const submit = page.locator('[data-mp-submit]');
  await expect(submit).toBeEnabled();

  // Validación del formulario antes de llamar al servidor.
  await submit.click();
  await expect(page.locator('[data-mp-error]')).toContainText('nombre');

  await page.fill('#mp-name', 'Vero');
  await page.fill('#mp-phone', '3885123456');
  await submit.click();

  await expect(page).toHaveURL(/mp-simulado/);
  expect(body?.name).toBe('Vero');
  expect(body?.lines).toEqual([
    expect.objectContaining({ slug: 'pava-electrica-philco', quantity: 3 }),
  ]);
  expect(body?.lines[0]).not.toHaveProperty('cashPrice');
  const pending = await page.evaluate(() => sessionStorage.getItem('rosalu-pending-payment'));
  expect(JSON.parse(pending ?? '{}')).toMatchObject({ orderCode: 'TEST-1' });
});

test('si el servidor falla, muestra el error y deja reintentar', async ({ page }) => {
  await seedCart(page);
  await page.route('**/api/checkout', (route) =>
    route.fulfill({ status: 500, json: { error: 'Mercado Pago no responde.' } }),
  );
  await page.goto('/carrito');
  await page.fill('#mp-name', 'Vero');
  await page.fill('#mp-phone', '3885123456');
  await page.locator('[data-mp-submit]').click();
  await expect(page.locator('[data-mp-error]')).toHaveText('Mercado Pago no responde.');
  await expect(page.locator('[data-mp-submit]')).toBeEnabled();
});
