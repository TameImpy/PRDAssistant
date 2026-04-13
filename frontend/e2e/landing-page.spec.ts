// GitHub issue: #10 — E2E: Landing page loads with correct content and pathway buttons
import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("displays hero section with correct branding", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/DATA_WORKSHOP/);
    await expect(
      page.getByText("REQUEST. STRUCTURE.", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("SHIP.")).toBeVisible();
  });

  test("shows two pathway buttons with clear descriptions", async ({
    page,
  }) => {
    await page.goto("/");

    // SUBMIT_REQUEST button (scoped to main content, not nav/footer)
    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: /SUBMIT_REQUEST/i })
    ).toBeVisible();
    await expect(
      main.getByText("For Sales, Editorial, Product", { exact: false })
    ).toBeVisible();

    // CREATE_TICKET button (use specific text to avoid matching the card link)
    await expect(
      main.getByRole("link", { name: "CREATE_TICKET For the" })
    ).toBeVisible();
    await expect(
      main.getByText("For the Commercial Analysts team only", { exact: false })
    ).toBeVisible();
  });

  test("shows helper text about which path to choose", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText("NOT SURE WHICH TO PICK", { exact: false })
    ).toBeVisible();
  });

  test("shows HOW_IT_WORKS section with 3 steps", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("HOW_IT_WORKS")).toBeVisible();
    await expect(page.getByText("DESCRIBE_YOUR_REQUEST")).toBeVisible();
    await expect(page.getByText("REVIEW_AND_CONFIRM")).toBeVisible();
    await expect(page.getByText("DELIVERED_TO_BACKLOG")).toBeVisible();
  });

  test("shows footer with DATA_WORKSHOP branding", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText("DATA_WORKSHOP // IMMEDIATE MEDIA")
    ).toBeVisible();
  });
});
