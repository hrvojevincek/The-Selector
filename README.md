# DJ Mix Portfolio

A personal full-stack web app built with **SvelteKit**, **TypeScript**, and **Tailwind CSS**. Log in with Spotify, browse your artists, search Mixcloud for DJ mixes, and view them in a clean portfolio page.

## Features

- Spotify OAuth 2.0 (Authorization Code flow)
- Dashboard with playlists and unique artists (top, followed, optional playlist scan)
- Server-side Mixcloud search with per-artist caching
- Portfolio view with Mixcloud embeds and re-search per artist
- Architecture ready for Redis caching and Inngest background jobs

## Prerequisites

- Node.js 20+
- A [Spotify Developer](https://developer.spotify.com/dashboard) app
- pnpm 10+

## Spotify app setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. Add a **Redirect URI**:
   - Local: `http://127.0.0.1:5173/auth/callback` ([Spotify loopback docs](https://developer.spotify.com/documentation/web-api/tutorials/code-flow))
   - Production: `https://your-domain.vercel.app/auth/callback`
3. Copy the **Client ID** and **Client Secret**.

### Required scopes

The app requests:

- `playlist-read-private`
- `playlist-read-collaborative`
- `user-top-read`
- `user-follow-read`

## Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                | Required | Description                                                            |
| ----------------------- | -------- | ---------------------------------------------------------------------- |
| `SPOTIFY_CLIENT_ID`     | Yes      | Spotify app client ID                                                  |
| `SPOTIFY_CLIENT_SECRET` | Yes      | Spotify app client secret                                              |
| `SPOTIFY_REDIRECT_URI`  | Yes      | OAuth callback URL                                                     |
| `SESSION_SECRET`        | Yes      | Strong random secret for session cookies (`openssl rand -hex 32`) |
| `YOUTUBE_API_KEY`       | No       | YouTube Data API v3 mix search — [implementation guide](https://developers.google.com/youtube/v3/guides/implementation) |
| `REDIS_URL`             | No       | Reserved for Upstash/Vercel KV cache swap                              |

**Important:** Never prefix secrets with `VITE_`. All API calls run on the server.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) and click **Log in with Spotify**. (`localhost` redirects to `127.0.0.1` in dev so OAuth cookies match.)

## Deploy to Vercel

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. The project uses `@sveltejs/adapter-vercel` (configured in `vite.config.ts`).
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Set `SPOTIFY_REDIRECT_URI` to your production callback URL.
5. Add the same production callback URL in your Spotify app settings.
6. Deploy.

## Architecture

```
Browser → SvelteKit routes → Server services → Spotify / Mixcloud / YouTube APIs
```

- **Auth**: Encrypted httpOnly session cookie (`jose`), token refresh in `hooks.server.ts`
- **Spotify**: `src/lib/server/spotify/` — playlists, artists, authenticated fetch
- **Mixcloud**: `src/lib/server/mixcloud/` — search cloudcasts + user profiles ([docs](https://www.mixcloud.com/developers/))
- **YouTube**: `src/lib/server/youtube/` — long-form DJ mix search ([docs](https://developers.google.com/youtube/v3/guides/implementation))
- **Cache**: `CacheProvider` interface; in-memory default, Redis stub for later
- **Jobs**: `findMixesJob()` in `src/lib/server/jobs/find-mixes.ts` — sync in v1, Inngest-ready shape

### Future scaling

- Swap `memoryCache()` for Redis via `REDIS_URL`
- Wrap `findMixesJob()` in an Inngest function; endpoint returns job ID + poll status
- Rate limiting is per-user in-memory (resets on cold start until Redis-backed)

## Known limits (v1)

- Max **20 artists** per find-mixes request (Vercel function timeout)
- Playlist deep-scan: up to **5 playlists × 100 tracks**
- In-memory cache and rate limits reset on serverless cold starts
- No user database — search results live in client state until refresh

## Scripts

```bash
pnpm dev         # Start dev server
pnpm build       # Production build
pnpm preview     # Preview production build
pnpm check       # TypeScript + Svelte checks
pnpm lint        # Biome lint + format check
pnpm lint:fix    # Auto-fix lint/format issues
pnpm validate    # check + lint + unit tests (same as pre-push hook)
pnpm validate:full  # validate + production build
pnpm test        # Vitest unit tests
pnpm test:e2e    # Playwright (builds + preview server)
```

## AI / agent documentation

This project includes agent tooling for **SvelteKit**, **TypeScript**, **shadcn-svelte**, **Spotify Web API**, and **mix platform APIs**:

- **[AGENTS.md](AGENTS.md)** — MCP workflows, doc URLs, validation commands
- **[`.cursor/mcp.json`](.cursor/mcp.json)** — `@sveltejs/mcp` + `@upstash/context7-mcp`
- **[`.cursor/rules/`](.cursor/rules/)** — sveltekit, typescript, shadcn-svelte, spotify, mix-platforms conventions
- **[components.json](components.json)** — shadcn-svelte config (vega style, neutral)

| Topic | Best source |
| --- | --- |
| SvelteKit | Svelte MCP or https://svelte.dev/docs/llms |
| TypeScript | Context7 MCP (`/microsoft/typescript`) |
| shadcn-svelte | Context7 MCP (`/websites/shadcn-svelte`) or https://www.shadcn-svelte.com/docs |
| Spotify Web API | https://developer.spotify.com/llms.txt + [OpenAPI spec](https://developer.spotify.com/reference/web-api/open-api-schema.yaml); Context7 (`/websites/developer_spotify_web-api`) |
| Mixcloud API | https://www.mixcloud.com/developers/ |
| YouTube Data API | https://developers.google.com/youtube/v3/guides/implementation |

### UI (shadcn-svelte)

```bash
pnpm dlx shadcn-svelte add <component> -y   # add new components
pnpm check                                  # validate after UI changes
```

## Git hooks (Husky)

| Hook | Runs | Purpose |
| --- | --- | --- |
| **pre-commit** | `lint-staged` → Biome on staged files | Fast auto-fix + lint before commit |
| **pre-push** | `pnpm validate` (`check` + `lint` + `test`) | Typecheck, lint, and unit tests before sharing |

Playwright e2e runs in **GitHub Actions on pull requests** only (slower; needs a browser). Use `pnpm validate:full` locally before releases.

## CI (GitHub Actions)

On every push to `main` and on all PRs:

| Step | Command |
| --- | --- |
| Biome | `pnpm lint` |
| svelte-check | `pnpm check` |
| Vitest | `pnpm test` |
| Build | `pnpm build` |

On **pull requests only**, a second job runs Playwright against the production preview server.
