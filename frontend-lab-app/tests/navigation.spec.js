const { test, expect } = require('@playwright/test');

test('has link to login page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  // Kliknij w link do logowania
  await page.click('text=Logowanie'); // Dopasuj tekst linku
  // Sprawdź czy URL zmienił się na stronę logowania
  await expect(page).toHaveURL('http://localhost:3000/signin'); // Dopasuj URL
  // Sprawdź nagłówek na stronie logowania
  await expect(page.locator('h2')).toContainText('Logowanie'); // Dopasuj nagłówek
});
