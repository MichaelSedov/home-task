<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		onClose: () => void;
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, onClose, title, description, children, footer }: Props = $props();

	let dialogEl = $state<HTMLDivElement | null>(null);
	let prevFocus: HTMLElement | null = null;

	const FOCUSABLE =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	$effect(() => {
		if (!open) return;

		prevFocus = document.activeElement as HTMLElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		(async () => {
			await tick();
			const first = dialogEl?.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? dialogEl)?.focus();
		})();

		return () => {
			document.body.style.overflow = previousOverflow;
			prevFocus?.focus();
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
			return;
		}
		if (e.key !== 'Tab' || !dialogEl) return;

		const focusable = Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => !el.hasAttribute('disabled') && el.offsetParent !== null
		);
		if (focusable.length === 0) {
			e.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement;

		if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="presentation"
		transition:fade={{ duration: 150 }}
	>
		<!-- Backdrop -->
		<button
			type="button"
			aria-label="Close dialog"
			onclick={onClose}
			class="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
		></button>

		<!-- Dialog -->
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby={description ? 'dialog-desc' : undefined}
			tabindex="-1"
			onkeydown={handleKeydown}
			transition:scale={{ duration: 180, start: 0.95 }}
			class="relative z-10 w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] p-6 shadow-[var(--shadow-lg)] outline-none"
		>
			<div class="mb-4">
				<h2 id="dialog-title" class="text-lg font-bold text-[var(--fg)]">{title}</h2>
				{#if description}
					<p id="dialog-desc" class="mt-1 text-sm text-[var(--muted)]">{description}</p>
				{/if}
			</div>

			<div class="mb-6 text-sm text-[var(--fg-2)]">
				{@render children()}
			</div>

			{#if footer}
				<div class="flex justify-end gap-2">{@render footer()}</div>
			{/if}
		</div>
	</div>
{/if}
