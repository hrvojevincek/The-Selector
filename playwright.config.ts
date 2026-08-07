import { defineConfig, devices } from "@playwright/test";

const ciEnv = {
	SPOTIFY_CLIENT_ID: "ci",
	SPOTIFY_CLIENT_SECRET: "ci",
	SPOTIFY_REDIRECT_URI: "http://127.0.0.1:4173/auth/callback",
	SESSION_SECRET: "ci-session-secret-32-characters-minimum",
};

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:4173",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command:
			"pnpm build && pnpm preview --port 4173 --strictPort --host 127.0.0.1",
		url: "http://127.0.0.1:4173",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: ciEnv,
	},
});
