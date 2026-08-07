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
   - Local: `http://localhost:5173/auth/callback`
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
| `SESSION_SECRET`        | Yes      | 32+ char secret for encrypted session cookies (`openssl rand -hex 32`) |
| `YOUTUBE_API_KEY`       | No       | Reserved for future YouTube mix search                                 |
| `REDIS_URL`             | No       | Reserved for Upstash/Vercel KV cache swap                              |

**Important:** Never prefix secrets with `VITE_`. All API calls run on the server.

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Log in with Spotify**.

## Deploy to Vercel

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. The project uses `@sveltejs/adapter-vercel` (configured in `vite.config.ts`).
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Set `SPOTIFY_REDIRECT_URI` to your production callback URL.
5. Add the same production callback URL in your Spotify app settings.
6. Deploy.

## Architecture

```
Browser → SvelteKit routes → Server services → Spotify / Mixcloud APIs
```

- **Auth**: Encrypted httpOnly session cookie (`jose`), token refresh in `hooks.server.ts`
- **Spotify**: `src/lib/server/spotify/` — playlists, artists, authenticated fetch
- **Mixcloud**: `src/lib/server/mixcloud/` — search cloudcasts + user profiles
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
```

## AI / agent documentation

This project includes agent tooling for **SvelteKit**, **TypeScript**, and **shadcn-svelte**:

- **[AGENTS.md](AGENTS.md)** — MCP workflows, doc URLs, validation commands
- **[`.cursor/mcp.json`](.cursor/mcp.json)** — `@sveltejs/mcp` + `@upstash/context7-mcp`
- **[`.cursor/rules/`](.cursor/rules/)** — sveltekit, typescript, shadcn-svelte conventions
- **[components.json](components.json)** — shadcn-svelte config (vega style, neutral)

| Topic | Best source |
| --- | --- |
| SvelteKit | Svelte MCP or https://svelte.dev/docs/llms |
| TypeScript | Context7 MCP (`/microsoft/typescript`) |
| shadcn-svelte | Context7 MCP (`/websites/shadcn-svelte`) or https://www.shadcn-svelte.com/docs |

### UI (shadcn-svelte)

```bash
pnpm dlx shadcn-svelte add <component> -y   # add new components
pnpm check                                  # validate after UI changes
```
