# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Build & Development Commands

```bash
pnpm dev            # Development server (binds to 0.0.0.0)
pnpm build          # Production build
pnpm check          # Type checking (alias: check-types)
pnpm lint           # Lint entire codebase
pnpm lint path/to/file.svelte
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Apply migrations
```

No test suite exists. Validate changes via `pnpm check` and `pnpm lint`.

## Code Style

### Formatting

- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Double quotes
- **Semicolons:** Required
- **Line width:** ~80 characters where practical

### Import Organization

```typescript
import { onMount } from "svelte";

import { eq, desc } from "drizzle-orm";

import { db } from "$lib/db";
import Button from "$lib/components/ui/button.svelte";
```

- Always use `$lib/` path aliases (never deep relative `../../`)
- Use `type` keyword for type-only imports

### TypeScript

- Strict mode enabled
- Explicit return types for API routes and server loaders
- Zod for runtime validation
- Avoid `any`

### Naming Conventions

| Element             | Convention               | Example                    |
| ------------------- | ------------------------ | -------------------------- |
| Files               | kebab-case               | `post-form.svelte`         |
| Components          | PascalCase in imports    | `PostForm`                 |
| Functions/Variables | camelCase                | `getPublishedPosts`        |
| Types/Interfaces    | PascalCase               | `NoteListItem`             |

### Svelte 5 Patterns

- Use runes: `$state`, `$derived`, `$props`
- Prefer snippets for component children
- Server data via `+page.server.ts` / `+layout.server.ts`

### Database (Drizzle ORM)

- Schema in `src/lib/db/schema.ts`
- SQLite file at `DATABASE_PATH` (default `./data/ilhamspace.db`)

## Project Structure

```
src/
├── routes/
│   ├── (site)/          # Public: home, notes, projects, login
│   ├── admin/           # CMS (separate layout)
│   ├── api/             # API routes
│   └── feed.xml/        # RSS
├── lib/
│   ├── components/      # UI, layout, editor, notes
│   ├── db/              # Drizzle client + schema
│   ├── server/          # Server actions, posts, projects
│   ├── editor/          # Tiptap extensions
│   └── auth/            # Session auth
scripts/                 # db seed, password hash
static/                  # favicon, static assets
```

## Key Dependencies

- **SvelteKit 2** + Svelte 5
- **Tailwind CSS v4**
- **Drizzle ORM** + `@libsql/client` (SQLite)
- **Tiptap** for rich text (admin only)
- **Zod** for validation

## Design

See `DESIGN.md` for pixel retro theme tokens, contrast rules, and layout patterns.