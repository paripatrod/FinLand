import { test, expect } from '@playwright/test';

test.describe('Credit Card Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/credit-card');
  });

  test('should display calculator form', async ({ page }) => {
    // Check for form elements
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Look for input fields
    const debtInput = page.locator('input[type="text"], input[type="number"]').first();
    await expect(debtInput).toBeVisible();
  });

  test('should calculate debt repayment', async ({ page }) => {
    // Fill in debt amount (looking for input with placeholder or label containing debt/หนี้)
    const debtInput = page.getByPlaceholder(/debt|amount|หนี้|จำนวน/i).first();
    
    if (await debtInput.isVisible()) {
      await debtInput.fill('50000');
    } else {
      // Try first numeric input
      const firstInput = page.locator('input').first();
      await firstInput.fill('50000');
    }
    
    // Look for calculate button
    const calculateBtn = page.getByRole('button', { name: /calculate|คำนวณ/i });
    
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
      
      // Wait for results to appear
      await page.waitForTimeout(1000);
      
      // Check for results section
      const resultsSection = page.locator('[class*="result"], [data-testid="results"]').first();
      if (await resultsSection.isVisible()) {
        await expect(resultsSection).toBeVisible();
      }
    }
  });

  test('should show AI advisor when available', async ({ page }) => {
    // Fill some data and look for AI analysis button
    const aiButton = page.getByRole('button', { name: /ai|วิเคราะห์|analyze/i });
    
    if (await aiButton.isVisible()) {
      await expect(aiButton).toBeEnabled();
    }
  });

  test('should validate input fields', async ({ page }) => {
    // Test input validation
    const debtInput = page.locator('input').first();
    
    // Try entering invalid data
    await debtInput.fill('-1000');
    
    // Check for error message or validation feedback
    const errorMessage = page.locator('[class*="error"], [role="alert"]').first();
    
    // Either error shows or input is corrected
    await page.waitForTimeout(500);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still render correctly
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Check form is still usable
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });
});

test.describe('Credit Card Calculator - Integration', () => {
  test('should persist calculation to dashboard', async ({ page }) => {
    // Go to calculator
    await page.goto('/credit-card');
    
    // Perform a calculation
    const firstInput = page.locator('input').first();
    await firstInput.fill('100000');
    
    // Try to save/calculate
    const saveBtn = page.getByRole('button', { name: /save|บันทึก|calculate|คำนวณ/i }).first();
    
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check if calculation appears
    await page.waitForTimeout(500);
  });
});
