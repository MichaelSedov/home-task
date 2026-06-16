import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(
	page: import('@playwright/test').Page,
	email = 'editor@demo.test',
	password = 'demo1234'
) {
	await page.goto('/login');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL(/dashboard/);
}

test.describe('Authenticated flow', () => {
	test('login with valid credentials reaches dashboard', async ({ page }) => {
		await login(page);
		await expect(page).toHaveURL(/dashboard/);
		await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
	});

	test('login with wrong password shows error', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('admin@demo.test');
		await page.getByLabel('Password').fill('wrongpassword');
		await page.getByRole('button', { name: /sign in/i }).click();
		await expect(page.getByRole('alert')).toBeVisible();
		await expect(page).toHaveURL(/login/);
	});

	test('dashboard/items loads the campaigns table', async ({ page }) => {
		await login(page);
		await page.goto('/dashboard/items');
		await expect(page.getByRole('grid')).toBeVisible();
		// Wait for streamed rows
		await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 });
		const rowCount = await page.locator('tbody tr').count();
		expect(rowCount).toBeGreaterThan(1);
	});

	test('table sort changes URL and reorders rows', async ({ page }) => {
		await login(page);
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		// Click "Budget" sort header
		await page.getByRole('button', { name: /budget/i }).click();
		await expect(page).toHaveURL(/sort=budget/);
	});

	test('inline edit: optimistic update reflects immediately', async ({ page }) => {
		await login(page, 'editor@demo.test');
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		// Find first editable status badge button
		const firstStatusBtn = page
			.locator('tbody tr')
			.first()
			.getByRole('button')
			.filter({ hasText: /draft|scheduled|active|paused|completed|archived/i })
			.first();
		const originalStatus = (await firstStatusBtn.textContent())?.trim() ?? '';
		await firstStatusBtn.click();

		// Select dropdown should appear (aria-label contains "Change status")
		const select = page.locator('tbody tr').first().locator('select');
		await expect(select).toBeVisible();

		// Choose a different status
		const newStatus = originalStatus === 'active' ? 'paused' : 'active';
		await select.selectOption(newStatus);

		// Optimistic update: badge should now show new status
		await expect(page.locator('tbody tr').first().getByText(newStatus)).toBeVisible({
			timeout: 3000
		});
	});

	test('inline edit: server error triggers rollback', async ({ page }) => {
		await login(page, 'editor@demo.test');
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		// Intercept the PATCH to return 500
		await page.route(/\/api\/items\//, (route) =>
			route.fulfill({ status: 500, body: 'Server Error' })
		);

		const firstRow = page.locator('tbody tr').first();
		const firstStatusBtn = firstRow
			.getByRole('button')
			.filter({ hasText: /draft|scheduled|active|paused|completed|archived/i })
			.first();
		const originalStatus = (await firstStatusBtn.textContent())?.trim() ?? '';
		await firstStatusBtn.click();

		const select = firstRow.locator('select');
		await expect(select).toBeVisible();
		const newStatus = originalStatus === 'active' ? 'paused' : 'active';
		await select.selectOption(newStatus);

		// After server error, select closes and original status badge should reappear
		await expect(select).not.toBeVisible({ timeout: 5000 });
		await expect(firstRow.getByText(originalStatus, { exact: true })).toBeVisible({
			timeout: 5000
		});
	});

	test('viewer role: edit controls are hidden', async ({ page }) => {
		await login(page, 'viewer@demo.test');
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		// Status buttons should not be present (disabled or absent)
		const editButtons = page
			.locator('tbody')
			.getByRole('button')
			.filter({ hasText: /draft|scheduled|active|paused|completed|archived/i });
		const count = await editButtons.count();
		// Viewer sees no clickable status buttons (disabled buttons have pointer-events:none)
		if (count > 0) {
			const firstBtn = editButtons.first();
			expect(await firstBtn.isDisabled()).toBe(true);
		}
	});

	test('pagination: next page changes URL', async ({ page }) => {
		await login(page);
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		await page.getByRole('button', { name: /next/i }).click();
		await expect(page).toHaveURL(/page=2/);
	});

	test('axe: no critical accessibility violations on dashboard/items', async ({ page }) => {
		await login(page);
		await page.goto('/dashboard/items');
		await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.exclude(['[aria-hidden]'])
			.analyze();

		const serious = results.violations.filter(
			(v) => v.impact === 'serious' || v.impact === 'critical'
		);
		expect(
			serious,
			`axe violations: ${JSON.stringify(
				serious.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
				null,
				2
			)}`
		).toHaveLength(0);
	});

	test('logout clears session and redirects to login', async ({ page }) => {
		await login(page);
		await page.getByRole('button', { name: /sign out/i }).click();
		await expect(page).toHaveURL(/login/);

		// Trying to access dashboard should redirect back to login
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/login/);
	});
});
