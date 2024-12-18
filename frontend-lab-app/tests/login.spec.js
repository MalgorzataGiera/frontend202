const { test, expect } = require('@playwright/test');

test.describe('Logowanie i dostęp do profilu użytkownika', () => {

  // Test logowania i przejścia do profilu użytkownika
  test('powinno przekierować zalogowanego użytkownika do profilu', async ({ page }) => {
    // Przejdź do strony logowania
    await page.goto('http://localhost:3000/signin');

    // Wypełnij formularz logowania
    await page.fill('input#email', 'gosgie02@wp.pl'); // Zmień na istniejące dane logowania
    await page.fill('input#password', 'qwerty!!');   // Zmień na poprawne hasło
    await page.click('button[type="submit"]');

    // Oczekuj przekierowania do strony profilu użytkownika
    await expect(page).toHaveURL('http://localhost:3000/protected/user/profile');

    // Weryfikuj, czy strona zawiera element potwierdzający obecność użytkownika (np. nazwę użytkownika)
    await expect(page.locator('h2')).toContainText('Profil użytkownika');
  });

  // Test niezalogowanego użytkownika
  test('powinno przekierować niezalogowanego użytkownika do strony logowania', async ({ page }) => {
    // Przejdź bezpośrednio do strony profilu
    await page.goto('http://localhost:3000/protected/user/profile');

    // Oczekuj przekierowania do strony logowania
    await expect(page).toHaveURL('http://localhost:3000/signin');

    // Weryfikuj, czy strona zawiera nagłówek logowania
    await expect(page.locator('h2')).toContainText('Logowanie');
  });

});
