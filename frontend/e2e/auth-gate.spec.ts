// GitHub issue: #12 — E2E: Auth gate shows login prompt on protected pages
import { test, expect } from "@playwright/test";

test.describe("Auth gate", () => {
  test("shows ACCESS_REQUIRED on /submit-request when not logged in", async ({
    page,
  }) => {
    await page.goto("/submit-request");

    await expect(page.getByText("ACCESS_REQUIRED")).toBeVisible();
    await expect(page.getByText("LOGIN_WITH_GOOGLE")).toBeVisible();
    await expect(
      page.getByText("RESTRICTED TO @IMMEDIATEMEDIA.COM", { exact: false })
    ).toBeVisible();
  });

  test("shows ACCESS_REQUIRED on /create-ticket when not logged in", async ({
    page,
  }) => {
    await page.goto("/create-ticket");

    await expect(page.getByText("ACCESS_REQUIRED")).toBeVisible();
    await expect(page.getByText("LOGIN_WITH_GOOGLE")).toBeVisible();
  });
});
