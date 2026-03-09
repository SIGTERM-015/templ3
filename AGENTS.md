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
cd apps/site && pnpm exec tsc --noEmit  # Typecheck site
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
- `apps/cms/.env`: `DATABASE_URI`, `PAYLOAD_SECRET`, R2 credentials, `SMTP_*`.
- `apps/site/.env` or `.dev.vars`: `PUBLIC_CMS_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, Spotify credentials.
- Never commit `.env` files.
