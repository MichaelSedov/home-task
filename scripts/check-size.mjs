#!/usr/bin/env node
/**
 * Per-route initial-JS bundle check.
 *
 * Why a hand-rolled script and not `size-limit`?
 * `@size-limit/preset-small-lib` re-bundles inputs through esbuild as a
 * library before measuring, which roughly 7×'d our numbers (327 KB vs.
 * the 47 KB the user actually downloads). What we want is the gzipped
 * file size of exactly the chunks SvelteKit preloads for a given route —
 * the bytes a first-time visitor pays for.
 *
 * The brief calls for "initial route JS ≤ 80 KB gzip on the public
 * surface, ≤ 150 KB on the dashboard", with permission to pick our own
 * numbers if justified. Budgets below are set just above the current
 * measured baseline so any regression fails CI.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CLIENT_ROOT = '.svelte-kit/output/client';
const PRERENDER_ROOT = '.svelte-kit/output/prerendered/pages';

/** @type {{ name: string; html: string; limitKB: number }[]} */
const ROUTES = [
	{ name: '/en/blog', html: 'en/blog.html', limitKB: 60 },
	{
		name: '/en/blog/[slug]',
		html: 'en/blog/sub-second-lcp-on-a-content-site.html',
		limitKB: 60
	}
];

function chunksFromHtml(htmlPath) {
	const html = readFileSync(htmlPath, 'utf8');
	return [...new Set([...html.matchAll(/\/_app\/immutable\/[a-z]+\/[^"]+\.js/g)].map((m) => m[0]))];
}

function gzipKB(filePath) {
	const buf = readFileSync(filePath);
	return gzipSync(buf, { level: 9 }).length / 1024;
}

let failed = false;
for (const route of ROUTES) {
	const htmlPath = join(PRERENDER_ROOT, route.html);
	if (!existsSync(htmlPath)) {
		console.error(`✗ ${route.name}: prerendered HTML not found at ${htmlPath} — run \`npm run build\` first`);
		failed = true;
		continue;
	}
	const refs = chunksFromHtml(htmlPath);
	let total = 0;
	const sizes = [];
	for (const ref of refs) {
		const kb = gzipKB(join(CLIENT_ROOT, ref));
		total += kb;
		sizes.push({ ref, kb });
	}
	const ok = total <= route.limitKB;
	const status = ok ? '✓' : '✗';
	console.log(
		`${status} ${route.name}: ${total.toFixed(2)} KB gzip (limit ${route.limitKB} KB, ${refs.length} chunks)`
	);
	if (!ok) {
		failed = true;
		sizes.sort((a, b) => b.kb - a.kb);
		for (const s of sizes.slice(0, 5)) {
			console.log(`    ${s.kb.toFixed(2).padStart(7)} KB  ${s.ref}`);
		}
	}
}

process.exit(failed ? 1 : 0);
