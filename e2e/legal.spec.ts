import { expect, test } from '@playwright/test';

test('el pie de la home lleva al botón de arrepentimiento y a la política de privacidad', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Botón de arrepentimiento' })).toBeVisible();
  await footer.getByRole('link', { name: 'Política de privacidad' }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByText('LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA')).toBeVisible();
});

test('arrepentimiento da un código y abre WhatsApp con la solicitud', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { opened: string[] }).opened = [];
    window.open = (url) => {
      (window as unknown as { opened: string[] }).opened.push(String(url));
      return null;
    };
  });
  await page.goto('/arrepentimiento');
  await page.fill('#rev-name', 'Vero');
  await page.fill('#rev-products', '2 remeras');
  await page.getByRole('button', { name: /Enviar solicitud/ }).click();

  const code = (await page.locator('[data-revocation-code]').textContent()) ?? '';
  expect(code).toMatch(/^ARR-[2-9A-Z]{6}$/);

  const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
  expect(opened).toHaveLength(1);
  const text = new URL(opened[0] ?? '').searchParams.get('text') ?? '';
  expect(text).toContain(`Código de la solicitud: ${code}`);
  expect(text).toContain('Nombre: Vero');
  expect(text).toContain('Productos: 2 remeras');
});
