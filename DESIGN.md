# Design System: ilhamspace

**Theme:** ilhamspace · Pixel · Retro · 16-bit nostalgia
**Stack (target):** SvelteKit · Tailwind CSS v4 · Tiptap · SQLite
**Deploy:** Coolify · Docker

---

## 1. Visual Theme & Atmosphere

ilhamspace feels like a **personal homepage rendered on a CRT in 1994** — but readable on a modern phone. The aesthetic is **pixel retro**: chunky borders, stepped motion, limited color palette, and bitmap typography. It is not glossy, not glassmorphic, and not editorial-minimal.

The mood is **playful, nostalgic, and deliberate**. Every UI element should look like it was placed on a grid. Corners are **sharp or pixel-stepped** — never soft `rounded-2xl` blobs. Whitespace still matters: the layout keeps a single column (`max-w-[720px]`) so long-form notes remain comfortable to read.

Dark mode mimics a **phosphor terminal** (amber or green-on-black option via tokens). Light mode mimics **SNES menu beige** with saturated accent chips. Motion uses **stepped easing** (`steps(4)`, `steps(8)`) for hovers and page changes — no floaty fades unless reduced-motion requires instant cuts.

Optional atmosphere layers (use sparingly):

- Subtle **dot-grid** or **scanline** overlay on `body` (`pointer-events-none`, low opacity)
- `image-rendering: pixelated` on avatars, project icons, and decorative sprites
- **Chunky drop shadows** as stacked 2px offsets (fake pixel depth), not blurred shadows

### Design principles (preserve during refactor)

| Principle | Implementation |
| --- | --- |
| Pixel grid | Align to 4px baseline; sizes in multiples of 4 |
| Limited palette | 5–7 core colors + neutrals; no gradients on UI chrome |
| Sharp geometry | `rounded-none` default; `rounded-sm` (2px) max for inner inputs |
| Readable retro | Body text uses taller pixel-friendly font (VT323/Silkscreen), not 8px micro |
| Stepped motion | `transition` with `steps()`; blink cursor on focus fields |
| Accessible contrast | WCAG AA minimum even on neon accents |

---

## 2. Color Palette & Roles

Tokens use **hex** (retro tools think in hex, not OKLCH). Map to semantic CSS variables in `src/app.css`.

### Light mode — "SNES Cartridge Menu" (`:root`)

| Descriptive name | Hex | Role |
| --- | --- | --- |
| Cartridge Cream | `#E8E0D0` | Page background (`--background`) |
| Ink Purple | `#2D1B4E` | Primary text (`--foreground`) |
| Deep Plum | `#1A0F2E` | Headings, primary buttons (`--primary`) |
| Menu Highlight | `#FFD93D` | Hover fills, active nav (`--accent`) |
| Accent Cyan | `#3DD9EB` | Links, focus rings (`--ring`, link color) |
| Accent Magenta | `#FF6B9D` | Destructive, alerts (`--destructive`) |
| Panel Gray | `#C4BAA8` | Cards, inputs, code surface (`--muted`, `--secondary`) |
| Dust Label | `#6B5F7A` | Captions, footer, metadata (`--muted-foreground`) |
| Pixel Border | `#2D1B4E` | All borders (`--border`, `--input`) — 2px solid |
| CRT Selection | `#3DD9EB` on `#2D1B4E` | Text selection (`--selection`) |

### Dark mode — "Phosphor Terminal" (`.dark`)

| Descriptive name | Hex | Role |
| --- | --- | --- |
| Tube Black | `#0D0D0D` | Page background |
| Phosphor Amber | `#FFB000` | Primary text (`--foreground`) |
| Dim Amber | `#CC8C00` | Muted text (`--muted-foreground`) |
| Terminal Green | `#39FF14` | Links, accents, focus (`--ring`, `--accent`) |
| Panel Charcoal | `#1A1A1A` | Cards, inputs (`--card`, `--muted`) |
| Hot Magenta | `#FF6B9D` | Destructive |
| Scanline Border | `#39FF14` at 40% opacity | Borders |
| Selection | `#39FF14` on `#0D0D0D` | Text selection |

### Semantic usage

| Token | When |
| --- | --- |
| `--primary` | Filled buttons, prose headings, section labels on page background |
| `--accent` | **Fill only** — active nav background, hover fills, logo badge (always pair with `--accent-foreground` for text) |
| `--ring` | Links, focus rings, page-title `>` prefix, inline accents on background |
| `--destructive` | Delete comment, form errors |
| `--code` | Code blocks — dark panel with bright syntax |

### Contrast rules (required)

Retro neon colors fail WCAG when used as **text on `--background`**. Follow these pairings:

| Context | Light mode | Dark mode | Do **not** use |
| --- | --- | --- | --- |
| Page title `>` prefix | `before:text-[var(--ring)]` (cyan on cream) | same token (green on black) | `before:text-accent` — yellow on cream is invisible |
| Section / year headings | `text-primary` (plum on cream) | `text-primary` (amber on black) | `text-accent` on page background |
| Active nav tab | `bg-accent` + `color: accent-foreground` | green fill + black text | ghost `bg-transparent` alone — utility overrides component layer |
| Link default | `text-[var(--ring)]` | `text-[var(--ring)]` | raw accent hex for body links |
| Link hover | `text-accent` only on hover | acceptable as brief state change | accent as default link color on cream |

**Active nav implementation** — ghost buttons ship `bg-transparent` (Tailwind utility layer), which overrides component-class backgrounds. `.pixel-nav-active` must set fill and text explicitly:

```css
.pixel-nav-active {
  background-color: var(--accent) !important;
  color: var(--accent-foreground) !important;
  /* inset shadow uses --foreground, not --background, for visible depth in both modes */
}
.pixel-nav-active:hover {
  background-color: var(--accent) !important;
  color: var(--accent-foreground) !important;
}
```

**Regression check:** toggle light/dark on `/`, `/notes`, `/admin` — active nav label and `> notes` page title must remain readable.

### Scoped exceptions

- **GitHub repo links** on `/projects`: keep GitHub blue `#0969DA` / `#76AFFA` inside link text only
- **Contribution heatmap**: retro green scale `#2D4A22` → `#39FF14` (dark), `#E8E0D0` → `#2D6A4F` (light)

---

## 3. Typography Rules

### Font families

| Role | Family | CSS variable | Size notes |
| --- | --- | --- | --- |
| Display / UI chrome | **Press Start 2P** | `--font-pixel` | 10–14px max; uppercase labels |
| Body / prose | **VT323** | `--font-retro` | 18–22px for readability |
| Code | **JetBrains Mono** | `--font-mono` | 14–16px; ligatures off |

Load via `@fontsource/press-start-2p`, `@fontsource/vt323`, `@fontsource/jetbrains-mono` (or self-host woff2 in `static/fonts/`).

Global rules:

- `body`: `font-retro antialiased` — VT323 at `text-lg` (18px) base
- Headings & nav labels: `font-pixel uppercase tracking-wide`
- **Disable** negative letter-spacing from the old design — pixel fonts need default or `tracking-normal`
- `line-height`: 1.4 body, 1.6 prose paragraphs

### Size & weight hierarchy

| Element | Classes | Character |
| --- | --- | --- |
| Site name (header) | `font-pixel text-[10px] sm:text-xs uppercase` | Chunky, always visible |
| Page title | `font-pixel text-sm uppercase`; link `text-foreground`; prefix `before:text-[var(--ring)]` | Replaces `./` breadcrumb — never `before:text-accent` |
| Post title (detail) | `font-retro text-2xl font-medium` | Long titles — readability over pixel chrome |
| Post title (list) | `font-retro text-lg` | Linked list entries |
| Year divider (notes) | `font-pixel text-xs uppercase text-primary` | Section breaks on `/notes` |
| Section heading | `font-pixel text-xs uppercase text-primary` | Homepage blocks, admin status lines |
| Body / prose | `font-retro text-lg leading-relaxed` | Comfortable reading |
| Metadata row | `font-retro text-base text-muted-foreground` | Date, tags, views |
| Footer | `font-pixel text-[8px] leading-loose text-muted-foreground` | Legal line |
| Button label | `font-pixel text-[10px] uppercase` | All buttons |

### Prose (`.prose-retro`)

Custom typography layer (not default `prose-neutral`):

- Headings: `font-pixel uppercase text-primary`
- Links: `text-[var(--ring)] underline decoration-2 underline-offset-4 hover:text-accent`
- Inline code: `font-mono bg-muted px-1 py-0.5 border-2 border-border text-sm`
- Blockquote: `border-l-4 border-accent pl-4 italic font-retro`
- `hr`: 4px solid `border-border`, no gradient
- Images: `border-4 border-border image-rendering-pixelated` optional

---

## 4. Component Stylings

### Pixel border recipe (reusable)

```css
.pixel-border {
  border: 2px solid var(--border);
  box-shadow:
    2px 2px 0 0 var(--border),
    inset -1px -1px 0 0 color-mix(in srgb, var(--border) 30%, transparent);
}
.pixel-border:active {
  box-shadow: none;
  transform: translate(2px, 2px);
}
```

### Buttons

- **Shape:** `rounded-none`, `pixel-border`, min-h-10 px-4
- **Default:** `bg-primary text-background font-pixel uppercase text-[10px]`
- **Hover:** `bg-accent text-accent-foreground` with `steps(2)` color jump (no smooth blend)
- **Ghost (nav):** Transparent default; active → `.pixel-nav-active` (see §2 contrast rules)
- **Destructive:** `bg-destructive text-background`
- **Focus:** 2px offset outline in `--ring`, no blurred ring
- **Press:** `translate(2px, 2px)` + shadow collapse (tactile game UI)

### Cards / containers

- **Repo cards (`/projects`):** `pixel-border bg-card p-4` — no `rounded-2xl`, no soft shadow
- **Comment box:** `pixel-border bg-muted p-4`
- **Code blocks:** `pixel-border bg-code font-mono text-sm` — Shiki theme `nord` or custom retro palette
- **Modals / popovers:** `pixel-border bg-popover` centered with backdrop `bg-foreground/20`

### Inputs / forms

- **Input & textarea:** `rounded-none pixel-border bg-background font-retro text-lg h-10 px-3`
- **Focus:** border color `--ring`, optional blinking caret animation
- **Placeholder:** `text-muted-foreground font-retro`
- **Login (admin):** centered card `max-w-sm pixel-border p-6` — email + password only

### Avatars & icons

- **Avatar:** `size-8 rounded-none pixel-border image-rendering-pixelated` — square pixels, not circle
- **Project icons:** `size-8 rounded-none pixel-border`
- **Icons:** Tabler icons at `stroke-2`, `size-4` — pair with `font-pixel` labels

### Tiptap editor chrome

- Toolbar: horizontal `pixel-border` strip, icon buttons `size-8 rounded-none`
- Bubble menu: `pixel-border bg-popover font-pixel text-[8px]`
- Editor surface: `min-h-[40vh] font-retro text-lg p-4 pixel-border`
- Use **free** `@tiptap/*` extensions only; toolbar built in Svelte

### Toasts

- Position: `bottom-center`
- Style: `pixel-border font-pixel text-[8px] uppercase`
- Stepped slide-in: `translateY` with `steps(4)`

---

## 5. Layout Principles

### Page shell

```
┌─────────────────────────────────────┐
│  max-w-[720px] mx-auto px-4         │  ← 4px grid gutter
│  ┌───────────────────────────────┐  │
│  │ ▓ HEADER (pixel bar, sticky)  │  │
│  ├───────────────────────────────┤  │
│  │ main mt-4                     │  │
│  │   content on dot-grid bg      │  │
│  ├───────────────────────────────┤  │
│  │ ▒ FOOTER (pixel rule)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- **Max width:** 720px (unchanged reading measure)
- **Padding:** `px-4` (16px grid)
- **Background:** optional `bg-[radial-gradient(circle,_#00000010_1px,_transparent_1px)] bg-[size:8px_8px]` on light mode

### Header

- Sticky `top-0 z-50 pixel-border-b bg-background`
- On scroll: bottom `pixel-border-b` (no blur — blur is anti-retro)
- Logo: pixel rocket SVG in accent box + `font-pixel` site name (`hidden sm:inline` on mobile)

### Navigation

- Routes: **Home**, **Notes**, **Projects** only (no legacy static pages)
- Active item: `.pixel-nav-active` — `accent` fill + `accent-foreground` text + inset shadow (`!important` so ghost `bg-transparent` does not win)
- Inactive ghost nav: inherits `foreground`; active must never leave amber-on-green (dark) or yellow-on-yellow (light)
- Page transitions: View Transitions API (see §6)

### Homepage (`/`)

- Intro copy + primary CTAs
- **System status** card: post count, project count, last update
- **Recent notes** (up to 3) + link to `/notes`
- **Featured projects** (up to 3) + link to `/projects`

### Admin shell (`/admin/*`)

- Separate layout — no public header/footer
- `admin-shell` with `bg-muted/20`
- `AdminNav`: Dashboard, Posts, New post, Projects, New project, View site, Sign out
- `noindex` meta on admin pages

### Theme bootstrap

- Blocking inline script in `src/app.html` reads `localStorage.theme` before paint (prevents light flash)
- Toggle logic in `src/lib/theme.ts`

### Routes in scope

| Route | Purpose |
| --- | --- |
| `/` | Home / intro |
| `/notes` | Post list (from SQLite) |
| `/notes/[slug]` | Post detail (Tiptap HTML) |
| `/projects` | Manual portfolio (admin CRUD, SQLite) |
| `/feed.xml` | RSS 2.0 feed of published notes |
| `/admin/*` | Owner-only CMS (email/password) |
| `/login` | Admin login |

**Out of scope:** `/uses`, `/previously`, `/leo`, MDX static pages — do not migrate.

### Responsive

- Mobile: stack project rows; `font-pixel` nav shrinks to `text-[8px]`
- Notes date column: `w-20 font-retro`
- Projects: single column → `md:grid-cols-2` with equal-height `pixel-border` cards

---

## 6. Motion & Transitions

| Token | Value | Usage |
| --- | --- | --- |
| `--space-page-y` | 16px | Main content top spacing |
| `--space-section` | 32px | Section gaps (`my-8`) |
| `--space-card` | 16px | Card padding (`p-4`) |
| `--duration-step` | 120ms | Hover, press |
| `--duration-enter` | 200ms | Page fade-in |
| `--duration-exit` | 150ms | Page fade-out |
| `--duration-move` | 300ms | Note title morph, slides |

### View Transitions (implemented)

| Type | Trigger | Animation |
| --- | --- | --- |
| `nav-forward` | `/notes` → `/notes/[slug]` | Slide out left / in right |
| `nav-back` | `/notes/[slug]` → `/notes` | Slide out right / in left |
| `nav-lateral` | Other route changes | Fade + slight blur |
| `fade` | Same path | Fade |

Persistent groups: `persistent-nav`, `persistent-footer`, `page-content`.

Note titles use `view-transition-name: note-title-{slug}` for morph.

**Reduced motion:** all view-transition animations set to `0s` via `prefers-reduced-motion`.

### Micro-interactions

- Theme toggle: instant palette swap (no transition) — like switching CRT mode
- Button press: `.pixel-border:active` → `translate(2px, 2px)` + shadow collapse
- Link hover: color jumps to `--accent`
- View counter increment: placeholder until API wired

---

## 7. Code & Architecture Patterns (SvelteKit)

```typescript
// Class merging
import { cn } from "$lib/utils";

// Semantic tokens — never hardcode retro hex in components
class="bg-background text-foreground pixel-border font-retro"

// Admin guard in hooks.server.ts
if (path.startsWith("/admin") && !session?.isAdmin) redirect(303, "/login");
```

### File organization (target)

| Path | Responsibility |
| --- | --- |
| `src/routes/(site)/` | Public shell: home, notes, projects, login |
| `src/routes/admin/` | CMS with separate layout + `AdminNav` |
| `src/routes/feed.xml/` | RSS endpoint |
| `src/routes/+layout.svelte` | Root: 720px shell, view transitions |
| `src/lib/components/ui/` | Pixel-styled Button, Input, Dialog |
| `src/lib/components/layout/` | Header, Footer, Menu, AdminNav |
| `src/lib/components/brand/` | Rocket logo SVG |
| `src/lib/theme.ts` | Theme read/apply/toggle |
| `static/favicon.svg` | Pixel rocket favicon |
| `src/lib/editor/` | Tiptap extensions + toolbar |
| `src/lib/db/` | Drizzle + SQLite |
| `src/lib/auth/` | Email/password sessions |
| `Dockerfile` | Coolify production image |
| `docker-compose.yml` | Local + Coolify reference |

### Docker / Coolify

- **Base image:** `node:24-alpine`
- **Adapter:** `@sveltejs/adapter-node`
- **Volume:** `/data/ilhamspace.db` for SQLite persistence
- **Env:** `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `BODY_SIZE_LIMIT`
- **Healthcheck:** `GET /api/health`
- **Port:** 3000 exposed

---

## 8. Implementation Status

| Item | Status |
| --- | --- |
| ilhamspace brand + pixel retro theme | Done |
| `max-w-[720px]` shell | Done |
| Semantic CSS variables | Done |
| Public `(site)` route group | Done |
| Admin separate layout | Done |
| Homepage with live data | Done |
| RSS `/feed.xml` | Done |
| View Transitions | Done |
| Theme flash fix (`app.html`) | Done |
| Contrast rules (nav active, titles) | Done — see §2 |
| Comments system | Placeholder UI |
| View counter API | Placeholder stats |
| Docker / Coolify | Pending |
| `/api/health` | Pending |

## 9. Refactor Guardrails

- [x] Pixel retro theme on every surface — no default shadcn rounded aesthetic
- [x] `max-w-[720px]` shell preserved
- [x] Semantic CSS variables in `app.css`
- [x] `font-pixel` for chrome, `font-retro` for reading text
- [x] `pixel-border` on buttons, cards, inputs, modals
- [x] Routes: `/`, `/notes`, `/projects`, `/admin`, `/login`, `/feed.xml`
- [x] **No MDX migration** — fresh content via Tiptap admin
- [x] **No GitHub OAuth** — email/password for single admin only
- [x] View Transitions + `prefers-reduced-motion`
- [x] Contrast-safe tokens: `text-primary` / `--ring` on backgrounds; `--accent` fill-only for nav active
- [ ] SQLite file on Docker volume for Coolify deploy
- [x] Tiptap: `@tiptap/*` MIT only
- [x] Projects: manual admin CRUD (not GitHub API)

**Out of scope (archived):** `/uses`, `/previously`, `/leo`, contribution heatmap, MDX notes folder

---

## 10. Quick Reference — Class Recipes

```text
# Pixel button
font-pixel text-[10px] uppercase rounded-none pixel-border bg-primary text-background
hover:bg-accent active:translate-x-0.5 active:translate-y-0.5

# Retro page title (contrast-safe)
font-pixel text-sm uppercase text-foreground
before:content-['>_'] before:text-[var(--ring)]

# Section / year heading (contrast-safe)
font-pixel text-xs uppercase text-primary

# Prose wrapper
prose-retro font-retro text-lg leading-relaxed

# Metadata chip
font-retro text-base text-muted-foreground inline-flex items-center gap-2

# Active nav tab (on ghost Button — needs !important in CSS)
pixel-nav-active

# Admin login card
max-w-sm mx-auto pixel-border bg-card p-6 space-y-4

# Admin shell
admin-shell bg-muted/20

# Dot grid page bg
bg-background bg-[radial-gradient(circle,#00000012_1px,transparent_1px)] bg-[size:8px_8px]
dark:bg-[radial-gradient(circle,#39FF1418_1px,transparent_1px)]
```