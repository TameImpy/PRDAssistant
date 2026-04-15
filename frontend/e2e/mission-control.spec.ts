// GitHub issue: #32 — E2E: Mission Control Sprint Overview loads with sub-navigation
import { test, expect } from "@playwright/test";

test.describe("Mission Control (unauthenticated)", () => {
  test("requires authentication to access", async ({ page }) => {
    await page.goto("/mission-control");

    await expect(page.getByText("ACCESS_REQUIRED")).toBeVisible();
    await expect(page.getByText("LOGIN_WITH_GOOGLE")).toBeVisible();
  });
});

test.describe("Mission Control navigation", () => {
  test("MISSION_CONTROL link is visible in navbar for all users", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: "MISSION_CONTROL" })
    ).toBeVisible();
  });

  test("MISSION_CONTROL nav link routes to /mission-control", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "MISSION_CONTROL" })
      .click();
    await expect(page).toHaveURL("/mission-control");
  });
});
