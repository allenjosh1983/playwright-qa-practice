const { test, expect } = require('@playwright/test');

test('successful login with valid credentials', async ({ page }) => {
  // Go to the login page
  await page.goto('https://www.saucedemo.com');

  // Fill in the username field
  await page.locator('#user-name').fill('standard_user');

  // Fill in the password field
  await page.locator('#password').fill('secret_sauce');

  // Click the login button
  await page.locator('#login-button').click();

  // Assert that login succeeded by checking we landed on the products page
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('login fails with incorrect password', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('wrong_password');
  await page.locator('#login-button').click();

  // Explicit timeout: wait up to 5 seconds for the error to appear,
  // rather than relying only on Playwright's default timeout
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  await expect(errorMessage).toContainText('Username and password do not match');

  // Assert we did NOT navigate to the products page
  await expect(page).not.toHaveURL(/inventory.html/);
});

test('login page loads even under a slow network', async ({ page }) => {
  // Simulate a slow/unreliable connection
  await page.route('**/*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100)); // small artificial delay
    await route.continue();
  });

  await page.goto('https://www.saucedemo.com');

  // Even with delay, the login form should eventually appear —
  // this proves the test doesn't fail just because the network was briefly slow
  await expect(page.locator('#login-button')).toBeVisible({ timeout: 10000 });
});