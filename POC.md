awesome idea — a “Snackprompt-style” library just for Sora-2 prompts with autoplaying result videos. Here’s exactly what to feed v0.dev to get the UI scaffolding, followed by crisp requirements (schema, APIs, RLS, etc.) for a React + Supabase build. I’ll also give you a sane auth recommendation.

# Prompt for v0.dev (UI spec)

> Build a responsive web app called **Sora Prompt Library**.
> Top nav: brand on the left (“Sora Prompts”), Search input centered (full-width on mobile), actions on the right: **Sign in**, **Submit Prompt** (hidden or disabled until signed in), user avatar menu when signed in.
>
> Main layout: two columns on desktop (left filters, right content), single column on mobile.
>
> **Left sidebar filters** (collapsible on mobile):
>
> * Categories (pill list with counts, multi-select).
> * Sort dropdown: *Trending, Most Copied, Most Upvoted, Newest*.
> * Toggles: *Has video*, *My favorites* (only when signed in).
>
> **Content area**: grid of “Snackprompt-style cards” (3 columns desktop, 2 tablet, 1 mobile). Each card shows:
>
> * Creator avatar + name + created date.
> * Prompt title (one line) and a short prompt preview (2 lines, clamp).
> * Autoplaying muted video preview if a `video_url` exists (16:9, hover to unmute, click opens modal with full video). If no video, show a neutral poster image.
> * Category chips.
> * Footer actions: **Copy** (shows copy count), **Upvote** (shows score), **Open** (detail page).
>
>   * Copy button: on click, copies full prompt text and increments a visible counter with a subtle confetti.
>   * Upvote button: disabled for anonymous users (show tooltip “Sign in to vote”).
>
> **Detail page** (route `/p/[slug]`):
>
> * Left: Title, creator, categories, stats: Copy count, Votes, Views.
> * Right: Large video player (autoplay muted, loop, controls on hover).
> * Tabs below: **Prompt** (full text with “Copy” CTA), **Notes** (creator tips), **Usage** (metadata like aspect ratio, seed, camera, etc. as definition list).
> * Related prompts carousel.
>
> **Submit Prompt modal/page** (signed-in only): inputs for Title, Prompt (textarea), Categories (multi-select with create-new), Video URL (Sora-2 result link), optional Notes, optional metadata (seed, camera, etc.).
>
> **Empty states**: friendly illustrations and “Clear filters” CTA.
> **Toasts** for copy and vote actions.
> **Design language**: modern, airy cards, rounded-2xl, soft shadows, large touch targets, neutral palette with one accent color. Dark mode supported.

# Project requirements (concise & complete)

## Tech choices

* **Frontend**: React (Next.js 14+ App Router), TypeScript, Tailwind, shadcn/ui, React Query (TanStack) for data fetching, `next-video` or native `<video>` for autoplay previews.
* **DB & backend**: Supabase Postgres, RLS, Edge Functions for server actions (or direct client queries via Supabase JS with RLS).
* **Search**: Postgres Full-Text Search + `pg_trgm` for fuzzy search; optional materialized view for trending.
* **Storage**: none needed if only linking Sora videos by URL (no uploads). If you later allow thumbnails, use Supabase Storage.
* **Analytics**: event tables (copies, views, votes).
* **Auth**: Email + Google. (See recommendation at the end.)

## Core user stories

1. Anyone can browse, search, filter by category, sort, watch autoplay videos, and **copy** prompts.
2. Anonymous users **cannot** submit prompts or vote.
3. Signed-in users can **submit** prompts, **upvote** once per prompt (toggle), and see their own submissions and favorites.
4. Each prompt shows: title, preview of prompt text, categories, stats (copies, votes), and optional autoplay video.
5. Detail page shows full prompt text with copy, structured metadata, and related prompts.

## Data model (Supabase SQL)

```sql
-- profiles (one row per user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- categories (curated or user-createable)
create table public.categories (
  id bigserial primary key,
  name text unique not null,
  slug text unique generated always as (replace(lower(name), ' ', '-')) stored
);

-- prompts
create table public.prompts (
  id bigserial primary key,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  prompt text not null,
  video_url text, -- Sora 2 result URL
  notes text,
  meta jsonb, -- optional: {aspect_ratio, seed, camera, etc.}
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  slug text unique generated always as (
    regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')
  ) stored
);

-- prompt_categories (many-to-many)
create table public.prompt_categories (
  prompt_id bigint references public.prompts(id) on delete cascade,
  category_id bigint references public.categories(id) on delete cascade,
  primary key (prompt_id, category_id)
);

-- votes (one per user per prompt, value = +1 or 0 if unvoted)
create table public.votes (
  prompt_id bigint references public.prompts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  value smallint not null check (value in (0,1)),
  created_at timestamptz default now(),
  primary key (prompt_id, user_id)
);

-- copies (event log; derive counts)
create table public.copies (
  id bigserial primary key,
  prompt_id bigint references public.prompts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  ip_hash text -- store a hash for anon dedupe/rate-limiting if desired
);

-- views (optional, for trending & related)
create table public.views (
  id bigserial primary key,
  prompt_id bigint references public.prompts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- favorites (optional)
create table public.favorites (
  prompt_id bigint references public.prompts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (prompt_id, user_id)
);

-- helpful indexes
create index on public.prompts (created_at desc);
create index on public.prompt_categories (category_id);
create index on public.votes (prompt_id);
create index on public.copies (prompt_id);
create index on public.views (prompt_id);

-- search indexes
create extension if not exists pg_trgm;
create extension if not exists unaccent;
alter table public.prompts add column tsv tsvector
  generated always as (
    setweight(to_tsvector('simple', unaccent(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(prompt,''))), 'B')
  ) stored;
create index on public.prompts using gin (tsv);
create index on public.prompts using gin (title gin_trgm_ops);
```

### Derived stats (views / SQL helpers)

```sql
-- total_votes and total_copies via views
create view public.prompt_stats as
select
  p.id,
  coalesce(sum(v.value), 0) as votes,
  (select count(*) from public.copies c where c.prompt_id = p.id) as copies
from public.prompts p
left join public.votes v on v.prompt_id = p.id
group by p.id;

-- simple trending score (Wilson score-ish proxy)
create view public.prompt_trending as
select
  p.id,
  s.votes,
  s.copies,
  -- favor freshness: decay by age (in hours)
  (s.votes * 3 + s.copies * 1) / greatest(extract(epoch from (now()-p.created_at))/3600, 1) as score
from public.prompts p
join public.prompt_stats s on s.id = p.id;
```

## RLS policies (key ideas)

```sql
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_categories enable row level security;
alter table public.votes enable row level security;
alter table public.copies enable row level security;
alter table public.views enable row level security;
alter table public.categories enable row level security;
alter table public.favorites enable row level security;

-- profiles: users can read all, update own
create policy "read profiles" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id);

-- prompts: anyone can read published prompts
create policy "read published prompts" on public.prompts for select using (is_published = true);
-- insert/update only by authenticated
create policy "insert prompts" on public.prompts for insert with check (auth.role() = 'authenticated');
create policy "update own prompt" on public.prompts for update
  using (auth.uid() = author_id);

-- categories readable to all; insert if authenticated (or restrict to admins)
create policy "read categories" on public.categories for select using (true);
create policy "insert categories" on public.categories for insert with check (auth.role() = 'authenticated');

-- pivot table follows prompt access
create policy "read prompt_categories" on public.prompt_categories for select using (true);
create policy "modify prompt_categories" on public.prompt_categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- votes: read all, write own (one per prompt enforced by PK)
create policy "read votes" on public.votes for select using (true);
create policy "upsert own vote" on public.votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- copies: allow insert by anyone (including anon) but only select aggregated via views
create policy "insert copy events" on public.copies for insert using (true) with check (true);
create policy "read copies none" on public.copies for select using (false);

-- views similar to copies
create policy "insert view events" on public.views for insert using (true) with check (true);
create policy "read views none" on public.views for select using (false);

-- favorites: read own, write own
create policy "read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "modify own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

> Note: anonymous insert into `copies`/`views` is fine with RLS above (no `user_id`), but you should add rate-limiting in API (e.g., one copy per IP hash per minute per prompt).

## API surface (Next.js route handlers or Supabase Edge Functions)

* `GET /api/prompts`: query with `q` (search), `categories[]`, `sort`, `page`, `pageSize`. Uses Supabase SQL with FTS and aggregates (`prompt_stats` and/or joins).
* `GET /api/prompts/:slug`: prompt + `prompt_stats` + categories + related prompts (shared categories).
* `POST /api/prompts` (auth): create prompt; server validates URL, normalizes metadata, inserts pivot rows.
* `POST /api/prompts/:id/vote` (auth): body `{value: 0|1}` upsert into `votes`.
* `POST /api/prompts/:id/copy` (public): logs a copy event (user_id optional); returns new copy count.
* `POST /api/prompts/:id/view` (public): logs a view event.
* `POST /api/categories` (auth): add category (or restrict to admin).
* Optional: `POST /api/prompts/:id/favorite` (auth).

> You can also skip custom API and call Supabase directly from the client with RLS (React Query + Supabase JS). Keep write operations (vote/submit) behind auth, copy/view allowed for anon.

## Query examples

**Search + filter**

```sql
select p.*, s.votes, s.copies
from public.prompts p
join public.prompt_stats s on s.id = p.id
where p.tsv @@ plainto_tsquery('simple', unaccent($1)) -- $1 = search text
and ($2::bigint[] is null or exists (
  select 1 from public.prompt_categories pc
  where pc.prompt_id = p.id and pc.category_id = any($2)
))
order by case when $3='trending' then (select score from public.prompt_trending t where t.id = p.id)
              when $3='most_copied' then s.copies
              when $3='most_upvoted' then s.votes
              else p.created_at end desc
limit $4 offset $5;
```

## Frontend components

* `<SearchBar />` with debounced query sync to URL params.
* `<FilterSidebar />` with category multi-select; persists in URL.
* `<PromptCard />`

  * Autoplay `<video muted playsInline loop src={video_url} />`.
  * `Copy` button uses `navigator.clipboard.writeText(prompt)` → POST `/copy` → optimistic increment.
  * `Upvote` button (signed-in only) → POST `/vote` → optimistic toggle.
* `<PromptDetail />` with tabs (Prompt/Notes/Usage) and related carousel.
* `<SubmitPromptForm />` with zod validation: required `title`, `prompt`; optional `video_url` (must be https), `notes`, `meta`.
* Toasts and tooltips for UX polish.

## Validation & moderation

* Server validation: max prompt length, disallow obvious spam links, ensure `video_url` is HTTPS.
* Optional: queue prompts as `is_published=false` then moderation toggle.
* Abuse controls:

  * Throttle copies/views per IP hash.
  * Votes require auth; upsert prevents duplicates.

## Performance

* Use `SELECT … LIMIT/OFFSET` or cursor pagination.
* Preload `prompt_stats` via view; or create a materialized view for homepage sorts and refresh it periodically with a Supabase cron job.
* Lazy load videos; only autoplay when in viewport (`IntersectionObserver`) and pause on scroll/offscreen.

## Accessibility

* `video` with captions when available, keyboard controls, buttons with `aria-pressed` for votes, `aria-live` region for toasts.

---

# Auth: Clerk vs Supabase Auth (recommendation)

**Both support Email + Google.** Here’s the trade-off:

* **Supabase Auth**

  * ✅ Tightest integration with Supabase RLS (JWT includes `auth.uid()` seamlessly).
  * ✅ Fewer moving parts; no extra syncing layer.
  * ✅ Good enough hosted UIs; can roll your own easily.
  * ➖ If you want a super-polished auth widget out of the box, Clerk feels nicer.

* **Clerk**

  * ✅ Best-in-class prebuilt UIs (sign-in/up, profile, orgs), great DX.
  * ➖ You must pass Clerk JWT to Supabase and configure Postgres JWT verification or proxy through Next server; also create a **profiles** row on first login (webhook or upsert).
  * ➖ Slightly more complexity for RLS and edge calls.

**My recommendation for this project:** use **Supabase Auth**. You’re already on Supabase, you need RLS, and your roles are simple (anon vs authenticated). Supabase Auth keeps it straightforward and production-worthy with fewer moving parts. If in the future you want orgs/teams and fancy auth flows, Clerk is a fine upgrade.

If you still prefer **Clerk**, use this minimal glue:

* On sign-in, call an API route that upserts `profiles` with `id = clerkUserId` (also store email/username).
* Configure Supabase to accept Clerk JWT (set JWKS) so `auth.uid()` matches Clerk user id for RLS.

---

Want me to turn this into a ready-to-paste Next.js scaffold (routes, components, and Supabase queries), or generate the actual SQL migration file plus a minimal React page?
