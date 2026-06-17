<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatMoney, formatPercent, formatDate } from '$lib/i18n/t.js';
	import { goto, invalidate } from '$app/navigation';
	import { toSearchParams } from '$lib/schemas/query.js';
	import type { Item, ItemStatus } from '$lib/schemas/item.js';
	import { toasts } from '$lib/ui/toast.store.js';
	import { SvelteMap } from 'svelte/reactivity';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';
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

	const statusBadge: Record<ItemStatus, 'default' | 'accent' | 'success' | 'warn' | 'muted'> = {
		draft: 'default',
		scheduled: 'warn',
		active: 'success',
		paused: 'muted',
		completed: 'accent',
		archived: 'muted'
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

	// Sort indicator
	function sortIcon(field: string) {
		if (q.sort !== field) return '';
		return q.order === 'asc' ? ' ↑' : ' ↓';
	}
</script>

<svelte:head>
	<title>{t('dashboard.items.title')} — Demo Co.</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-[var(--fg)]">{t('dashboard.items.title')}</h1>
	</div>

	<!-- Filters — items-start prevents search input stretching when Combobox grows with chips -->
	<div class="mb-6 flex flex-wrap items-start gap-3">
		<input
			type="search"
			placeholder="Search campaigns…"
			value={q.q}
			oninput={(e) => updateUrl({ q: (e.currentTarget as HTMLInputElement).value })}
			class="h-[42px] w-56 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
			aria-label="Search campaigns"
		/>
		<div class="w-48">
			<Combobox
				options={STATUS_OPTIONS}
				selected={q.status}
				placeholder="Status…"
				onchange={(vals) => updateUrl({ status: vals as ItemStatus[] })}
			/>
		</div>
		<div class="w-44">
			<Combobox
				options={CHANNEL_OPTIONS}
				selected={q.channel}
				placeholder="Channel…"
				onchange={(vals) => updateUrl({ channel: vals as typeof q.channel })}
			/>
		</div>
	</div>

	<!-- Table -->
	<div
		class="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-sm)]"
	>
		<table class="w-full text-sm" role="grid" aria-label={t('dashboard.items.title')}>
			<thead>
				<tr
					class="border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--muted)]"
				>
					{#each columns as col (col.key)}
						<th
							scope="col"
							aria-sort={col.sortable && q.sort === col.key
								? q.order === 'asc'
									? 'ascending'
									: 'descending'
								: 'none'}
							class="px-4 py-3 {['budget', 'spent', 'ctr'].includes(col.key) ? 'text-right' : ''}"
						>
							{#if col.sortable}
								<button
									onclick={() => toggleSort(col.key)}
									class="inline-flex items-center gap-1 hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
								>
									{col.label}{sortIcon(col.key)}
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
								<td class="px-4 py-3">
									<Skeleton class="h-4 {j === 0 ? 'w-40' : 'w-20'}" />
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
								class="border-b border-[var(--border)] last:border-0 {isPending
									? 'opacity-60'
									: 'hover:bg-[var(--bg-soft)]'} transition-opacity"
								aria-busy={isPending}
							>
								<!-- Name -->
								<td class="px-4 py-3 font-medium text-[var(--fg)] max-w-xs">
									<span class="block truncate" title={row.name}>{row.name}</span>
								</td>

								<!-- Status — inline editable -->
								<td class="px-4 py-3">
									{#if canEdit && editing?.id === row.id && editing.field === 'status'}
										<select
											class="rounded border border-[var(--accent)] bg-[var(--bg-elev)] px-2 py-1 text-xs text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
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
									{:else}
										<button
											onclick={() => canEdit && startEdit(row, 'status')}
											disabled={!canEdit || isPending}
											class="group flex items-center gap-1 {canEdit
												? 'cursor-pointer'
												: 'cursor-default'}"
											aria-label="{canEdit ? 'Edit' : ''} status: {status}"
										>
											<Badge variant={statusBadge[status]}>{status}</Badge>
											{#if canEdit}
												<span
													class="text-[var(--muted)] opacity-0 group-hover:opacity-100 text-xs"
													aria-hidden="true">✎</span
												>
											{/if}
										</button>
									{/if}
								</td>

								<!-- Channel -->
								<td class="px-4 py-3 capitalize text-[var(--fg-2)]">{row.channel}</td>

								<!-- Owner -->
								<td class="px-4 py-3 text-[var(--fg-2)]">
									<div class="flex items-center gap-2">
										<Avatar name={row.owner.name} size="sm" />
										<span class="truncate">{row.owner.name}</span>
									</div>
								</td>

								<!-- Budget -->
								<td class="px-4 py-3 text-right tabular-nums text-[var(--fg-2)]">
									{formatMoney(row.budget, lang)}
								</td>

								<!-- Spent -->
								<td class="px-4 py-3 text-right tabular-nums text-[var(--fg-2)]">
									{formatMoney(row.spent, lang)}
								</td>

								<!-- CTR -->
								<td class="px-4 py-3 text-right tabular-nums text-[var(--fg-2)]">
									{formatPercent(row.ctr, lang)}
								</td>

								<!-- Updated -->
								<td class="px-4 py-3 text-[var(--muted)]">
									<time datetime={row.updatedAt}>{formatDate(row.updatedAt, lang)}</time>
								</td>
							</tr>
						{/each}
					{/if}

					<!-- Pagination -->
					{#if result.totalPages > 1}
						<tr>
							<td colspan="8" class="px-4 py-3">
								<div class="flex items-center justify-between text-sm text-[var(--muted)]">
									<span>
										{(result.page - 1) * result.pageSize + 1}–{Math.min(
											result.page * result.pageSize,
											result.total
										)} of {result.total}
									</span>
									<div class="flex gap-2">
										<button
											onclick={() => updateUrl({ page: result.page - 1 })}
											disabled={result.page <= 1}
											class="rounded border border-[var(--border)] px-3 py-1 text-xs disabled:opacity-40 hover:bg-[var(--bg-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
											aria-label="Previous page"
										>
											← Prev
										</button>
										<span
											class="rounded border border-[var(--border)] px-3 py-1 text-xs bg-[var(--accent-soft)] text-[var(--accent-ink)]"
										>
											{result.page} / {result.totalPages}
										</span>
										<button
											onclick={() => updateUrl({ page: result.page + 1 })}
											disabled={result.page >= result.totalPages}
											class="rounded border border-[var(--border)] px-3 py-1 text-xs disabled:opacity-40 hover:bg-[var(--bg-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
											aria-label="Next page"
										>
											Next →
										</button>
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
