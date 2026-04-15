// GitHub issue: #34 — E2E: Landing page pathway buttons and navigation
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("SUBMIT_REQUEST nav link routes to /submit-request", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "SUBMIT_REQUEST" }).first().click();
    await expect(page).toHaveURL("/submit-request");
  });

  test("CREATE_TICKET nav link routes to /create-ticket", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "CREATE_TICKET" }).first().click();
    await expect(page).toHaveURL("/create-ticket");
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

  test("logo routes back to home", async ({ page }) => {
    await page.goto("/submit-request");
    await page.getByRole("link", { name: "DATA_WORKSHOP" }).click();
    await expect(page).toHaveURL("/");
  });

  test("all three nav items are visible to unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "SUBMIT_REQUEST" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "CREATE_TICKET" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "MISSION_CONTROL" })).toBeVisible();
  });
});
