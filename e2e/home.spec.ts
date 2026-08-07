import { expect, test } from "@playwright/test";

test("landing page shows login CTA for signed-out users", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: "Your DJ mix portfolio" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Log in with Spotify" }),
	).toBeVisible();
});
