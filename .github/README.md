# CI / CD — GitHub Actions

Two workflows deploy the monorepo to Cloudflare Workers.

## Required Configuration

### Repository Secrets

| Secret | Used by | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Both | CF API token with **Workers Scripts:Edit** permission on the account |
| `DATABASE_URL_PROD` | CMS | Direct Postgres connection string (not Hyperdrive — migrations run outside Workers) |
| `PAYLOAD_SECRET` | CMS | Payload CMS encryption secret (same value as the Worker secret) |

### Repository Variables

| Variable | Used by | Description |
|---|---|---|
| `PUBLIC_CMS_URL` | Site | CMS base URL consumed at build time via `import.meta.env` (e.g. `https://cms.sigterm.vodka`) |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Site | Clerk publishable key consumed at build time |

### Cloudflare API Token — Minimum Permissions

Create a custom token at <https://dash.cloudflare.com/profile/api-tokens>:

- **Account → Workers Scripts → Edit**

The `account_id` is already set in each app's `wrangler.jsonc`.

## Hyperdrive in CI

The CMS payload config always calls wrangler's `getPlatformProxy()` in CLI mode.
Because `wrangler.jsonc` declares a Hyperdrive binding without a
`localConnectionString`, the proxy would crash. CI works around this by setting
`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` to the same direct
Postgres URL used for migrations — wrangler uses it to emulate the binding.

## Runtime Secrets

Secrets used at runtime by the Workers (Spotify credentials, Clerk secret key,
SMTP password, etc.) are managed in Cloudflare directly — either via the
**Secrets Store** or `wrangler secret put`. CI does not touch them.

## Migration Note

These workflows replace Cloudflare Workers Builds. After verifying the Actions
pipelines work correctly, disable the Workers Builds triggers for both `templ3`
and `templ3-cms` in the Cloudflare dashboard.
