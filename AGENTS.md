# Agent guide — SvelteKit & TypeScript documentation

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

## Cursor rules (project conventions)

- [`.cursor/rules/sveltekit.mdc`](.cursor/rules/sveltekit.mdc) — SvelteKit patterns (`*.svelte`, `*.svelte.ts`)
- [`.cursor/rules/typescript.mdc`](.cursor/rules/typescript.mdc) — TypeScript patterns (`src/**/*.ts`)
- [`.cursor/rules/shadcn-svelte.mdc`](.cursor/rules/shadcn-svelte.mdc) — shadcn-svelte UI patterns

---

## This app’s architecture

- **Stack**: SvelteKit 2, Svelte 5, TypeScript (strict), Tailwind 4, **shadcn-svelte**, Vercel adapter
- **Server modules**: `src/lib/server/` (auth, spotify, mixcloud, cache, jobs)
- **Shared types**: `src/lib/types/`
- **Routes**: `/`, `/dashboard`, `/portfolio`, `/auth/*`, `/api/find-mixes`
- **Client state**: `src/lib/stores/search.svelte.ts` (portfolio results, no DB in v1)

See [README.md](README.md) for env vars and deployment.
