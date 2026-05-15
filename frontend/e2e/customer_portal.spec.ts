import { test, expect } from '@playwright/test';

test.describe('Customer Portal Flow', () => {
  test('should display customer measurements and portal info', async ({ page }) => {
    // 1. Login first to get access to customer list (to find a valid ID)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'james@tuxedopos.com');
    await page.fill('input[name="password"]', 'pass');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Go to Customers page
    await page.goto('/customers');
    await expect(page.locator('.card[data-id]').first()).toBeVisible();
    
    // 3. Get ID of first customer
    const customerId = await page.getAttribute('.card[data-id]', 'data-id');
    expect(customerId).toBeTruthy();

    // 4. Navigate to public portal for this ID
    await page.goto(`/customer-portal/${customerId}`);

    // 5. Verify premium rendering
    await expect(page.locator('h1')).toContainText('Hello');
    await expect(page.locator('text=Your Personal Measurement Profile')).toBeVisible();
    await expect(page.locator('text=Tuxedo Rewards')).toBeVisible();
  });
});
