// tests/gallery.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Dunja Gallery Functional Tests', () => {

  // Admin login succeed
  test('should login successfully as admin', async ({ page }) => {
    // direct to login page
    await page.goto('http://localhost:6789/login');
    
    // enter username/password
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    
    // click login
    await page.click('button[type="submit"]');

    // check the message
    await expect(page).toHaveURL('http://localhost:6789/');
    await expect(page.locator('body')).toContainText('Welcom to my Gallery, admin');
  });

  // add new artwork
  test('should add a new artwork', async ({ page }) => {
    // login
    await page.goto('http://localhost:6789/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // fill up add artwork form
    await page.fill('input[name="title"]', 'Playwright Test Art');
    await page.fill('input[name="image_url"]', 'http://example.com/test.png');
    await page.fill('input[name="description"]', 'This is an automated test.');
    
    // click add button
    await page.click('form[action="/add"] button');

    // check the list
    await expect(page.locator('.artwork h3').last()).toHaveText('Playwright Test Art');
  });
});