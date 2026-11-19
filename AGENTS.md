# AGENTS.md — Templ3 Monorepo

Monorepo-wide rules for `templ3`. For app-specific architecture, commands, and environment variables, read:

- `apps/site/AGENTS.md` — Astro 7 + React 19 desktop OS frontend (Cloudflare Workers)
- `apps/cms/AGENTS.md` — Payload CMS 3 + Next.js 16 + PostgreSQL backend (Cloudflare Workers via OpenNext)

`CLAUDE.md` files are one-line pointers to the sibling `AGENTS.md`; edit `AGENTS.md`, never `CLAUDE.md`.

## Workspace

- Package manager: `pnpm@10.30.3` only (`packageManager` in root `package.json`). Never use `npm` or `yarn`.
- Runtime: Node.js `>=22.12.0` (CI uses Node 22).
- Workspace directories (`pnpm-workspace.yaml`): `apps/*` (`apps/site`, `apps/cms`) and `packages/*` (currently empty).
- Dependency patches: `patches/` holds pnpm `patchedDependencies`. Currently `patches/workers-og@0.0.27.patch` patches `workers-og@0.0.27`; see `patches/README.md` for why it exists and re-evaluate whenever bumping `workers-og`.

## Root Commands

Run from the repository root (`package.json`):

```bash
pnpm dev                 # Run site and cms dev servers in parallel
pnpm dev:site            # Start apps/site dev server
pnpm dev:cms             # Start apps/cms dev server
pnpm build:site          # Build apps/site
pnpm build:cms           # Build apps/cms
pnpm generate:cms-types  # Regenerate apps/cms/src/payload-types.ts
pnpm deploy:site         # Deploy apps/site via wrangler (run build:site first)
pnpm deploy:cms          # Build and deploy apps/cms via OpenNext + wrangler
pnpm preview:cms         # Build OpenNext bundle and upload a preview version for apps/cms
pnpm cf:build:site       # Alias for pnpm build:site
pnpm cf:upload:site      # Upload a Cloudflare Workers preview version for apps/site
pnpm cf:build:cms        # Build Next.js + OpenNext bundle for apps/cms
pnpm cf:deploy:cms       # Run wrangler deploy in apps/cms
pnpm cf:upload:cms       # Upload a Cloudflare Workers preview version for apps/cms
```

For app-specific validation, tests, typegen, and migrations, see `apps/site/AGENTS.md` and `apps/cms/AGENTS.md`.

## Shared Conventions

### TypeScript
- Strict mode is enabled in both apps. Avoid `any`; use `unknown` with narrowing.
- Prefer `type` over `interface` for local types and React props.
- Use `import type { ... }` for type-only imports.
- Never manually edit auto-generated files (`apps/cms/src/payload-types.ts`, `apps/cms/src/payload-generated-schema.ts`, `apps/cms/src/app/(payload)/admin/importMap.js`, `apps/cms/cloudflare-env.d.ts`, `apps/site/worker-configuration.d.ts`).

### Formatting
- Single quotes (`'`), no semicolons, trailing commas (`all`), 100-char print width.
- Enforced via `.prettierrc.json` and ESLint in `apps/cms`; match surrounding style in `apps/site`.

### Import Order
1. External packages (React hooks first, then other packages).
2. Type-only imports (`import type { ... }`).
3. Internal imports (`@/...` in `apps/cms`, relative `../../` in `apps/site`).
4. Relative sibling/child imports.
5. Side-effect CSS imports last.

### Naming
- React / Astro components, types, CMS collection & global exports: `PascalCase` (`DesktopShell`, `WindowState`, `Posts`).
- React hooks: `camelCase` with `use` prefix (`useTerminal`, `useCmsResource`).
- Functions and variables: `camelCase`.
- Module-level constants: `SCREAMING_SNAKE_CASE` (`TTL`, `FULL_BLEED_APPS`).
- CSS classes: BEM `kebab-case` (`gazette-card__title`).

### Secrets & Environment
- Never commit `.env` or `.dev.vars` files.
- See `apps/site/AGENTS.md` and `apps/cms/AGENTS.md` for each app's required variables and Cloudflare bindings.

## Git & CI Workflows

Work on feature/chore branches and merge via PR; do not push directly to `main`.

- **`.github/workflows/deploy-site.yml`** — Triggers on push to **any branch** touching `apps/site/**`, `package.json`, `pnpm-lock.yaml`, or `patches/**` (and `workflow_dispatch`).
  - Runs `pnpm --dir apps/site run typecheck`, `pnpm build:site`, and `pnpm --dir apps/site run check:client-bundle`.
  - On `main`: deploys production (`wrangler deploy`).
  - On non-`main` branches: uploads a preview version (`wrangler versions upload --preview-alias`) and posts/updates the preview URL comment on any open PR. Superseded runs on non-`main` branches are cancelled.
- **`.github/workflows/deploy-cms.yml`** — Triggers on push to **`main` only** touching `apps/cms/**`, `package.json`, `pnpm-lock.yaml`, or `patches/**` (and `workflow_dispatch`).
  - Concurrency has `cancel-in-progress: false` so database migrations are never interrupted.
  - `test` job (Postgres 17 service): runs `tsc --noEmit`, `lint`, `check:migrations`, and `test:int`.
  - `deploy` job (after `test`): runs `payload migrate --forceAcceptWarning` against `DATABASE_URL_PROD`, builds with `pnpm cf:build:cms`, and deploys with `wrangler deploy`.
