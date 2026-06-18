<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatMoney, formatPercent, formatDate } from '$lib/i18n/t.js';
	import { goto, invalidate } from '$app/navigation';
	import { toSearchParams } from '$lib/schemas/query.js';
	import type { Item, ItemStatus } from '$lib/schemas/item.js';
	import { toasts } from '$lib/ui/toast.store.js';
	import { SvelteMap } from 'svelte/reactivity';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Skeleton from '$lib/ui/primitives/Skeleton.svelte';
	import Combobox from '$lib/ui/composite/Combobox.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();

	const STATUS_OPTIONS = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'scheduled', label: 'Scheduled' },
		{ value: 'active', label: 'Active' },
		{ value: 'paused', label: 'Paused' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'archived', label: 'Archived' }
	];

	const CHANNEL_OPTIONS = [
		{ value: 'email', label: 'Email' },
		{ value: 'sms', label: 'SMS' },
		{ value: 'web', label: 'Web' },
		{ value: 'social', label: 'Social' },
		{ value: 'push', label: 'Push' }
	];

	// URL sync helpers
	const q = $derived(data.query);

	function updateUrl(patch: Partial<typeof q>) {
		const next = { ...q, ...patch, page: 'page' in patch ? patch.page : 1 };
		const params = toSearchParams({
			page: next.page === 1 ? undefined : String(next.page),
			sort: next.sort === 'updatedAt' ? undefined : next.sort,
			order: next.order === 'desc' ? undefined : next.order,
			status: next.status,
			channel: next.channel,
			q: next.q || undefined
		});
		goto(`?${params}`, { keepFocus: true, replaceState: true, noScroll: true });
	}

	function toggleSort(field: string) {
		if (q.sort === field) {
			updateUrl({ sort: field as typeof q.sort, order: q.order === 'asc' ? 'desc' : 'asc' });
		} else {
			updateUrl({ sort: field as typeof q.sort, order: 'desc' });
		}
	}

	// Optimistic inline editing
	type EditingCell = { id: string; field: 'status'; value: string };
	let editing = $state<EditingCell | null>(null);
	const optimisticRows = new SvelteMap<string, Partial<Item>>();
	const inflight = new SvelteMap<string, AbortController>();

	function startEdit(row: Item, field: 'status') {
		editing = { id: row.id, field, value: row.status };
	}

	async function commitEdit(id: string, field: 'status', value: string) {
		if (!editing || editing.value === value) {
			editing = null;
			return;
		}

		// Cancel any prior inflight for this row
		inflight.get(id)?.abort();

		const snapshot = optimisticRows.get(id) ?? {};
		const ac = new AbortController();
		inflight.set(id, ac);

		// Optimistic update
		optimisticRows.set(id, { ...snapshot, status: value as ItemStatus });
		editing = null;

		try {
			const res = await fetch(`/api/items/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [field]: value }),
				signal: ac.signal
			});

			if (!res.ok) throw new Error(`${res.status}`);
			await invalidate('items:list');
		} catch (e) {
			if ((e as Error).name === 'AbortError') return;
			// Rollback
			optimisticRows.set(id, snapshot);
			toasts.error(t('common.error'));
		} finally {
			inflight.delete(id);
		}
	}

	function getStatus(row: Item): ItemStatus {
		return (optimisticRows.get(row.id)?.status as ItemStatus) ?? row.status;
	}

	// Exact colours from the brief's .st-* classes
	const statusStyle: Record<ItemStatus, string> = {
		draft: 'bg-[#f1f5f9] text-[#475569] dark:bg-[#1f2937] dark:text-[#94a3b8]',
		scheduled: 'bg-[#fef3c7] text-[#92400e] dark:bg-[#422006] dark:text-[#fcd34d]',
		active: 'bg-[#dcfce7] text-[#166534] dark:bg-[#052e16] dark:text-[#86efac]',
		paused: 'bg-[#fee2e2] text-[#991b1b] dark:bg-[#450a0a] dark:text-[#fca5a5]',
		completed: 'bg-[#dbeafe] text-[#1e40af] dark:bg-[#0c1e3d] dark:text-[#93c5fd]',
		archived: 'bg-[#e2e8f0] text-[#334155] dark:bg-[#1e293b] dark:text-[#94a3b8]'
	};

	const canEdit = $derived(data.user?.role !== 'viewer');

	const columns = $derived([
		{ key: 'name', label: t('dashboard.items.column.name'), sortable: true },
		{ key: 'status', label: t('dashboard.items.column.status'), sortable: true },
		{ key: 'channel', label: t('dashboard.items.column.channel'), sortable: true },
		{ key: 'owner', label: t('dashboard.items.column.owner'), sortable: false },
		{ key: 'budget', label: t('dashboard.items.column.budget'), sortable: true },
		{ key: 'spent', label: t('dashboard.items.column.spent'), sortable: true },
		{ key: 'ctr', label: t('dashboard.items.column.ctr'), sortable: true },
		{ key: 'updatedAt', label: t('dashboard.items.column.updated'), sortable: true }
	]);
</script>

<svelte:head>
	<title>{t('dashboard.items.title')} — Demo Co.</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-[26px] font-bold tracking-[-0.018em] text-[var(--fg)]">
			{t('dashboard.items.title')}
		</h1>
	</div>

	<!-- Filters — wrap all in items-center so heights align -->
	<div class="mb-3.5 flex flex-wrap items-center gap-2.5">
		<input
			type="search"
			placeholder="Filter by name…"
			value={q.q}
			oninput={(e) => updateUrl({ q: (e.currentTarget as HTMLInputElement).value })}
			class="min-w-[220px] rounded-[8px] border border-[var(--border)] bg-[var(--bg-soft)] px-2.5 py-[7px] text-[13px] text-[var(--fg)] placeholder:text-[var(--muted)] outline-none transition-[border-color,box-shadow] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
			aria-label="Filter by name"
		/>
		<div class="w-44">
			<Combobox
				options={STATUS_OPTIONS}
				selected={q.status}
				placeholder="All statuses"
				onchange={(vals) => updateUrl({ status: vals as ItemStatus[] })}
			/>
		</div>
		<div class="w-40">
			<Combobox
				options={CHANNEL_OPTIONS}
				selected={q.channel}
				placeholder="All channels"
				onchange={(vals) => updateUrl({ channel: vals as typeof q.channel })}
			/>
		</div>
	</div>

	<!-- Table — matches brief's .data-table style -->
	<div
		class="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)]"
	>
		<table
			class="w-full border-collapse text-[13px]"
			role="grid"
			aria-label={t('dashboard.items.title')}
		>
			<thead>
				<tr>
					{#each columns as col (col.key)}
						<th
							scope="col"
							aria-sort={col.sortable && q.sort === col.key
								? q.order === 'asc'
									? 'ascending'
									: 'descending'
								: 'none'}
							class="sticky top-0 border-b border-[var(--border)] bg-[var(--bg-soft)] px-3 py-[9px] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)] select-none {[
								'budget',
								'spent',
								'ctr'
							].includes(col.key)
								? 'text-right'
								: ''}"
						>
							{#if col.sortable}
								<button
									onclick={() => toggleSort(col.key)}
									class="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
								>
									{col.label}
									{#if q.sort === col.key}
										<span class="text-[var(--accent)]">{q.order === 'asc' ? '↑' : '↓'}</span>
									{/if}
								</button>
							{:else}
								<span>{col.label}</span>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#await data.streamed.page}
					<!-- Skeleton rows while streaming -->
					{#each Array(q.pageSize) as _r, i (i)}
						<tr class="border-b border-[var(--border)] last:border-0">
							{#each Array(8) as _c, j (j)}
								<td class="px-3 py-[9px]">
									<Skeleton class="h-[14px] {j === 0 ? 'w-40' : 'w-16'}" />
								</td>
							{/each}
						</tr>
					{/each}
				{:then result}
					{#if result.rows.length === 0}
						<tr>
							<td colspan="8" class="px-4 py-12 text-center text-[var(--muted)]">
								{t('dashboard.items.empty')}
							</td>
						</tr>
					{:else}
						{#each result.rows as row (row.id)}
							{@const status = getStatus(row)}
							{@const isPending = inflight.has(row.id)}
							<tr
								class="border-b border-[var(--border)] last:border-0 transition-[background] {isPending
									? 'opacity-60'
									: 'hover:bg-[var(--bg-soft)]'}"
								aria-busy={isPending}
							>
								<!-- Name — font-weight 500 like .col-name in brief -->
								<td
									class="max-w-[240px] px-3 py-[9px] font-medium text-[var(--fg)]"
									style="white-space: normal; min-width: 200px"
								>
									<span class="block truncate" title={row.name}>{row.name}</span>
								</td>

								<!-- Status — status-pill with dot; select is absolute to prevent row-height jitter -->
								<td class="relative whitespace-nowrap px-3 py-[9px]">
									<!-- Always render the pill so the cell keeps its natural height -->
									<button
										onclick={() => canEdit && startEdit(row, 'status')}
										disabled={!canEdit ||
											isPending ||
											(editing?.id === row.id && editing.field === 'status')}
										class="group inline-flex items-center gap-1.5 {canEdit &&
										!(editing?.id === row.id)
											? 'cursor-pointer'
											: 'cursor-default'}"
										aria-label="{canEdit ? 'Edit' : ''} status: {status}"
									>
										<span
											class="inline-flex items-center gap-[5px] rounded-full px-2 py-[2px] text-[11px] font-semibold capitalize {statusStyle[
												status
											]}"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
											{status}
										</span>
										{#if canEdit && !(editing?.id === row.id && editing.field === 'status')}
											<span
												class="text-[11px] text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100"
												aria-hidden="true">✎</span
											>
										{/if}
									</button>

									<!-- Select overlays the pill absolutely — zero layout shift -->
									{#if canEdit && editing?.id === row.id && editing.field === 'status'}
										<select
											class="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-[6px] border border-[var(--accent)] bg-[var(--bg-elev)] px-2 py-[2px] text-[11px] font-semibold text-[var(--fg)] shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
											value={status}
											onchange={(e) =>
												commitEdit(row.id, 'status', (e.currentTarget as HTMLSelectElement).value)}
											onblur={(e) =>
												commitEdit(row.id, 'status', (e.currentTarget as HTMLSelectElement).value)}
											onkeydown={(e) => {
												if (e.key === 'Escape') editing = null;
											}}
											aria-label="Change status for {row.name}"
										>
											{#each STATUS_OPTIONS as opt (opt.value)}
												<option value={opt.value}>{opt.label}</option>
											{/each}
										</select>
									{/if}
								</td>

								<!-- Channel -->
								<td class="whitespace-nowrap px-3 py-[9px] capitalize text-[var(--fg-2)]"
									>{row.channel}</td
								>

								<!-- Owner -->
								<td class="whitespace-nowrap px-3 py-[9px] text-[var(--fg-2)]">
									<div class="flex items-center gap-2">
										<Avatar name={row.owner.name} size="sm" />
										<span>{row.owner.name}</span>
									</div>
								</td>

								<!-- Budget — JetBrains Mono for numbers, right-aligned -->
								<td
									class="whitespace-nowrap px-3 py-[9px] text-right font-mono tabular-nums text-[var(--fg-2)]"
								>
									{formatMoney(row.budget, lang)}
								</td>

								<!-- Spent -->
								<td
									class="whitespace-nowrap px-3 py-[9px] text-right font-mono tabular-nums text-[var(--fg-2)]"
								>
									{formatMoney(row.spent, lang)}
								</td>

								<!-- CTR -->
								<td
									class="whitespace-nowrap px-3 py-[9px] text-right font-mono tabular-nums text-[var(--fg-2)]"
								>
									{formatPercent(row.ctr, lang)}
								</td>

								<!-- Updated -->
								<td class="whitespace-nowrap px-3 py-[9px] text-[var(--muted)]">
									<time datetime={row.updatedAt}>{formatDate(row.updatedAt, lang)}</time>
								</td>
							</tr>
						{/each}
					{/if}

					<!-- Pagination — matches brief's .pager style -->
					{#if result.totalPages > 1}
						<tr>
							<td
								colspan="8"
								class="border-t border-[var(--border)] bg-[var(--bg-soft)] px-3.5 py-2.5"
							>
								<div class="flex items-center justify-between">
									<span class="font-mono text-[12.5px] text-[var(--muted)]">
										Showing {(result.page - 1) * result.pageSize + 1}–{Math.min(
											result.page * result.pageSize,
											result.total
										)} of {result.total}
									</span>
									<div class="flex gap-1">
										<button
											onclick={() => updateUrl({ page: result.page - 1 })}
											disabled={result.page <= 1}
											class="cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[5px] font-mono text-[12px] font-semibold text-[var(--fg)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
											aria-label="Previous page">‹</button
										>

										{#each Array(Math.min(result.totalPages, 5)) as _p, idx (idx)}
											{@const pageNum =
												result.totalPages <= 5
													? idx + 1
													: result.page <= 3
														? idx + 1
														: result.page >= result.totalPages - 2
															? result.totalPages - 4 + idx
															: result.page - 2 + idx}
											<button
												onclick={() => updateUrl({ page: pageNum })}
												class="cursor-pointer rounded-[6px] border px-2.5 py-[5px] font-mono text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] {pageNum ===
												result.page
													? 'border-[var(--accent)] bg-[var(--accent)] text-white'
													: 'border-[var(--border)] bg-[var(--bg-elev)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}"
												aria-label="Page {pageNum}"
												aria-current={pageNum === result.page ? 'page' : undefined}
											>
												{pageNum}
											</button>
										{/each}

										<button
											onclick={() => updateUrl({ page: result.page + 1 })}
											disabled={result.page >= result.totalPages}
											class="cursor-pointer rounded-[6px] border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-[5px] font-mono text-[12px] font-semibold text-[var(--fg)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
											aria-label="Next page">›</button
										>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{:catch _e}
					<tr>
						<td colspan="8" class="px-4 py-12 text-center">
							<p class="mb-2 text-[var(--muted)]">{t('common.error')}</p>
							<button
								onclick={() => invalidate('items:list')}
								class="text-sm font-medium text-[var(--accent)] hover:underline"
							>
								{t('common.retry')}
							</button>
						</td>
					</tr>
				{/await}
			</tbody>
		</table>
	</div>
</div>
