# ilhamspace

Personal site for notes, projects, and ideas — built with SvelteKit, Tiptap, and SQLite.

Based on [jarv.is](https://github.com/jakejarvis/jarv.is) by [Jake Jarvis](https://jakejarvis.com/).

## Features

- Pixel-retro public site with dark/light themes
- Notes (blog) with RSS, SEO meta, sitemap, and `robots.txt`
- Threaded comments with votes, sort (new/top), and realtime score via WebSocket
- i18n (Indonesian / English)
- Admin CMS with Tiptap rich-text editor
- SQLite storage via Drizzle ORM

## Stack

- **SvelteKit 2** + Svelte 5
- **Tailwind CSS v4**
- **Tiptap** editor (admin CMS)
- **SQLite** via Drizzle ORM + `@libsql/client`
- **WebSocket** (`ws`) for live comment vote updates
- **Email/password** admin auth (single owner)

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/notes` | Published posts |
| `/notes/[slug]` | Post detail + comments |
| `/projects` | Portfolio |
| `/feed.xml` | RSS |
| `/sitemap.xml` | Sitemap |
| `/robots.txt` | Robots |
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

Dev server binds to `0.0.0.0` and includes the comment-vote WebSocket endpoint at `/ws/comments`.

## Production

```bash
pnpm build
pnpm start
```

`pnpm start` runs the Node server with SvelteKit handler and WebSocket support (`server.ts`).

## Scripts

```bash
pnpm check      # Type check
pnpm lint       # ESLint
pnpm build      # Production build
pnpm start      # Run production server
pnpm db:generate
pnpm db:migrate
```

## Attribution

This repository is derived from **[jarv.is](https://github.com/jakejarvis/jarv.is)** by **Jake Jarvis** — a personal-site template and codebase that informed the architecture and direction of ilhamspace.

If you reuse or fork this project, please retain credit to the original project:

- Repository: [github.com/jakejarvis/jarv.is](https://github.com/jakejarvis/jarv.is)
- Author: [Jake Jarvis](https://jakejarvis.com/)

## License

This project uses a **dual license**:

| Scope | License | File |
| --- | --- | --- |
| **Site content** (posts, pages, images, and other creative work published on the site) | [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) | [LICENSE](LICENSE) |
| **Source code** (application code, scripts, and tooling in this repository) | [MIT License](https://opensource.org/licenses/MIT) | [LICENSE-CODE](LICENSE-CODE) |

- **CC BY 4.0** — you may share and adapt site content with attribution.
- **MIT** — you may use, modify, and distribute the code with the copyright and permission notice preserved.

The MIT license in [LICENSE-CODE](LICENSE-CODE) includes the original copyright notice from [jarv.is](https://github.com/jakejarvis/jarv.is).