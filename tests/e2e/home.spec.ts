import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/XyphyX/);
    await expect(page.getByRole("heading", { name: /XyphyX App Template/i })).toBeVisible();
  });

  test("has a sign in button when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("navigates to sign-up page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("Authentication", () => {
  test("sign-in page renders", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-up page renders", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("redirects unauthenticated users from /dashboard to /sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
