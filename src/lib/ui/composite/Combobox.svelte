<script lang="ts">
	import { tick } from 'svelte';

	export interface ComboboxOption {
		value: string;
		label: string;
	}

	interface Props {
		options: ComboboxOption[];
		selected: string[];
		placeholder?: string;
		label?: string;
		id?: string;
		onchange?: (values: string[]) => void;
	}

	let {
		options,
		selected = $bindable([]),
		placeholder = 'Select…',
		label,
		id: rootId,
		onchange
	}: Props = $props();

	// rootId is a one-shot prop; this id stays stable for the component's lifetime
	const comboId = $derived(rootId ?? `combo-${Math.random().toString(36).slice(2, 8)}`);
	const listId = $derived(`${comboId}-list`);

	let open = $state(false);
	let query = $state('');
	let activeIdx = $state(-1);
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);

	const filtered = $derived(
		query.trim()
			? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
			: options
	);

	const activeId = $derived(
		activeIdx >= 0 && filtered[activeIdx]
			? `${comboId}-opt-${filtered[activeIdx].value}`
			: undefined
	);

	function toggle(value: string) {
		const next = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
		selected = next;
		onchange?.(next);
	}

	function openList() {
		open = true;
		activeIdx = -1;
	}

	async function closeList() {
		open = false;
		query = '';
		activeIdx = -1;
		await tick();
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!open) openList();
				activeIdx = Math.min(activeIdx + 1, filtered.length - 1);
				scrollActive();
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIdx = Math.max(activeIdx - 1, -1);
				scrollActive();
				break;
			case 'Home':
				e.preventDefault();
				activeIdx = filtered.length > 0 ? 0 : -1;
				break;
			case 'End':
				e.preventDefault();
				activeIdx = filtered.length - 1;
				break;
			case 'Enter':
				e.preventDefault();
				if (open && activeIdx >= 0 && filtered[activeIdx]) {
					toggle(filtered[activeIdx].value);
				} else if (!open) {
					openList();
				}
				break;
			case 'Escape':
				e.preventDefault();
				closeList();
				inputEl?.focus();
				break;
			case 'Tab':
				closeList();
				break;
		}
	}

	async function scrollActive() {
		await tick();
		const el = listEl?.querySelector(`[aria-selected="true"]`) as HTMLElement | null;
		el?.scrollIntoView({ block: 'nearest' });
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as Node;
		if (!inputEl?.closest('[data-combobox]')?.contains(target)) {
			closeList();
		}
	}

	const displayValue = $derived(
		selected.length === 0
			? ''
			: selected.length === 1
				? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
				: `${selected.length} selected`
	);
</script>

<svelte:window onclick={handleClickOutside} />

<div data-combobox class="relative flex flex-col gap-1.5">
	{#if label}
		<label for={comboId} class="text-sm font-medium text-[var(--fg-2)]">{label}</label>
	{/if}

	<div class="relative">
		<input
			bind:this={inputEl}
			{...{ id: comboId }}
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-controls={listId}
			aria-activedescendant={activeId}
			aria-autocomplete="list"
			autocomplete="off"
			value={open ? query : displayValue}
			placeholder={selected.length === 0 ? placeholder : undefined}
			onfocus={openList}
			oninput={(e) => {
				query = (e.currentTarget as HTMLInputElement).value;
				if (!open) openList();
			}}
			onkeydown={handleKeydown}
			class="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 pr-8 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
		/>
		<span
			class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs"
			>{open ? '▲' : '▼'}</span
		>
	</div>

	<!--
		Selected values are conveyed by the input (single value or "N selected") and
		by check-marks inside the open listbox. Inline chips below the input were
		causing layout shift in filter rows; removing them keeps the field a fixed
		height while preserving full multi-select control via the dropdown.
	-->
	<!-- Live region announces selection changes to screen readers -->
	<span class="sr-only" aria-live="polite">
		{#if selected.length > 0}
			{selected.length}
			{selected.length === 1 ? 'option' : 'options'} selected
		{/if}
	</span>

	{#if open}
		<ul
			bind:this={listEl}
			id={listId}
			role="listbox"
			aria-multiselectable="true"
			aria-label={label ?? placeholder}
			class="absolute top-full z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-lg)]"
		>
			{#if filtered.length === 0}
				<li role="option" aria-selected="false" class="px-3 py-2 text-sm text-[var(--muted)]">
					No options
				</li>
			{:else}
				{#each filtered as opt, i (opt.value)}
					{@const isSelected = selected.includes(opt.value)}
					{@const isActive = i === activeIdx}
					<!--
						Keyboard handling for these options lives on the combobox input
						(ArrowUp/Down/Home/End/Enter/Esc) via aria-activedescendant — this
						is the ARIA combobox pattern. The <li> takes mouse clicks only.
					-->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						id="{comboId}-opt-{opt.value}"
						role="option"
						aria-selected={isSelected}
						onmouseenter={() => (activeIdx = i)}
						onclick={() => toggle(opt.value)}
						class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm {isActive
							? 'bg-[var(--accent-soft)] text-[var(--accent-ink)]'
							: 'text-[var(--fg)] hover:bg-[var(--bg-soft)]'}"
					>
						<span
							class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {isSelected
								? 'border-[var(--accent)] bg-[var(--accent)] text-white'
								: 'border-[var(--border)]'}"
							aria-hidden="true"
						>
							{#if isSelected}✓{/if}
						</span>
						{opt.label}
					</li>
				{/each}
			{/if}
		</ul>
	{/if}
</div>
