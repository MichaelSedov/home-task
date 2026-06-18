/**
 * Per-route initial JS budgets.
 *
 * The brief's stated target is "initial route JS ≤ 80 KB gzip on the public
 * surface", but explicitly permits picking your own numbers with justification.
 * The earlier "Public app shell" budget summed every chunk under chunks/* —
 * including per-route lazy chunks never loaded together — and was therefore
 * not actually measuring initial route JS. This config instead resolves the
 * exact <link rel="modulepreload"> / <script type="module"> set that SvelteKit
 * injects into the prerendered HTML for a given route, which is the real
 * initial payload a first-time visitor downloads.
 *
 * The 340 KB limit reflects the current baseline of this project (client.js,
 * remote-entry, utils, i18n dicts, ~49 KB gzip Svelte runtime, etc.). It is
 * substantially above the brief's aspirational 80 KB because the project ships
 * the SvelteKit runtime, RUM beacon, theme toggle, and i18n on every public
 * route. Lowering further is a separate optimization track (route-level code
 * splitting of the layout, deferring obs, etc.) and not in scope here.
 *
 * Run `npm run build` before `npm run size`, otherwise prerendered HTML is
 * stale and resolution falls back to a glob.
 */
const fs = require('node:fs');
const path = require('node:path');

const CLIENT_ROOT = '.svelte-kit/output/client';
const PRERENDER_ROOT = '.svelte-kit/output/prerendered/pages';

function resolveInitialChunks(htmlRelPath) {
	const htmlPath = path.join(PRERENDER_ROOT, htmlRelPath);
	if (!fs.existsSync(htmlPath)) {
		return [`${CLIENT_ROOT}/_app/immutable/entry/*.js`];
	}
	const html = fs.readFileSync(htmlPath, 'utf8');
	const refs = new Set();
	for (const m of html.matchAll(/\/_app\/immutable\/[a-z]+\/[^"'\s]+\.js/g)) {
		refs.add(m[0]);
	}
	return [...refs].map((p) => path.join(CLIENT_ROOT, p.replace(/^\//, '')));
}

module.exports = [
	{
		name: 'Public entry chunk',
		path: `${CLIENT_ROOT}/_app/immutable/entry/*.js`,
		limit: '100 KB',
		gzip: true
	},
	{
		name: 'Blog post initial JS (/en/blog/[slug])',
		path: resolveInitialChunks('en/blog/sub-second-lcp-on-a-content-site.html'),
		limit: '340 KB',
		gzip: true
	},
	{
		name: 'Blog list initial JS (/en/blog)',
		path: resolveInitialChunks('en/blog.html'),
		limit: '340 KB',
		gzip: true
	}
];
