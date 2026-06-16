const SAMPLE_RATE = 0.1;

function isSampled(): boolean {
	try {
		const key = 'rum_sampled';
		const stored = sessionStorage.getItem(key);
		if (stored !== null) return stored === '1';
		const sampled = Math.random() < SAMPLE_RATE;
		sessionStorage.setItem(key, sampled ? '1' : '0');
		return sampled;
	} catch {
		return Math.random() < SAMPLE_RATE;
	}
}

export async function initVitals() {
	if (!isSampled()) return;

	const { onLCP, onINP, onCLS, onTTFB } = await import('web-vitals');
	const send = (name: string, value: number, id: string) => {
		navigator.sendBeacon('/api/beacon', JSON.stringify({ type: 'vitals', name, value, id }));
	};

	onLCP((m) => send(m.name, m.value, m.id));
	onINP((m) => send(m.name, m.value, m.id));
	onCLS((m) => send(m.name, m.value, m.id));
	onTTFB((m) => send(m.name, m.value, m.id));
}

export function initErrorReporter() {
	const send = (payload: unknown) => {
		try {
			navigator.sendBeacon(
				'/api/beacon',
				JSON.stringify({ type: 'error', ...(payload as object) })
			);
		} catch {
			// sendBeacon is best-effort; swallow failures silently
		}
	};

	window.addEventListener('error', (e) => {
		send({ message: e.message, source: e.filename, line: e.lineno });
	});

	window.addEventListener('unhandledrejection', (e) => {
		send({ message: String(e.reason) });
	});
}
