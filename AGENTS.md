# AGENTS.md — Templ3 Monorepo

You are an AI agent working in the `templ3` monorepo. This guide contains essential rules, commands, and conventions you must follow.

## Workspace Overview
This is a `pnpm` workspace (`pnpm@10.30.3` ONLY. Never use `npm` or `yarn`).
- **`apps/site/`**: Astro 5 + React 19 + Cloudflare Workers (Frontend: Desktop OS UI)
- **`apps/cms/`**: Payload CMS 3 + Next.js 15 + PostgreSQL (Backend/CMS)

## Build, Lint, and Test Commands

Run these from the repo root unless specified otherwise:
```bash
pnpm dev                  # Start both apps
pnpm build:site           # Build Astro site
pnpm build:cms            # Build Payload CMS
pnpm generate:cms-types   # Regenerate Payload TypeScript types (RUN AFTER SCHEMA CHANGES)
```

### CMS App (`apps/cms/`)
```bash
pnpm lint                 # Run Next.js ESLint
pnpm test                 # Run all tests (int + e2e)
pnpm generate:types       # payload generate:types
pnpm generate:importmap   # payload generate:importmap (RUN AFTER COMPONENT CHANGES)
tsc --noEmit              # Typecheck CMS
```

**Running a single test (CRITICAL FOR VERIFICATION):**
```bash
# Run a single integration test file (.int.spec.ts)
pnpm vitest run tests/int/mytest.int.spec.ts --dir apps/cms
# Or cd apps/cms && pnpm vitest run tests/int/mytest.int.spec.ts

# Run integration test by name pattern
pnpm vitest run -t "test name" tests/int/mytest.int.spec.ts --dir apps/cms

# Run single E2E test file
cd apps/cms && pnpm playwright test tests/e2e/mytest.spec.ts
```

### Site App (`apps/site/`)
*The site has no linter or test suite.* Validation is strictly via TypeScript.
```bash
pnpm --dir apps/site typecheck         # Typecheck site (astro sync generates astro:* types first)
pnpm cf-typegen                         # Regenerate Cloudflare worker-configuration.d.ts
```

## Code Style & Conventions

### 1. Types & TypeScript
- **Strict mode** is ON. Avoid `any`; use `unknown` with narrowing.
- Prefer `type` over `interface` for all local types and React props.
- Use `import type { ... }` for type-only imports.
- **DO NOT manually edit** `apps/cms/src/payload-types.ts` (auto-generated).

### 2. Formatting (CMS only, Site inherits surrounding style)
- **Quotes**: Single (`'`)
- **Semicolons**: None
- **Trailing commas**: All
- **Print width**: 100
- Run `pnpm lint` in `apps/cms` to verify. For the site, match the surrounding code.

### 3. Import Order
1. External packages (React hooks first, then others).
2. Type imports (`import type { ... }`).
3. Internal absolute imports (`@/...` in CMS, or `../../` in site).
4. Relative sibling/child imports.
5. Side-effect CSS imports (Astro only).

### 4. Naming Conventions
- **React Components / Astro / Types**: `PascalCase` (e.g., `DesktopShell`, `WindowState`)
- **React Hooks**: `camelCase` starting with `use` (e.g., `useTerminal`)
- **Functions / Variables**: `camelCase` (e.g., `openWindow`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `CACHE_TTL`)
- **CMS Collections**: `PascalCase` named exports (e.g., `Posts`)
- **CSS Classes**: BEM `kebab-case` (e.g., `gazette-card__title`)
- **Test Files**: Integration tests use `.int.spec.ts`, E2E use `.spec.ts`.

### 5. Error Handling
- **Network/Fetch**: Wrap in `try/catch`. Return empty fallbacks (`[]` or `null`) instead of throwing.
- **Storage**: JSON parse from `localStorage`/`sessionStorage` must use `try/catch` with empty catch.
- **Payload Hooks**: Use `req.payload.logger.warn()`, never `console.warn()`.
- **Defensive Coding**: Never assume network or external calls succeed. Always provide a graceful fallback in the UI.

## Architecture Rules

### Site Architecture
- The entire site renders inside a single React tree: `DesktopShell.tsx`. 
- Astro handles SSR and fetches CMS data to pass as a JSON string (`serverData`) to the shell.
- Cloudflare CDN caches CMS responses. Bypass with `?v=1`.
- To add a new app: create the component, add to `StaticAppId`, update `siteConfig.ts`, and handle rendering in `DesktopShell.tsx`.

### CMS Architecture
- **Local API Access**: Payload Local API bypasses access control by default. Always explicitly pass `overrideAccess: false` if user access constraints should be enforced.
- **Transactions**: Always pass `req` to nested Payload operations inside hooks to maintain transaction boundaries.
- **Hook Loops**: Guard `afterChange` hooks with `req.context` flags to prevent infinite loops.
- **Types**: Always run `pnpm generate:types` and `pnpm generate:importmap` when modifying schema or components.

## Environment Variables
- `apps/cms/.env`: `DATABASE_URL`, `PAYLOAD_SECRET`, optional `SMTP_*`. Media storage uses the Wrangler R2 binding.
- `apps/site/.env` or `.dev.vars`: `PUBLIC_CMS_URL`, optional Clerk, Last.fm, and Magpie credentials.
- Never commit `.env` files.

## Cursor Cloud specific instructions

- Node.js 22.12+ and pnpm 10.30.3 (`packageManager`). Do not use npm or yarn.
- PostgreSQL 16 is the local database. Package install does not start the cluster (`policy-rc.d` blocks it). Start it with `sudo service postgresql start` and wait until `pg_isready` succeeds. Database `templ3`, role `postgres`, password `postgres`.
- `apps/cms/.env` must set `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/templ3`, a local `PAYLOAD_SECRET`, and `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` to that same URL. Payload loads Wrangler on startup, and that variable keeps Hyperdrive on the local database.
- `apps/site/wrangler.jsonc` sets `PUBLIC_CMS_URL` to production. Astro dev prefers `apps/site/.dev.vars`. Point `PUBLIC_CMS_URL` at `http://localhost:3000` there, or the site reads the production CMS.
- `pnpm dev` serves the CMS at `http://localhost:3000` and the site at `http://localhost:4321`. The root script quotes `--filter "./apps/*"` so the shell does not turn the glob into a second script name. Open the admin on `localhost`, not `127.0.0.1`, unless `allowedDevOrigins` includes `127.0.0.1`. Next otherwise blocks `/_next` dev resources and the admin stays blank.
- CMS checks: `pnpm --dir apps/cms exec tsc --noEmit`, `pnpm --dir apps/cms lint`, `pnpm --dir apps/cms run test:int`. Site checks: `pnpm --dir apps/site typecheck` and `pnpm build:site`.
- Clerk, Last.fm, Magpie, SMTP, and remote R2 are optional. The desktop and published posts work without them. Payload logs that `sharp` is not installed; image resizing is unavailable in local dev.
