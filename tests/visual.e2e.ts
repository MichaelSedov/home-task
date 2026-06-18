import { test, expect } from '@playwright/test';

test.describe('Visual regression', () => {
	// Visual snapshots are platform-specific (font-rendering, anti-aliasing).
	// The committed baselines were captured on darwin; running them in Linux CI
	// would always diff. They guard against local design regressions during
	// development. The proper fix is generating per-OS baselines via Docker —
	// deliberately out of scope for this submission.
	test.skip(!!process.env.CI, 'Visual snapshots are local-only (darwin baselines).');

	test('combobox open state snapshot', async ({ page }) => {
		await page.goto('/en/search');

		const combobox = page.getByRole('combobox', { name: /tag|filter/i }).first();
		await combobox.click();

		await expect(page.getByRole('listbox')).toBeVisible();

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
