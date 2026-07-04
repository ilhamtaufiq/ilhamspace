# ilhamspace

Personal site for notes, projects, and ideas — built with SvelteKit, Tiptap, and SQLite.

## Stack

- **SvelteKit 2** + Svelte 5
- **Tailwind CSS v4**
- **Tiptap** editor (admin CMS)
- **SQLite** via Drizzle ORM + `@libsql/client`
- **Email/password** admin auth (single owner)

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/notes` | Published posts |
| `/notes/[slug]` | Post detail |
| `/projects` | Portfolio |
| `/feed.xml` | RSS |
| `/admin` | CMS (auth required) |
| `/login` | Admin login |

## Development

```bash
pnpm install
cp .env.example .env   # set SESSION_SECRET, admin credentials
pnpm db:migrate
pnpm db:seed           # optional: seed admin user
pnpm dev
```

## Scripts

```bash
pnpm check      # Type check
pnpm lint       # ESLint
pnpm build      # Production build
pnpm db:generate
pnpm db:migrate
```

## License

Site content: [CC-BY-4.0](LICENSE). Code: [MIT](LICENSE-CODE).