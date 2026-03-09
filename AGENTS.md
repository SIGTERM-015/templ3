# AGENTS.md — Templ3 Monorepo

Agent guide for the `templ3` repository. For Payload CMS-specific rules, see `apps/cms/AGENTS.md`.

---

## Monorepo Overview

`pnpm` workspace with two apps:

| App | Path | Stack |
|---|---|---|
| Site | `apps/site/` | Astro 5 + React 19 + Three.js + Cloudflare Workers |
| CMS | `apps/cms/` | Payload CMS 3 + Next.js 15 + PostgreSQL + Cloudflare Containers |

Package manager: **pnpm@10.30.3** — always use `pnpm`, never `npm` or `yarn`.

---

## Commands

### Root (run from repo root)

```bash
pnpm dev                  # Start both apps in parallel
pnpm dev:site             # Start Astro site only
pnpm dev:cms              # Start Payload CMS only
pnpm build:site           # Build site
pnpm build:cms            # Build CMS
pnpm deploy:site          # Build + deploy site to Cloudflare Workers
pnpm deploy:cms           # Deploy CMS to Cloudflare Containers
pnpm generate:cms-types   # Regenerate Payload TypeScript types
```

### Site (`apps/site/`)

```bash
pnpm dev        # astro dev
pnpm build      # astro build
pnpm preview    # astro build && wrangler dev
pnpm deploy     # astro build && wrangler deploy
pnpm cf-typegen # wrangler types  (regenerate worker-configuration.d.ts)
```

The site has no linter and no test suite. TypeScript is validated by Astro's
strict tsconfig. Run `tsc --noEmit` to check types manually.

### CMS (`apps/cms/`)

```bash
pnpm dev              # next dev
pnpm build            # next build
pnpm lint             # next lint (ESLint flat config)
pnpm test             # run all tests (int + e2e)
pnpm test:int         # vitest run (integration tests)
pnpm test:e2e         # playwright test (e2e tests)
pnpm generate:types   # payload generate:types  ← run after schema changes
pnpm generate:importmap  # payload generate:importmap  ← run after adding components
pnpm seed             # tsx src/seed.ts
pnpm devsafe          # rm -rf .next && next dev  (use when dev server is broken)
pnpm cf:dev           # wrangler dev
pnpm cf:deploy        # wrangler deploy
```

#### Running a single test

```bash
# Single integration test file (from apps/cms/)
pnpm vitest run tests/int/mytest.int.spec.ts

# Single integration test by name pattern
pnpm vitest run -t "test name pattern" tests/int/mytest.int.spec.ts

# Single Playwright e2e file
pnpm playwright test tests/e2e/mytest.spec.ts --config=playwright.config.ts

# Single Playwright test by name
pnpm playwright test --grep "test name" --config=playwright.config.ts
```

Integration tests live in `apps/cms/tests/int/` and use the suffix `.int.spec.ts`.
E2e tests live in `apps/cms/tests/e2e/`.

#### TypeScript validation (CMS)

```bash
# From apps/cms/
tsc --noEmit
```

Always run `pnpm generate:types` **before** `tsc --noEmit` after any collection
or global schema change, or the generated `payload-types.ts` will be stale.

---

## TypeScript

- **Strict mode** is enabled in both apps (`strict: true` / `astro/tsconfigs/strict`).
- Prefer `type` over `interface` for all local types and component props.
- Use `import type { ... }` for type-only imports.
- Never edit `apps/cms/src/payload-types.ts` manually — it is auto-generated.
- CMS path alias: `@/*` maps to `apps/cms/src/*`.
- Avoid `any`; ESLint will warn. Use `unknown` + narrowing or proper generics.
- Prefix intentionally unused variables with `_` to silence the unused-vars rule.

---

## Formatting & Style

Applies to the CMS. The site has no formatter configured — match the surrounding
file's style when editing site code.

| Setting | Value |
|---|---|
| Quotes | Single (`'`) |
| Semicolons | None |
| Trailing commas | All |
| Print width | 100 |
| Formatter | Prettier 3 |

Run `pnpm lint` in `apps/cms/` to check ESLint. ESLint uses the Next.js flat
config (`eslint.config.mjs`) extending `next/core-web-vitals` and
`next/typescript`.

---

## Import Order

1. External packages (React hooks first, then other npm packages)
2. `import type { ... }` statements
3. Internal absolute imports (`@/...`)
4. Relative imports (deepest/utility first, then peer components)
5. Side-effect imports (CSS) last — Astro files only

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `DesktopShell`, `WindowFrame` |
| React hooks | camelCase `use` prefix | `useTerminal`, `useCallback` |
| Functions & variables | camelCase | `createWindow`, `openWindow` |
| Types & aliases | PascalCase | `type WindowState = ...` |
| Module-level constants | SCREAMING_SNAKE_CASE | `CACHE_TTL`, `FULL_BLEED_APPS` |
| Payload collections | PascalCase named export | `Posts`, `SiteIdentity` |
| CMS-mirrored types in site | `Cms` prefix | `CmsPost`, `CmsSiteIdentity` |
| CSS classes | BEM kebab-case | `gazette-card__date` |
| Test files (int) | `.int.spec.ts` suffix | `posts.int.spec.ts` |

---

## Error Handling

- Wrap fetch calls in `try/catch`; return `[]` or `null` on failure — no re-throw.
- JSON parse from `localStorage`/`sessionStorage`: use `try/catch` with empty catch.
- API routes return `Response.json({ error: '...' }, { status: 4xx })`.
- In Payload hooks, use `req.payload.logger.warn()` — never `console.warn`.
- Defensive coding throughout the site — always provide a graceful fallback, never
  assume network calls succeed.

---

## Architecture Notes

### Site — Desktop OS Shell

The entire site simulates a desktop OS. `Layout.astro` wraps every page and
mounts `DesktopShell` (React island, `client:load`). Each "page" is a draggable
window managed by a single `useReducer` in `DesktopShell`.

- Astro pages are **SSR** (`export const prerender = false`) — they fetch CMS
  data server-side and pass it to `DesktopShell` as a `serverData` JSON string prop.
- CMS data is cached at the edge via Cloudflare CDN (`cf.cacheTtl` fetch option)
  with TTLs ranging from 5 min (posts listing) to 24 hours (static config).
- To bypass cache for fresh content, append `?v=1` to the URL.
- Theme and window state persist to `localStorage`/`sessionStorage`.

### CMS — Payload 3 + Next.js 15

See `apps/cms/AGENTS.md` for the full Payload-specific guide. Key points:

- Run `pnpm generate:types` after **any** schema change (collections, globals, fields).
- Run `pnpm generate:importmap` after adding or moving custom admin components.
- Local API **bypasses access control** by default — always pass `overrideAccess: false`
  when you need access control enforced in server-side code.
- Pass `req` to all nested Payload operations inside hooks to share the transaction.
- Avoid infinite hook loops: guard `afterChange` hooks with `req.context` flags.
- Storage is Cloudflare R2 (S3-compatible); conditionally enabled via env vars.

---

## Environment Variables

Never commit `.env` files. Each app reads its own `.env` (or `.dev.vars` for
Wrangler). Key vars:

- `apps/cms/` — `DATABASE_URI`, `PAYLOAD_SECRET`, R2 credentials, SMTP
- `apps/site/` — `PUBLIC_CMS_URL`, Spotify credentials (via `wrangler.jsonc`)

---

## Key Files

| Path | Purpose |
|---|---|
| `apps/site/src/data/siteConfig.ts` | Static config + fallback values for site |
| `apps/site/src/lib/cms.ts` | CMS API client + all CMS-mirrored types |
| `apps/site/src/lib/spotify.ts` | Spotify Now Playing integration |
| `apps/cms/src/payload.config.ts` | Main Payload config |
| `apps/cms/src/payload-types.ts` | **Auto-generated** — do not edit |
| `apps/cms/src/fields/slug.ts` | Reusable slug field factory |
| `apps/cms/AGENTS.md` | Full Payload CMS development guide |
