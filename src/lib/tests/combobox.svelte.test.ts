import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Combobox from '$lib/ui/composite/Combobox.svelte';

const OPTIONS = [
	{ value: 'engineering', label: 'Engineering' },
	{ value: 'design', label: 'Design' },
	{ value: 'product', label: 'Product' },
	{ value: 'performance', label: 'Performance' }
];

describe('Combobox', () => {
	it('renders the input with placeholder when nothing is selected', () => {
		render(Combobox, { options: OPTIONS, selected: [], placeholder: 'Pick one…' });
		const input = screen.getByRole('combobox');
		expect(input).toHaveAttribute('placeholder', 'Pick one…');
		expect(input).toHaveAttribute('aria-expanded', 'false');
	});

	it('opens the listbox on focus and exposes options with role=option', async () => {
		render(Combobox, { options: OPTIONS, selected: [] });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);

		expect(input).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
	});

	it('selects an option via Enter and reports it via onchange', async () => {
		const onchange = vi.fn();
		render(Combobox, { options: OPTIONS, selected: [], onchange });

		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(onchange).toHaveBeenCalledWith(['engineering']);
	});

	it('filters options by typed query', async () => {
		const user = userEvent.setup();
		render(Combobox, { options: OPTIONS, selected: [] });

		const input = screen.getByRole('combobox');
		await user.click(input);
		await user.type(input, 'des');

		const visible = screen.getAllByRole('option').map((el) => el.textContent?.trim());
		expect(visible).toContain('Design');
		expect(visible).not.toContain('Engineering');
	});

	it('keyboard navigation: ArrowDown then ArrowUp moves the active index back', async () => {
		render(Combobox, { options: OPTIONS, selected: [] });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);

		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'ArrowUp' });

		// The 1st option should now be aria-selected="false" but aria-activedescendant points at it
		const activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(activeId).toContain('engineering');
	});

	it('Escape does not commit a selection', async () => {
		const onchange = vi.fn();
		render(Combobox, { options: OPTIONS, selected: [], onchange });

		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(onchange).not.toHaveBeenCalled();
	});

	it('toggles selection: clicking a selected option removes it', async () => {
		const onchange = vi.fn();
		render(Combobox, { options: OPTIONS, selected: ['design'], onchange });

		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);

		const designOption = screen.getByRole('option', { name: /design/i });
		expect(designOption).toHaveAttribute('aria-selected', 'true');

		await fireEvent.click(designOption);
		expect(onchange).toHaveBeenCalledWith([]);
	});

	it('shows "No options" when filter matches nothing', async () => {
		const user = userEvent.setup();
		render(Combobox, { options: OPTIONS, selected: [] });

		const input = screen.getByRole('combobox');
		await user.click(input);
		await user.type(input, 'zzzzzz');

		expect(screen.getByText(/no options/i)).toBeInTheDocument();
	});
});
