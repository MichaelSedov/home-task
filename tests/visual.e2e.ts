import { test, expect } from '@playwright/test';

test.describe('Visual regression', () => {
	test('combobox open state snapshot', async ({ page }) => {
		await page.goto('/en/search');

		// Open the tag combobox
		const combobox = page.getByRole('combobox', { name: /tag|filter/i }).first();
		await combobox.click();

		// Wait for dropdown to appear
		await expect(page.getByRole('listbox')).toBeVisible();

		// Snapshot just the combobox container
		const container = page.locator('[data-combobox]').first();
		await expect(container).toHaveScreenshot('combobox-open.png', { maxDiffPixels: 50 });
	});

	test('blog post page snapshot', async ({ page }) => {
		await page.goto('/en/blog/sub-second-lcp-on-a-content-site');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page).toHaveScreenshot('blog-post.png', {
			maxDiffPixels: 200,
			clip: { x: 0, y: 0, width: 1280, height: 800 }
		});
	});
});
