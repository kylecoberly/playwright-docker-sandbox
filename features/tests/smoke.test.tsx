import { expect, test } from "@playwright/test";

test("smoke", async ({ page }) => {
  page.goto("/");

  const heading = page.getByText("Some Wrapper");

  await expect(heading).not.toBeEmpty();
});

test("get iframe", async ({ page }) => {
  page.goto("/");

  const iframe = page.frameLocator("iframe");
  const heading = iframe.getByText("Some App");

  await expect(heading).not.toBeEmpty();
});
