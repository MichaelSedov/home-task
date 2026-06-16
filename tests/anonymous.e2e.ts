import { test, expect } from '@playwright/test';

test.describe('Anonymous flow', () => {
	test('home page loads and has correct heading', async ({ page }) => {
		await page.goto('/en');
		await expect(page).toHaveTitle(/Demo Co/);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('skip link is focusable', async ({ page }) => {
		await page.goto('/en');
		await page.keyboard.press('Tab');
		const skipLink = page.getByRole('link', { name: /skip to content/i });
		await expect(skipLink).toBeFocused();
	});

	test('navigate to blog and open a post', async ({ page }) => {
		await page.goto('/en');

		// Navigate to blog via nav
		await page.getByRole('link', { name: /blog/i }).first().click();
		await expect(page).toHaveURL(/\/en\/blog/);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/writing/i);

		// Click first post
		const firstPost = page.getByRole('listitem').first().getByRole('link');
		await firstPost.click();
		await expect(page).toHaveURL(/\/en\/blog\/.+/);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('search by text returns results', async ({ page }) => {
		// SSR search — go directly with query param to bypass debounce
		await page.goto('/en/search?q=lcp');
		await expect(page.locator('article').first()).toBeVisible({ timeout: 5000 });
		const count = await page.locator('article').count();
		expect(count).toBeGreaterThan(0);
	});

	test('search: clicking a result opens the post', async ({ page }) => {
		await page.goto('/en/search?q=lcp');
		const firstResult = page.locator('article').first().getByRole('link');
		await expect(firstResult).toBeVisible();
		await firstResult.click();
		await expect(page).toHaveURL(/\/en\/blog\/.+/);
	});

	test('dashboard redirects to login when unauthenticated', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/login/);
	});

	test('blog post page has valid hreflang alternates', async ({ page }) => {
		await page.goto('/en/blog/sub-second-lcp-on-a-content-site');
		const deAlternate = page.locator('link[rel="alternate"][hreflang="de"]');
		await expect(deAlternate).toHaveCount(1);
		const href = await deAlternate.getAttribute('href');
		expect(href).toContain('/de/blog/');
	});

	test('404 page renders for unknown route', async ({ page }) => {
		const response = await page.goto('/this-page-does-not-exist');
		expect(response?.status()).toBe(404);
		await expect(page.getByRole('heading')).toBeVisible();
	});
});
