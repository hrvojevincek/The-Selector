# Agent guide — SvelteKit, TypeScript & Spotify documentation

This project uses official/community AI tooling for accurate docs. Reload MCP in Cursor after config changes.

## Svelte MCP (SvelteKit + Svelte 5)

Configured in [`.cursor/mcp.json`](.cursor/mcp.json):

```json
"svelte": {
  "command": "npx",
  "args": ["-y", "@sveltejs/mcp"]
}
```

### Tools — use in this order

1. **`list-sections`** — discover doc sections (run first on Svelte/SvelteKit questions)
2. **`get-documentation`** — fetch full content for relevant sections
3. **`svelte-autofixer`** — validate `.svelte` / `.svelte.ts` before finishing edits; repeat until clean
4. **`playground-link`** — only after user confirms; never for code already in this repo

### Svelte llms.txt (fallback)

| File | Use when |
| --- | --- |
| [SvelteKit](https://svelte.dev/docs/kit/llms.txt) | Routing, loads, hooks, adapters, endpoints |
| [Svelte](https://svelte.dev/docs/svelte/llms.txt) | Runes, components, reactivity |
| [Medium](https://svelte.dev/llms-medium.txt) | General work, abridged |
| [Full](https://svelte.dev/llms-full.txt) | Complete reference |

Remote MCP: `https://mcp.svelte.dev/mcp`

---

## TypeScript documentation

Microsoft does **not** publish an official `llms.txt` at typescriptlang.org. Use Context7 MCP + the handbook.

### Context7 MCP (recommended for TypeScript)

Also in [`.cursor/mcp.json`](.cursor/mcp.json):

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp"]
}
```

### Tools — typical workflow

1. **`resolve-library-id`** — query: `TypeScript` or a specific topic (generics, discriminated unions, etc.)
2. **`get-library-docs`** — library ID: **`/microsoft/typescript`**
   - Optional `topic`: e.g. `modules`, `tsconfig`, `generics`, `type narrowing`
   - Use when writing types, fixing strict errors, or configuring compiler options

Setup wizard (optional): `npx ctx7 setup --cursor`

### Official human docs

| Resource | URL |
| --- | --- |
| Handbook intro | https://www.typescriptlang.org/docs/handbook/intro |
| Everyday types | https://www.typescriptlang.org/docs/handbook/2/everyday-types.html |
| Modules | https://www.typescriptlang.org/docs/handbook/modules/introduction.html |
| TSConfig reference | https://www.typescriptlang.org/tsconfig/ |
| SvelteKit + TS | https://svelte.dev/docs/kit/types |

### Context7 llms bundle (bulk fallback)

https://context7.com/microsoft/TypeScript/llms.txt

### Validate TypeScript in this repo

```bash
pnpm check
```

Runs `svelte-check` with strict `tsconfig.json`. Use after non-trivial `.ts` changes.

---

## shadcn-svelte (UI components)

This project's UI uses **shadcn-svelte** (vega style, neutral base, dark mode). Components live in `src/lib/components/ui/` and are fully owned by the repo.

### Documentation sources

1. **Context7 MCP** — `get-library-docs` with **`/websites/shadcn-svelte`**
2. **Official docs** — https://www.shadcn-svelte.com/docs
3. **Official llms.txt** — https://www.shadcn-svelte.com/llms.txt
4. **Context7 llms bundle** — https://context7.com/websites/shadcn-svelte/llms.txt

### CLI

```bash
# Init (already done — see components.json)
pnpm dlx shadcn-svelte init --preset bIkeypM   # vega + neutral example

# Add components
pnpm dlx shadcn-svelte add button card dialog -y
```

### Conventions

- Import: `import { Button } from '$lib/components/ui/button/index.js'`
- Styling: use design tokens (`bg-background`, `text-primary`, `text-muted-foreground`) — not custom CSS classes
- Icons: `@lucide/svelte/icons/*`
- Theme: `.dark` on `<html>`; Spotify green via `--primary` in [src/routes/layout.css](src/routes/layout.css)

See [`.cursor/rules/shadcn-svelte.mdc`](.cursor/rules/shadcn-svelte.mdc).

---

## Spotify Web API

This app uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api) for OAuth and user library data. All Spotify calls run server-side in `src/lib/server/spotify/` and `src/lib/server/auth/`.

### Official machine-readable docs (prefer in order)

1. **Official llms.txt** — https://developer.spotify.com/llms.txt (entry point for AI tools)
2. **OpenAPI 3.0 spec** — https://developer.spotify.com/reference/web-api/open-api-schema.yaml (endpoints, schemas, auth — do not guess field names)
3. **Building with AI** — https://developer.spotify.com/documentation/web-api/tutorials/building-with-ai (OAuth, scopes, rate limits, review checklist)

### Context7 MCP (optional fallback)

Also in [`.cursor/mcp.json`](.cursor/mcp.json). Use when you need fetched doc snippets:

1. **`resolve-library-id`** — query: `Spotify Web API`
2. **`get-library-docs`** — library ID: **`/websites/developer_spotify_web-api`**
   - Alternate: **`/websites/developer_spotify`** (broader portal docs)
   - Optional `topic`: e.g. `authorization`, `scopes`, `playlists`, `artists`

Context7 llms bundle: https://context7.com/websites/developer_spotify_web-api/llms.txt

### Official human docs (this app)

| Topic | URL |
| --- | --- |
| Developer portal | https://developer.spotify.com/ |
| Dashboard (app credentials) | https://developer.spotify.com/dashboard |
| Authorization Code flow | https://developer.spotify.com/documentation/web-api/tutorials/code-flow |
| Refreshing tokens | https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens |
| Scopes | https://developer.spotify.com/documentation/web-api/concepts/scopes |
| Redirect URIs | https://developer.spotify.com/documentation/web-api/concepts/redirect_uri |
| Rate limits | https://developer.spotify.com/documentation/web-api/concepts/rate-limits |
| Developer Terms | https://developer.spotify.com/terms |

### This repo’s Spotify usage

- **OAuth**: Authorization Code flow (secure backend) in `src/lib/server/auth/spotify-oauth.ts` — not PKCE (backend holds client secret)
- **Scopes**: `playlist-read-private`, `playlist-read-collaborative`, `user-top-read`, `user-follow-read` (see README)
- **Session**: encrypted httpOnly cookie; token refresh in `ensureFreshSession()` + `hooks.server.ts`
- **Endpoints used**: `/me`, `/me/playlists`, `/me/top/artists`, `/me/following?type=artist`, `/playlists/{id}/tracks`
- **Env vars**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` — never `VITE_*`

See [`.cursor/rules/spotify.mdc`](.cursor/rules/spotify.mdc).

---

## Mix platform APIs (Mixcloud, YouTube)

This app searches for DJ mixes server-side in `src/lib/server/mixcloud/` and `src/lib/server/youtube/`, orchestrated by `findMixesJob()` in `src/lib/server/jobs/find-mixes.ts`.

> **SoundCloud** is not integrated — API access requires an [Artist Pro subscription](https://developers.soundcloud.com/docs/api). Docs kept for future reference: https://developers.soundcloud.com/docs/api

### Official human docs (prefer in order)

| Platform | Primary guide | Notes |
| --- | --- | --- |
| **Mixcloud** | https://www.mixcloud.com/developers/ | Public read API — no key for search; OAuth only for writes |
| **YouTube** | https://developers.google.com/youtube/v3/guides/implementation | Data API v3 — search + videos endpoints; see [Search requests](https://developers.google.com/youtube/v3/guides/implementation/search) |

Do not guess endpoint paths or JSON field names — use the official docs above.

### Context7 MCP (optional fallback)

Use Context7 when you need fetched doc snippets:

1. **`resolve-library-id`** — query: `YouTube Data API`, etc.
2. **`get-library-docs`** — use the resolved library ID; optional `topic` (e.g. `search`, `authentication`)

There is no single official `llms.txt` for these platforms — prefer the human docs linked above.

### This repo’s mix-platform usage

- **Job**: `findMixesJob()` — parallel Mixcloud + YouTube search per artist, merge, rank, cache 24h
- **Mixcloud**: `src/lib/server/mixcloud/client.ts` — `/search/?type=cloudcast|user`, user profile cloudcasts; public `https://api.mixcloud.com/`
- **YouTube**: `src/lib/server/youtube/client.ts` — `search.list` + `videos.list`; requires `YOUTUBE_API_KEY`
- **Shared**: `src/lib/server/mixes/rank.ts`, `src/lib/types/mix.ts` — unified `MixSearchResult` with `platform`
- **Embeds**: Mixcloud widget, YouTube iframe — no raw audio streams (Mixcloud policy)
- **Env vars**: `YOUTUBE_API_KEY` — optional; YouTube skipped when unset. Never `VITE_*`

See [`.cursor/rules/mix-platforms.mdc`](.cursor/rules/mix-platforms.mdc).

---

## Cursor rules (project conventions)

- [`.cursor/rules/sveltekit.mdc`](.cursor/rules/sveltekit.mdc) — SvelteKit patterns (`*.svelte`, `*.svelte.ts`)
- [`.cursor/rules/typescript.mdc`](.cursor/rules/typescript.mdc) — TypeScript patterns (`src/**/*.ts`)
- [`.cursor/rules/shadcn-svelte.mdc`](.cursor/rules/shadcn-svelte.mdc) — shadcn-svelte UI patterns
- [`.cursor/rules/spotify.mdc`](.cursor/rules/spotify.mdc) — Spotify Web API & OAuth patterns
- [`.cursor/rules/mix-platforms.mdc`](.cursor/rules/mix-platforms.mdc) — Mixcloud + YouTube mix search

---

## This app’s architecture

- **Stack**: SvelteKit 2, Svelte 5, TypeScript (strict), Tailwind 4, **shadcn-svelte**, Vercel adapter
- **Server modules**: `src/lib/server/` (auth, spotify, mixcloud, youtube, cache, jobs)
- **Shared types**: `src/lib/types/`
- **Routes**: `/`, `/dashboard`, `/portfolio`, `/auth/*`, `/api/find-mixes`
- **Client state**: `src/lib/stores/search.svelte.ts` (portfolio results, no DB in v1)

See [README.md](README.md) for env vars and deployment.
