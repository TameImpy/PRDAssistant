// GitHub issue: #11 — E2E: Navigation tabs route to correct pages
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
    await page.goto("/mission-control");
    await page.getByRole("link", { name: "DATA_WORKSHOP" }).click();
    await expect(page).toHaveURL("/");
  });
});
