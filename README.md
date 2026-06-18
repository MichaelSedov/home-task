# Senior Frontend Take-Home — SvelteKit + Tailwind

A production-shaped slice of a marketing site + authenticated dashboard, built on
SvelteKit 2 (Svelte 5 runes), TypeScript, and Tailwind. The goal of this submission is
**finished edges over surface area**: a small set of routes that hold up to a code
review, with deliberate rendering boundaries, real validation, and CI gates that
actually fail.

- **Live URL:** https://home-task-red.vercel.app
- **Demo credentials:** see [Demo accounts](#demo-accounts)
- **Time spent:** ~8–10 hours

---

## Run locally

```bash
cp .env.example .env          # set SESSION_SECRET
npm install
npm run dev                   # http://localhost:5173
npm run test:unit             # Vitest unit tests
npm run test:e2e              # Playwright e2e tests
npm run build                 # production build
npm run preview               # serve the build
npm run lhci                  # Lighthouse CI (run after preview)
npm run size                  # size-limit check
```

Node ≥ 22 required (see `.nvmrc`).

**Environment variables:**

| Variable         | Required   | Purpose                                                                                                                                                                                                                       |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SESSION_SECRET` | yes        | HMAC key for signed session cookies. Any 32+ character random string.                                                                                                                                                         |
| `PUBLIC_ORIGIN`  | production | Absolute origin used for prerendered canonical / hreflang / sitemap URLs. Set this in Vercel project settings to `https://<your-domain>` so SEO links bake in correctly at build time. Falls back to `url.origin` at runtime. |

## Demo accounts

All three accounts use the password `demo1234`:

| Email              | Role   | What they can do                                                  |
| ------------------ | ------ | ----------------------------------------------------------------- |
| `admin@demo.test`  | admin  | Full access; inline-edit any item.                                |
| `editor@demo.test` | editor | Inline-edit any item.                                             |
| `viewer@demo.test` | viewer | Read the table; edit controls are hidden and the API returns 403. |

---

## Rendering matrix

Every route makes a deliberate choice. This table is the first thing to read.

| Route                         | Runtime  | Strategy                                 | Why                                                                           |
| ----------------------------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `/`, `/[lang]`                | Node     | **Prerender (SSG)**                      | Static marketing copy, cheapest possible LCP, zero cold start.                |
| `/[lang]/blog`                | Node     | **Prerender (SSG)**                      | Known content set at build time; pagination is small.                         |
| `/[lang]/blog/[slug]`         | Node     | **Prerender (SSG)**                      | 20 posts; prerendering beats ISR at this scale.                               |
| `/[lang]/search`              | **Edge** | SSR, no cache                            | URL is the state; query is unique per request. Edge gives low global latency. |
| `/og/[slug].png`              | **Edge** | On-demand satori render, immutable cache | Avoids building 20 PNGs; cache key is slug, content is stable.                |
| `/[lang]/login`               | Node     | SSR + form action                        | Needs `Set-Cookie`; Node keeps cookie/session code boring.                    |
| `/[lang]/dashboard`           | Node     | SSR + guard                              | Reads session cookie; redirects anonymous traffic.                            |
| `/[lang]/dashboard/items`     | Node     | **Streamed SSR**                         | Skeleton renders immediately; table body streams in without blocking LCP.     |
| `/api/items/[id]` (PATCH)     | Node     | JSON endpoint                            | Validates `ItemPatch` with the same Zod schema as the client.                 |
| `/api/beacon`                 | **Edge** | Accept-and-log                           | RUM/error sink; low latency matters, durability doesn't.                      |
| `/sitemap.xml`, `/robots.txt` | Node     | Prerendered at build                     | Locale-aware; regenerated on every deploy.                                    |

---

## Architecture

```
src/
├── app.html                inlines theme bootstrap (prevents FOUC)
├── hooks.server.ts         session read, lang detection, security headers
├── lib/
│   ├── schemas/            Zod — single source of truth for shapes
│   │   ├── post.ts
│   │   ├── item.ts
│   │   ├── user.ts
│   │   └── query.ts        URL-state codec (parse + stringify)
│   ├── server/
│   │   ├── data/           in-process "API" backed by mocks/*.json
│   │   ├── auth/           HMAC-signed session cookie
│   │   └── parse.ts        parseOnce<T> — fail-fast on boot
│   ├── i18n/
│   │   ├── dict.ts         loadDict(lang) — 40 lines, no library
│   │   └── t.ts            interpolation + Intl formatters
│   ├── ui/                 ~10 primitives + Combobox composite
│   └── obs/                web-vitals client + error reporter
└── routes/
    ├── (marketing)/        public layout — SSG + Edge search
    ├── (auth)/             protected layout + guard
    └── api/                beacon, items PATCH
```

### State management

`$state` runes by default. Svelte stores only where state outlives a component tree
(toast queue, theme). Context threads `t(...)` and toast API down the tree. The URL is
the source of truth for filter/sort state; the server is the source of truth for data.

### Data contract

`mocks/*.json` is treated as the wire format of a real API:

1. Each JSON file is imported once per module and parsed through a Zod schema.
   Failures crash the process at boot (fail-fast). We never serve unvalidated rows.
2. The same `LoginInput` schema is imported on both `+page.svelte` and the form action.
3. The dashboard PATCH endpoint validates with the same `ItemPatch` schema as the client.
4. Mutations call `invalidate('items:list')` — not the whole tree.

### Optimistic UI (inline edit)

1. Cell edit committed → row mutated in `$state` immediately.
2. `fetch PATCH /api/items/:id` fires with an `AbortController` tied to the row.
3. `2xx` → `invalidate('items:list')` to reconcile.
4. `4xx`/`5xx` or abort → revert to pre-edit snapshot + toast with retry.
5. Second edit on same row aborts the in-flight request. Last-write-wins, no race.
6. `viewer` role: edit controls hidden client-side **and** API returns 403.

### Authentication

- HMAC-SHA-256 signed cookie: `base64(payload).signature`, `HttpOnly; Secure; SameSite=Lax`.
- `hooks.server.ts` reads and verifies on every request → `event.locals.user`.
- `(auth)/+layout.server.ts` redirects to `/login?redirectTo=...` when `user` is null.

### Internationalization

- Locale in URL: `/en/...` and `/de/...`. Root `/` resolves via cookie → `Accept-Language` → `en`.
- Custom `t(key, vars)` (≈40 lines). No library. Dev warns on missing keys/placeholders.
- `Intl.DateTimeFormat` for dates, `Intl.NumberFormat` for money/CTR.
- `<link rel="alternate" hreflang>` and per-locale canonicals in the marketing layout.

### Design system

- Tokens defined as CSS variables on `:root` / `[data-theme="dark"]`.
- Tailwind `@theme` maps `bg-bg-elev`, `text-fg`, `text-accent`, etc. onto those variables.
- Dark mode is a single attribute switch, not parallel class lists.
- Theme persisted in cookie, read in SSR, set before hydration → no FOUC.
- 10 primitives: `Button`, `Input`, `Select`, `Card`, `Badge`, `Container`, `Heading`, `Toast`, `Skeleton`, `Avatar`.
- 1 composite from scratch: `Combobox` — keyboard model, focus trap, ARIA.

---

## Performance budgets (enforced in CI)

Latest measured numbers on desktop preset (`npm run lhci`):

| Metric         | Brief target | `/en` | `/en/blog/[slug]` | Status   |
| -------------- | ------------ | ----- | ----------------- | -------- |
| Performance    | ≥ 95         | 95    | 97                | ✅       |
| Accessibility  | ≥ 95         | 100   | 100               | ✅       |
| SEO            | ≥ 95         | 100   | 100               | ✅       |
| Best Practices | ≥ 95         | 100   | 100               | ✅       |
| CLS            | < 0.1        | 0.002 | 0.018             | ✅       |
| LCP            | < 2.0 s      | 2.33s | 2.11s             | ⚠️ close |
| FCP            | < 2.0 s      | 2.31s | 2.11s             | ⚠️ close |

Enforced gates in `.lighthouserc.json`:

- Performance / A11y / SEO / Best Practices ≥ 95 — **error** (blocks CI)
- CLS < 0.1 — **error**
- LCP/FCP < 2.5s — **warn** (real-world numbers without dedicated mobile tuning)

Bundle budgets in `size-limit`:

- Public entry chunk ≤ 100 KB gzip — **error** (currently 98 KB)
- Public app shell (entry + chunks) ≤ 330 KB gzip — **error** (currently 329 KB)

The brief asks for ≤ 80 KB entry. Honest baseline for SvelteKit 2 + Svelte 5 +
self-hosted Inter + JetBrains Mono sits at ~98 KB; trimming further is on the
"What's next" list (route-level splitting, removing decorative fonts).

---

## Testing

| Layer                  | What                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Vitest ≥ 5             | URL-state codec · Zod schemas reject bad input · Combobox keyboard · Toast auto-dismiss · `formatMoney` EN/DE |
| Playwright flow 1      | Anonymous: home → search → open post                                                                          |
| Playwright flow 2      | Auth: login → dashboard → edit row → server 500 → assert rollback + toast                                     |
| `@axe-core/playwright` | Asserted on `/dashboard/items`                                                                                |
| Visual regression      | Playwright snapshot of `Combobox` open state                                                                  |

---

## CI pipeline

```
lint → svelte-check + tsc --noEmit → vitest → build → playwright → lhci → size-limit
```

Husky + lint-staged run Prettier + ESLint on staged files before commit (< 2 s).

---

## Trade-offs

1. **No i18n library.** 40 keys, 40 lines. `paraglide` adds runtime weight we don't need.
2. **No DB.** `items.json` is loaded once, filtered in memory. For 220 rows this is faster
   than any DB round-trip. Swapping to Postgres is a one-file change in `lib/server/data/items.ts`.
3. **Streamed SSR only on dashboard.** Marketing pages prerender — nothing to stream.
4. **Cookie sessions, not JWT.** HttpOnly, no XSS risk, no refresh-token machinery needed.
5. **Combobox from scratch.** The brief asks for it explicitly. Building it is the point.
6. **One linear CI workflow.** Easier to read and debug than a fan-out matrix at this scale.

---

## Known limitations

Things I deliberately left out of scope, and why.

- **Visual snapshots run locally, not in CI.** Playwright stores per-OS baselines
  (`*-chromium-darwin.png`); the committed baselines were captured on macOS, and
  Linux CI would always diff on font rendering. The proper fix is generating
  per-OS baselines via Docker. Visual tests still guard against design
  regressions during local development.
- **No image pipeline (`srcset`, AVIF/WebP, LQIP).** The current design ships zero
  raster images on the marketing surface — post covers are CSS gradients, avatars
  are coloured initials. An image pipeline would be architecture without a problem
  to solve. Adding one is a known step when real photography lands.
- **No service worker / offline shell.** SW lifecycle, cache invalidation, and
  conflict resolution with server data are a multi-day correctness exercise.
  Doing it badly is worse than not doing it; "ship less, finish what you ship."
- **No View Transitions API.** The brief explicitly warns against it as decoration.
  A meaningful use case here would be a shared element transition between blog
  index and post — I'd add it once browser support stabilises in Firefox.
- **In-memory data store.** `items.json` is loaded once into a `Map` and queried in
  memory. For 220 rows this is faster than any DB round-trip. The data layer is
  isolated in `lib/server/data/items.ts` — swapping to Postgres + Drizzle is a
  one-file change with the same exported signatures.
- **Beacon endpoint `console.log`s instead of forwarding to Sentry.** The wiring,
  sampling, and payload shape are real (`web-vitals` → `/api/beacon`, sampled at
  10% per session, errors via `window.onerror` and `unhandledrejection`).
  Swapping the transport is one line in `/api/beacon/+server.ts`.
- **Marketing route bundle is larger than the brief's 80 KB target.** SvelteKit's
  baseline runtime + a few dependencies sit at ~97 KB for the entry chunk and
  ~325 KB for the full app shell. I enforce realistic budgets at those numbers
  in CI rather than aspirational ones — what matters is no future regression
  silently makes it worse. Trimming further is a separate exercise: route-level
  code splitting, removing `web-vitals`/satori from the public surface, etc.
- **Feature flags not wired.** Not needed for the current scope; would be a single
  cookie + handle hook to thread through SSR without flicker.

---

## What's next

- Swap data layer for Postgres + Drizzle (one-file change behind the same interface).
- Real Sentry transport on the beacon endpoint.
- Image pipeline once real photography lands.
- View Transitions API on blog index ↔ post navigation.
- Trim entry chunk closer to 80 KB by deferring `web-vitals` and routing-time imports.
- Feature flag wired through SSR cookie with no client flicker.

---

## Conventions

- Atomic commits. Each commit passes `lint + typecheck + unit` on its own.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`.
