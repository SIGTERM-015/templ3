# CI / CD — GitHub Actions

Two workflows deploy the monorepo to Cloudflare Workers.

## Required Configuration

### Repository Secrets

| Secret | Used by | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Both | CF API token with **Workers Scripts:Edit** permission on the account |
| `DATABASE_URL_PROD` | CMS | Direct Postgres connection string (not Hyperdrive — migrations run outside Workers) |
| `PAYLOAD_API_KEY` | Site | Baked at build time into the site bundle for authenticated CMS reads (guestbook, media types) |
| `PAYLOAD_SECRET` | CMS | Payload CMS encryption secret (same value as the Worker secret) |

### Repository Variables

| Variable | Used by | Description |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Both | CF account ID — required so wrangler skips the `/memberships` lookup that account-owned API tokens cannot call |
| `PUBLIC_CMS_URL` | Site | CMS base URL consumed at build time via `import.meta.env` (e.g. `https://cms.sigterm.vodka`) |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Site | Clerk publishable key consumed at build time |

### Cloudflare API Token — Minimum Permissions

Create a custom token at <https://dash.cloudflare.com/profile/api-tokens>:

- **Account → Workers Scripts → Edit**

The `account_id` is already set in each app's `wrangler.jsonc`.

## Hyperdrive in CI

Wrangler evaluates the Hyperdrive binding in `wrangler.jsonc` during migrate,
build, **and** deploy. Because the binding has no `localConnectionString`,
every step that touches wrangler would crash. All three CMS steps set
`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` to the direct
Postgres URL so wrangler can emulate the binding outside Workers.

## Migration `--forceAcceptWarning`

The migrate step passes `--forceAcceptWarning` because the prod DB contains a
`dev|-1` marker row (from a past `payload dev` push-mode run). Without the flag,
`payload migrate` prompts interactively, which hangs in CI with no TTY.

## Runtime Secrets

Secrets used at runtime by the Workers (Spotify credentials, Clerk secret key,
SMTP password, etc.) are managed in Cloudflare directly — either via the
**Secrets Store** or `wrangler secret put`. CI does not touch them.

## Migration Note

These workflows replace Cloudflare Workers Builds. After verifying the Actions
pipelines work correctly, disable the Workers Builds triggers for both `templ3`
and `templ3-cms` in the Cloudflare dashboard.
