import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
    test('reindirizza al login se non autenticato', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByRole('heading', { name: 'Bentornato' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible();
    });

    test('pagina login mostra form email e password', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByPlaceholder('mario.rossi@example.com')).toBeVisible();
        await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    });
});
