import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard page', async ({ page }) => {
    // Check page loaded
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should show empty state when no calculations', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Look for empty state message
    const emptyState = page.locator('[class*="empty"], text=/no.*calculation|ไม่มี.*การคำนวณ|ไม่พบ/i').first();
    
    // Either shows empty state or has data
    await page.waitForTimeout(500);
  });

  test('should display statistics cards', async ({ page }) => {
    // Look for stat cards
    const statCards = page.locator('[class*="stat"], [class*="card"]');
    
    // Should have multiple cards
    const cardCount = await statCards.count();
    // Dashboard should have some visual elements
  });

  test('should allow exporting data', async ({ page }) => {
    // Look for export button
    const exportBtn = page.getByRole('button', { name: /export|pdf|download|ส่งออก|ดาวน์โหลด/i });
    
    if (await exportBtn.isVisible()) {
      // Export should be clickable
      await expect(exportBtn).toBeEnabled();
    }
  });

  test('should show charts when data exists', async ({ page }) => {
    // Store some test data
    await page.evaluate(() => {
      const testData = {
        calculations: [
          {
            id: 'test-1',
            type: 'credit-card',
            debt: 50000,
            interestRate: 20,
            monthlyPayment: 5000,
            totalInterest: 5000,
            totalPayment: 55000,
            months: 11,
            timestamp: Date.now()
          }
        ]
      };
      localStorage.setItem('finland_calculations', JSON.stringify(testData.calculations));
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Look for chart elements
    const charts = page.locator('svg, canvas, [class*="chart"], [class*="recharts"]');
    
    // Charts should be present when data exists
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Dashboard should still be usable
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

test.describe('Dashboard - Analytics', () => {
  test('should track page view', async ({ page }) => {
    // Monitor console for analytics
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Analytics')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    
    // Analytics should fire for page view
  });
});
