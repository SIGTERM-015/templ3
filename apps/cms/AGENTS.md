# AGENTS.md — apps/cms

Payload CMS 3 (`3.90.2`) + Next.js 16 (`16.3.8`) + PostgreSQL backend deployed to Cloudflare Workers via `@opennextjs/cloudflare` (`cms.sigterm.vodka`). See root `AGENTS.md` for monorepo-wide rules.

## Commands

Run from `apps/cms/` (or prefix with `pnpm --dir apps/cms`):

```bash
pnpm dev                    # next dev (localhost:3000)
pnpm devsafe                # rm -rf .next && next dev
pnpm build                  # next build
pnpm start                  # next start
pnpm lint                   # eslint .
pnpm exec tsc --noEmit      # TypeScript check (no typecheck script)
pnpm generate:types         # Regenerate src/payload-types.ts (run after schema changes)
pnpm generate:importmap     # Regenerate src/app/(payload)/admin/importMap.js (run after component changes)
pnpm payload <cmd>          # Payload CLI (e.g. migrate:create <name>, migrate)
pnpm check:migrations       # Verify migrations cover current schema (runs in CI)
pnpm migrate:prod           # Run payload migrate against DATABASE_URL_PROD
pnpm seed                   # Destructive local-only DB reset & seed (refuses non-localhost DB)
pnpm test                   # Run test:int then test:e2e
pnpm test:int               # Vitest integration tests (tests/int/*.int.spec.ts)
pnpm test:e2e               # Playwright E2E tests (tests/e2e/*.e2e.spec.ts)
pnpm preview                # Build OpenNext bundle and preview locally
pnpm cf:deploy              # pnpm build && opennextjs-cloudflare build --skipNextBuild && wrangler deploy
pnpm deploy:app             # opennextjs-cloudflare build --skipNextBuild && wrangler deploy
pnpm deploy:preview         # opennextjs-cloudflare build --skipNextBuild && wrangler versions upload
pnpm preview:deploy         # Alias for deploy:preview
```

Single test file:

```bash
pnpm --dir apps/cms test:int -- tests/int/access.int.spec.ts
pnpm --dir apps/cms test:int -- -t "test name" tests/int/api.int.spec.ts
pnpm --dir apps/cms test:e2e -- tests/e2e/admin.e2e.spec.ts
```

## Project Structure

```
src/
├── access/index.ts         # Shared access helpers (isEditor, isAuthenticated, publishedOrAuthenticated, editorWrites)
├── app/
│   ├── (frontend)/         # Minimal landing page linking to /admin and sigterm.vodka
│   └── (payload)/          # Payload admin UI, REST/GraphQL routes, custom.scss, generated importMap.js
├── blocks/embeds.ts        # Lexical blocks (youtube, spotify, twitter, github-gist, codepen, video, callout, divider, bookmark)
├── collections/            # 14 Payload collections (see Schema below)
├── components/
│   ├── PostTitleField/     # Auto-growing headline field for Posts
│   └── MediaLookupField/   # External media search UI field for FavouriteMedia
├── endpoints/
│   └── media-lookup.ts     # GET /api/media-lookup
├── fields/
│   ├── slug.ts             # Reusable slugField() with beforeValidate slugification
│   └── url.ts              # safeUrl() scheme validator (blocks javascript:, data:, etc.)
├── globals/SiteIdentity.ts # SiteIdentity global
├── graphics/               # Custom admin Logo and Icon
├── migrations/             # Postgres migrations + index.ts
├── services/media-lookup/  # IGDB, TMDB, AniList, Open Library, MusicBrainz clients
├── payload.config.ts       # Main Payload config
├── payload-types.ts        # Auto-generated — do not edit
├── payload-generated-schema.ts # Auto-generated — do not edit
└── seed.ts                 # Local dev reset & seed script (uses src/seed-assets/)
```

## Critical Payload Rules

1. **Local API access control**: Payload Local API bypasses access control by default (`overrideAccess: true`). Whenever passing `user` to enforce permissions, **always** pass `overrideAccess: false`.
2. **Transaction safety in hooks**: Always pass `req` to any nested `req.payload.*` call inside hooks so it participates in the same database transaction.
3. **Prevent infinite hook loops**: Guard self-updating `afterChange` hooks with a `context` / `req.context` flag and pass that flag in the nested call.
4. **Access return types**: Collection-level access returns `boolean` or a `Where` query constraint. Field-level access returns `boolean` only. Always ensure roles exist when modifying access rules.
5. **Logging in hooks/endpoints**: Use `req.payload.logger.warn()` / `.error()`, never `console.*`.
6. **Codegen & migrations**:
   - After schema changes: run `pnpm generate:types` and `pnpm payload migrate:create <name>`, then verify with `pnpm check:migrations`.
   - After adding/moving admin components: run `pnpm generate:importmap`.
   - After edits: run `pnpm exec tsc --noEmit` and `pnpm lint`.

## Project Configuration & Architecture

### Database, Storage, Email & Plugins (`src/payload.config.ts`)
- **Database**: `@payloadcms/db-postgres` (`postgresAdapter`). `push: true` outside production; production uses migrations and Cloudflare `HYPERDRIVE` binding with `pool.maxUses: 1` (Workers cannot reuse sockets across requests; Hyperdrive holds the connection pool). Local/CLI runs obtain bindings via Wrangler's `getPlatformProxy`.
- **Storage**: `@payloadcms/storage-r2` (`r2Storage`) bound to Worker bucket `R2` (`templ3-media`, prefix `templ3/media`) for `media`. Upload limit is 10 MB.
- **2FA plugin**: `payload-totp` on `users` with `disableAccessWrapper: true` — required so the TOTP wrapper does not block API-key auth resolution and cause 403s on other collections.
- **Email**: `@payloadcms/email-nodemailer` enabled when `SMTP_HOST` is set.
- **Editor**: `lexicalEditor` with headings `h2`–`h4`, `CodeBlock`, and blocks from `src/blocks/embeds.ts`.
- **Next.js & Cloudflare (`next.config.mjs`, `open-next.config.ts`)**: `output: 'standalone'`, `experimental.cpus: 1` (prevents Miniflare SQLite `SQLITE_BUSY` races during build), `images.unoptimized: true`, security headers on all routes, sandboxed CSP on `/api/media/file/:path*`, and `workerd` esbuild condition for `pg-cloudflare`.

### Access Control (`src/access/index.ts`)
- `users.role` values: `'admin' | 'editor' | 'api'` (`auth.useAPIKey: true`).
- `isEditor`: `admin` or `editor`. `editorWrites` applies `isEditor` to `create`, `update`, `delete`.
- `isAuthenticated`: any logged-in user or valid API key (`api` role is read-only except uploading guestbook media/entries).
- `publishedOrAuthenticated`: authenticated sees all docs; unauthenticated sees `_status === 'published'`.

### Collections & Globals
- **`users`**: Auth + API keys. Admins read/write all; non-admins read/update self only; only admins can change `role`.
- **`media`**: Image uploads (`image/*`, sizes `card` 720w and `hero` 1600w). Public `read`; `isAuthenticated` `create` (site API key uploads guestbook drawings); `isEditor` `update`/`delete`.
- **`posts`**: Drafts + autosave (1500ms), `slugField`, Ghost-style layout (`PostTitleField` + sidebar metadata/SEO). `publishedOrAuthenticated` read, `editorWrites`.
- **`projects`**: Drafts, `slugField`, `projectStatus` rel, `stack`, `safeUrl`-validated URLs. `publishedOrAuthenticated` read, `editorWrites`.
- **`notes`**: Markdown desktop files; drafts, `slugField`, `filename`, `order`. `publishedOrAuthenticated` read, `editorWrites`.
- **`favourite-media`**: Drafts, `slugField`, `MediaLookupField` UI field, rels to `media-types`, `media-statuses`, `posts`. `publishedOrAuthenticated` read, `editorWrites`. (Note: the public site Media app reads from Magpie, not this collection.)
- **`guestbook-entries`**: Visitor drawings + metadata. `admin`/`editor` read all; `api` role reads only `status === 'approved'`; unauthenticated denied. `isAuthenticated` `create`; `isEditor` `update`/`delete`. `beforeChange` hook forces `status = 'pending'` on create for non-editors; field-level access restricts `status` create/update to `admin`/`editor`.
- **`links`**, **`web-apps`**, **`tags`**, **`categories`**: `isAuthenticated` read, `editorWrites`.
- **Config collections (`media-types`, `media-statuses`, `project-statuses`)**: `isAuthenticated` read, `editorWrites`.
- **Global `site-identity`** (`src/globals/SiteIdentity.ts`): Site metadata, operator profile, README lines, terminal config. `isAuthenticated` read, `isEditor` update.

### Custom Endpoint & Hooks
- **`GET /api/media-lookup`** (`src/endpoints/media-lookup.ts`): Authenticated endpoint (`?source=...&q=...`) querying `src/services/media-lookup/` (`igdb`, `tmdb`, `anilist-anime`, `anilist-manga`, `openlibrary`, `musicbrainz`).
- **Hooks in use**: `slugField` (`src/fields/slug.ts`, `beforeValidate`) and `GuestbookEntries` (`beforeChange` moderation status enforcement).

## Environment Variables & Bindings

- **Required**: `PAYLOAD_SECRET`, `DATABASE_URL` (local/dev/test/CLI; production uses the `HYPERDRIVE` binding).
- **Optional / CI / Prod**: `NEXT_PUBLIC_SERVER_URL` (set in `wrangler.jsonc`), `DATABASE_URL_PROD` (`migrate:prod`, CI), `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` (CI/local Hyperdrive), `CLOUDFLARE_ENV`, `PAYLOAD_LOG_LEVEL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` (IGDB lookup), `TMDB_API_KEY` (TMDB lookup).
- **Worker bindings (`wrangler.jsonc`)**: `R2` (`templ3-media`), `HYPERDRIVE`, `ASSETS`.

## Testing

- Integration tests (`tests/int/*.int.spec.ts`) run in Vitest with `environment: 'node'` and `fileParallelism: false` (all files share one Postgres database).
- E2E tests (`tests/e2e/*.e2e.spec.ts`) run in Playwright against `http://localhost:3000`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
