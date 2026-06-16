import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command:
			'SESSION_SECRET=e2e-test-secret-minimum-32-chars pnpm build && SESSION_SECRET=e2e-test-secret-minimum-32-chars pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: './tests',
	testMatch: '**/*.e2e.ts',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
