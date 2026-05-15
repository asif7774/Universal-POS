import { test, expect } from '@playwright/test';

test.describe('POS Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each POS test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@tuxedopos.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should complete a basic cash sale', async ({ page }) => {
    await page.goto('/pos');

    // Wait for products to load
    await expect(page.locator('.product-card').first()).toBeVisible();

    // Add first product to cart
    await page.locator('.product-card').first().click();
    
    // Check if cart is visible and has items
    await expect(page.locator('.cart-sidebar')).toBeVisible();
    await expect(page.locator('.cart-item')).toHaveCount(1);

    // Click checkout
    await page.click('button:has-text("Checkout")');

    // Checkout modal should appear
    await expect(page.locator('.modal-title')).toContainText('Checkout');

    // Select Cash payment
    await page.click('button:has-text("Cash")');
    await page.fill('input[placeholder="0.00"]', '500'); // Assuming total is less than 500

    // Complete order
    await page.click('button:has-text("Complete Order")');

    // Order complete modal should show
    await expect(page.locator('.modal-title')).toContainText('Success');
    await expect(page.locator('.order-id-badge')).toBeVisible();

    // Click New Order to reset
    await page.click('button:has-text("New Order")');
    await expect(page.locator('.cart-item')).toHaveCount(0);
  });
});
