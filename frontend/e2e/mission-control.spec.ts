// GitHub issue: #13 — E2E: Mission Control shows coming soon placeholder
import { test, expect } from "@playwright/test";

test.describe("Mission Control", () => {
  test("shows MISSION_CONTROL heading", async ({ page }) => {
    await page.goto("/mission-control");

    await expect(page.getByText("MISSION_CONTROL").first()).toBeVisible();
  });

  test("shows COMING_SOON badge", async ({ page }) => {
    await page.goto("/mission-control");

    await expect(page.getByText("COMING_SOON")).toBeVisible();
  });

  test("describes the planned feature", async ({ page }) => {
    await page.goto("/mission-control");

    await expect(
      page.getByText("live dashboard", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("Monday.com", { exact: false })
    ).toBeVisible();
  });

  test("shows placeholder panels", async ({ page }) => {
    await page.goto("/mission-control");

    await expect(page.getByText("RECENTLY_SHIPPED")).toBeVisible();
    await expect(page.getByText("IN_PROGRESS")).toBeVisible();
    await expect(page.getByText("UPCOMING")).toBeVisible();
  });
});
