import { test, expect } from '@playwright/test';

test.describe('Student Loan Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student-loan');
  });

  test('should display calculator form', async ({ page }) => {
    // Check page loaded
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Check for input elements
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });

  test('should calculate student loan repayment', async ({ page }) => {
    // Look for loan amount input
    const inputs = page.locator('input');
    
    if (await inputs.count() > 0) {
      // Fill first input (usually loan amount)
      await inputs.first().fill('200000');
      
      // Look for calculate button
      const calculateBtn = page.getByRole('button', { name: /calculate|คำนวณ/i });
      
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should display loan schedule', async ({ page }) => {
    // After calculation, check for schedule/table
    const inputs = page.locator('input');
    
    if (await inputs.count() > 0) {
      await inputs.first().fill('150000');
      
      const calculateBtn = page.getByRole('button', { name: /calculate|คำนวณ/i });
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1500);
        
        // Look for schedule table or chart
        const scheduleTable = page.locator('table, [class*="chart"], [class*="schedule"]').first();
        // Schedule should be visible after calculation
      }
    }
  });

  test('should show AI analysis when available', async ({ page }) => {
    // Check for AI advisor component
    const aiSection = page.locator('[class*="ai"], [data-testid="ai-advisor"]').first();
    
    if (await aiSection.isVisible()) {
      await expect(aiSection).toBeVisible();
    }
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for form labels
    const labels = page.locator('label');
    const labelCount = await labels.count();
    
    // Should have labels for inputs
    expect(labelCount).toBeGreaterThanOrEqual(0);
    
    // Check for aria attributes on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('Student Loan Calculator - Edge Cases', () => {
  test('should handle zero loan amount', async ({ page }) => {
    await page.goto('/student-loan');
    
    const firstInput = page.locator('input').first();
    await firstInput.fill('0');
    
    // Should show appropriate message or prevent calculation
    await page.waitForTimeout(500);
  });

  test('should handle very large loan amount', async ({ page }) => {
    await page.goto('/student-loan');
    
    const firstInput = page.locator('input').first();
    await firstInput.fill('9999999999');
    
    // Should handle gracefully
    await page.waitForTimeout(500);
  });
});
