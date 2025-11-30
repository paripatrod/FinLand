import { test, expect } from '@playwright/test';

test.describe('FinLand Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FinLand/);
    
    // Check main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to Credit Card Calculator', async ({ page }) => {
    // Click on credit card calculator link/button
    await page.getByRole('link', { name: /credit.*card|บัตรเครดิต/i }).first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/credit-card/);
  });

  test('should navigate to Student Loan Calculator', async ({ page }) => {
    // Click on student loan link/button  
    await page.getByRole('link', { name: /student.*loan|กยศ/i }).first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/student-loan/);
  });

  test('should navigate to Dashboard', async ({ page }) => {
    // Click on dashboard link
    await page.getByRole('link', { name: /dashboard|แดชบอร์ด/i }).first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Find and click theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark|light|โหมด/i });
    
    if (await themeToggle.isVisible()) {
      // Get initial theme state
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      
      // Click toggle
      await themeToggle.click();
      
      // Verify theme changed
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });
});

test.describe('Language Switcher', () => {
  test('should switch language', async ({ page }) => {
    await page.goto('/');
    
    // Look for language switcher
    const langSwitcher = page.getByRole('combobox').filter({ hasText: /TH|EN|ไทย|English/i });
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // Select different language
      const englishOption = page.getByRole('option', { name: /English|EN/i });
      if (await englishOption.isVisible()) {
        await englishOption.click();
      }
    }
  });
});
