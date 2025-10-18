v0.dev UI and swap the backend to **Convex** for data, auth, and server logic. Below is a clean, production-ready blueprint:

* a Convex **schema** (collections + indexes),
* the **queries/mutations/actions** you’ll need (search, filters, votes, copy counts, etc.),
* **auth** options (Convex Auth vs Clerk) and how to wire them,
* and the React integration pattern (with optimistic UI).

---

# 1) Convex data model (schema.ts)

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Mirrors auth identity; we’ll upsert on first request
    // For Clerk: userId = Clerk user id, for Convex Auth: subject string
    userId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(), // Date.now()
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  categories: defineTable({
    name: v.string(),    // e.g., "Cinematic"
    slug: v.string(),    // "cinematic"
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  prompts: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    prompt: v.string(),
    videoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    meta: v.optional(v.any()), // { aspect_ratio, seed, camera, ... }
    isPublished: v.boolean(),
    categoryIds: v.array(v.id("categories")),
    // denormalized stats for fast cards (updated by mutations)
    copies: v.number(),
    votes: v.number(),
    views: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    slug: v.string(),
    // text blob used by search index
    searchable: v.string(), // title + prompt (maybe notes)
  })
    .index("by_slug", ["slug"])
    .index("by_createdAt", ["createdAt"])
    .index("by_isPublished_createdAt", ["isPublished", "createdAt"])
    .searchIndex("prompts_search", {
      searchField: "searchable",
      filterFields: ["isPublished"],
    }),

  votes: defineTable({
    promptId: v.id("prompts"),
    userId: v.id("users"),
    value: v.number(), // 0 or 1
    createdAt: v.number(),
  })
    .index("by_prompt_user", ["promptId", "userId"])
    .index("by_user", ["userId"]),

  copies: defineTable({
    promptId: v.id("prompts"),
    userId: v.optional(v.id("users")), // optional for anon
    ipHash: v.optional(v.string()),     // for rate-limiting
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"]),

  views: defineTable({
    promptId: v.id("prompts"),
    userId: v.optional(v.id("users")),
    ipHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"]),

  favorites: defineTable({
    promptId: v.id("prompts"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user_prompt", ["userId", "promptId"])
    .index("by_user", ["userId"]),
});
```

### Why denormalize `copies/votes/views` on `prompts`?

* Card queries become 1 round-trip + no aggregation work at read time.
* We still keep event logs (`copies`, `views`) for analytics and anti-abuse.

---

# 2) Auth with Convex

You have two good paths:

### Option A — **Convex Auth** (`@convex-dev/auth`)

* ✅ Simple, first-party.
* ✅ Supports Google (OAuth).
* ✅ Email magic link is supported (passwordless) via providers.
* 🔧 Add `<ConvexAuthProvider>`; call `ctx.auth.getUserIdentity()` in functions.



**Recommendation:** If you’re happy with ready-made UIs, **Convex Auth** keeps the stack lean.

---

# 3) Server functions (queries, mutations, actions)

> File layout (typical):
>
> ```
> convex/
>   schema.ts
>   prompts.ts      // queries & mutations for prompts
>   events.ts       // copies/views
>   votes.ts        // upvote toggle
>   categories.ts
>   users.ts        // upsert on auth
>   rateLimit.ts    // helpers
> ```
>
> Use `zod` or `convex/values` for inputs.

## 3.1 Users (ensure profile row exists)

```ts
// convex/users.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const me = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;
  const user = await db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .unique();
  return user;
});

export const ensureUser = mutation({
  args: { email: v.optional(v.string()), username: v.optional(v.string()), avatarUrl: v.optional(v.string()) },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return null;
    const existing = await db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await db.insert("users", {
      userId: identity.subject,
      email: args.email ?? identity.email ?? undefined,
      username: args.username ?? identity.name ?? undefined,
      avatarUrl: args.avatarUrl ?? identity.pictureUrl ?? undefined,
      createdAt: Date.now(),
    });
  },
});
```

## 3.2 Categories

```ts
// convex/categories.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
  return await db.query("categories").order("desc").collect();
});

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async ({ db, auth }, { name, slug }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Auth required");
    // optional: restrict creation to admins
    return await db.insert("categories", { name, slug, createdAt: Date.now() });
  },
});
```

## 3.3 Prompts (search, filter, sort, CRUD)

```ts
// convex/prompts.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const SORTS = ["trending", "most_copied", "most_upvoted", "newest"] as const;

export const list = query({
  args: {
    q: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async ({ db }, { q, categoryIds, sort = "trending", limit = 24, cursor }) => {
    // Base filter: only published
    let rows: any[];
    let pageInfo: any;

    if (q && q.trim().length > 0) {
      // Convex text search
      const res = await db
        .query("prompts")
        .withSearchIndex("prompts_search", (q2) =>
          q2.search("searchable", q).eq("isPublished", true)
        )
        .paginate({ numItems: limit, cursor });
      rows = res.page;
      pageInfo = res;
    } else {
      // Index scan by (isPublished, createdAt) then sort client-side
      const res = await db
        .query("prompts")
        .withIndex("by_isPublished_createdAt", (q2) => q2.eq("isPublished", true))
        .order("desc")
        .paginate({ numItems: limit, cursor });
      rows = res.page;
      pageInfo = res;
    }

    // Category filter (client-side filter to keep code short; you can push it down by modeling a categoryIndex)
    if (categoryIds && categoryIds.length) {
      rows = rows.filter((p) =>
        p.categoryIds.some((id: any) => categoryIds.find((c) => c.id === id) || categoryIds.includes(id))
      );
    }

    // Sort
    const now = Date.now();
    const score = (p: any) => {
      const ageHours = Math.max((now - p.createdAt) / 3600000, 1);
      return (p.votes * 3 + p.copies * 1 + p.views * 0.25) / ageHours;
    };
    rows.sort((a, b) => {
      switch (sort) {
        case "most_copied": return b.copies - a.copies;
        case "most_upvoted": return b.votes - a.votes;
        case "newest": return b.createdAt - a.createdAt;
        default: return score(b) - score(a);
      }
    });

    return { items: rows, ...("continueCursor" in pageInfo ? { cursor: pageInfo.continueCursor } : {}) };
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, { slug }) => {
    const prompt = await db.query("prompts").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!prompt || !prompt.isPublished) return null;
    return prompt;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    videoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    meta: v.optional(v.any()),
    categoryIds: v.array(v.id("categories")),
    slug: v.string(),
    publish: v.optional(v.boolean()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Auth required");

    const author = await db.query("users").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).unique();
    if (!author) throw new Error("Profile missing");

    const now = Date.now();
    const doc = {
      authorId: author._id,
      title: args.title.trim(),
      prompt: args.prompt.trim(),
      videoUrl: args.videoUrl,
      notes: args.notes,
      meta: args.meta,
      isPublished: args.publish ?? true,
      categoryIds: args.categoryIds,
      copies: 0,
      votes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
      slug: args.slug,
      searchable: `${args.title}\n${args.prompt}\n${args.notes ?? ""}`,
    };
    return await db.insert("prompts", doc);
  },
});
```

## 3.4 Votes (toggle, enforce one per user)

```ts
// convex/votes.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: { promptId: v.id("prompts") },
  handler: async ({ db, auth }, { promptId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to vote");

    const user = await db.query("users").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).unique();
    if (!user) throw new Error("Profile missing");

    const existing = await db.query("votes").withIndex("by_prompt_user", (q) => q.eq("promptId", promptId).eq("userId", user._id)).unique();

    let delta = 0;
    if (!existing) {
      await db.insert("votes", { promptId, userId: user._id, value: 1, createdAt: Date.now() });
      delta = 1;
    } else if (existing.value === 1) {
      await db.patch(existing._id, { value: 0 });
      delta = -1;
    } else {
      await db.patch(existing._id, { value: 1 });
      delta = +1;
    }

    // Update prompt denormalized votes
    const prompt = await db.get(promptId);
    if (prompt) await db.patch(promptId, { votes: prompt.votes + delta, updatedAt: Date.now() });

    return { delta };
  },
});
```

## 3.5 Copies & Views (allow anonymous, rate limit)

```ts
// convex/events.ts
import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { createHash } from "crypto";

// Helper: hash IP (call this as an action so you can read request headers)
export const hashIp = action({
  args: { ip: v.optional(v.string()) },
  handler: async (_ctx, { ip }) => {
    if (!ip) return undefined;
    return createHash("sha256").update(ip).digest("hex");
  },
});

// Simple in-DB rate limit: one event per ipHash per prompt per minute
async function rateLimited(db: any, table: "copies" | "views", promptId: any, ipHash?: string) {
  if (!ipHash) return false;
  const since = Date.now() - 60_000;
  const collisions = await db
    .query(table)
    .withIndex("by_prompt", (q: any) => q.eq("promptId", promptId))
    .collect();
  return collisions.some((e: any) => e.ipHash === ipHash && e.createdAt > since);
}

export const copy = mutation({
  args: { promptId: v.id("prompts"), ipHash: v.optional(v.string()) },
  handler: async ({ db, auth }, { promptId, ipHash }) => {
    if (await rateLimited(db, "copies", promptId, ipHash)) return { ok: false, reason: "rate_limited" };

    const identity = await auth.getUserIdentity();
    const user = identity
      ? await db.query("users").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).unique()
      : null;

    await db.insert("copies", {
      promptId,
      userId: user?._id,
      ipHash,
      createdAt: Date.now(),
    });

    const prompt = await db.get(promptId);
    if (prompt) await db.patch(promptId, { copies: prompt.copies + 1, updatedAt: Date.now() });

    return { ok: true };
  },
});

export const view = mutation({
  args: { promptId: v.id("prompts"), ipHash: v.optional(v.string()) },
  handler: async ({ db, auth }, { promptId, ipHash }) => {
    if (await rateLimited(db, "views", promptId, ipHash)) return { ok: false, reason: "rate_limited" };

    const identity = await auth.getUserIdentity();
    const user = identity
      ? await db.query("users").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).unique()
      : null;

    await db.insert("views", {
      promptId,
      userId: user?._id,
      ipHash,
      createdAt: Date.now(),
    });

    const prompt = await db.get(promptId);
    if (prompt) await db.patch(promptId, { views: prompt.views + 1, updatedAt: Date.now() });

    return { ok: true };
  },
});
```

---

# 4) Frontend wiring (React + Convex)

## 4.1 Provider & auth

```tsx
// app/providers.tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@convex-dev/auth/react"; // or ClerkProvider if using Clerk

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </AuthProvider>
  );
}
```

If using **Clerk**, wrap with `<ClerkProvider>` and install `@clerk/nextjs` + `@clerk/clerk-react`, then integrate `@convex-dev/auth/clerk`.

## 4.2 List with search/filters/sort (hooks)

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const PAGE = 24;

export function usePrompts({ q, categories, sort }) {
  const res = useQuery(api.prompts.list, {
    q: q || undefined,
    categoryIds: categories?.length ? categories : undefined,
    sort: sort || "trending",
    limit: PAGE,
  });
  return res; // { items, cursor? }
}
```

## 4.3 Snackprompt-style card actions (optimistic)

```tsx
function PromptCard({ p }) {
  const copyMut = useMutation(api.events.copy);
  const voteMut = useMutation(api.votes.toggle);

  const onCopy = async () => {
    await navigator.clipboard.writeText(p.prompt);
    // send ip hash (optional): call `hashIp` action from a Next.js route that reads req.ip
    copyMut({ promptId: p._id }); // optimistic: update local UI count
  };

  const onVote = async () => {
    try {
      const { delta } = await voteMut({ promptId: p._id });
      // optimistic UI: set p.votes += delta locally or refetch
    } catch {
      // toast: "Sign in to vote"
    }
  };

  return (
    <div className="rounded-2xl shadow p-4">
      {/* header with avatar/name/date */}
      <h3 className="line-clamp-1">{p.title}</h3>
      <p className="text-sm line-clamp-2">{p.prompt}</p>
      {p.videoUrl ? (
        <video
          className="mt-3 aspect-video w-full rounded-lg"
          src={p.videoUrl}
          muted
          loop
          playsInline
          autoPlay
        />
      ) : null}
      {/* category chips */}
      <div className="mt-3 flex gap-2">
        <button onClick={onCopy}>Copy • {p.copies}</button>
        <button onClick={onVote}>Upvote • {p.votes}</button>
        <a href={`/p/${p.slug}`}>Open</a>
      </div>
    </div>
  );
}
```

> Autoplay tips: add `loading="lazy"` on `<video>` once supported, or use `IntersectionObserver` to call `play()`/`pause()` when the card enters/leaves the viewport.

---

# 5) Access control / rules (business logic)

* **Browse & copy:** no auth required.
* **Vote / submit:** requires auth (enforced in mutations with `auth.getUserIdentity()`).
* **Publish flow:** keep `isPublished=true` by default; if you need moderation later, create an `isPublished=false` default and add an admin-only mutation to publish.
* **Rate limiting:** we implemented per-IP-hash per minute in events. If you can’t reliably read IP in the browser, proxy through a Next.js API route that reads `req.ip` and calls `api.events.copy/view` with a hash.

---

# 6) Validation & slugging

* Create `slug` on the client (e.g., `slugify(title)`) and ensure uniqueness by checking `by_slug` before insert; on conflict, append a shortid.
* Validate inputs (lengths, https-only `videoUrl`, category existence).
* Limit `prompt` length to prevent massive payloads (e.g., 12–16k chars max).

---

# 7) Sorting formulas (server)

Already included a simple trending score:

```ts
const score = (p) => {
  const ageHours = Math.max((Date.now() - p.createdAt) / 3600000, 1);
  return (p.votes * 3 + p.copies * 1 + p.views * 0.25) / ageHours;
};
```

You can experiment (e.g., Wilson score, half-life decay).

---

# 8) Migrations / seed

* Convex is schemaless in the sense of managed migrations via `schema.ts`.
* Add a small Next.js script or a Convex **action** to seed `categories`.
* On first user session, call `users.ensureUser()` to upsert the profile.

---

# 9) What changes in your UI?

* Nothing visual needs to change from your v0 design.
* Replace Supabase calls with `useQuery/useMutation` to the functions above.
* Keep anonymous browsing/copying; the buttons for **Submit** and **Upvote** should show a tooltip for anon users.

---

## Quick auth decision

* **Use Convex Auth** if you want **lean** setup with Google + email (passwordless) and you’re fine with Convex’s built-ins.


awesome — here’s a tight **POC + project structure** tailored for **Cursor** that you can paste in and run. It’s a minimal, working scaffold for your Sora Prompt Library using **Next.js (App Router) + Convex (DB + auth + server)** with Snackprompt-style cards, search, filters, copy counts, votes, and autoplay video previews.

---

# Project structure (drop into Cursor)

```
sora-prompts/
├─ app/
│  ├─ api/
│  │  └─ iphash/route.ts                # server route to hash client IP for rate-limiting
│  ├─ p/[slug]/page.tsx                 # prompt detail page
│  ├─ layout.tsx
│  ├─ page.tsx                          # home: search + filter + grid
│  ├─ providers.tsx
│  └─ globals.css
├─ components/
│  ├─ PromptCard.tsx
│  ├─ SearchBar.tsx
│  ├─ FilterSidebar.tsx
│  └─ VideoAuto.tsx
├─ convex/
│  ├─ schema.ts                         # collections & indexes
│  ├─ prompts.ts                        # list/search/create/get
│  ├─ votes.ts                          # toggle upvote
│  ├─ events.ts                         # copy/view logging + counters
│  ├─ users.ts                          # ensure user profile row
│  └─ _generated/                       # created by `npx convex dev`
├─ lib/
│  ├─ slug.ts
│  └─ types.ts
├─ public/
│  └─ placeholder.jpg
├─ .env.local.example
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```

---

## package.json

```json
{
  "name": "sora-prompts",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "convex:dev": "convex dev",
    "convex:deploy": "convex deploy"
  },
  "dependencies": {
    "next": "14.2.9",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "convex": "1.13.1",
    "@convex-dev/auth": "0.5.3",
    "lucide-react": "0.452.0",
    "clsx": "2.1.1"
  },
  "devDependencies": {
    "autoprefixer": "10.4.20",
    "postcss": "8.4.47",
    "tailwindcss": "3.4.13",
    "typescript": "5.6.3"
  }
}
```

> POC keeps auth simple (Convex Auth can be added next). You can ship browsing/copying/voting today; adding Google/email sign-in is a 10-min follow-up with `@convex-dev/auth`.

---

## convex/schema.ts

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // auth subject (fill when auth added)
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_userId", ["userId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    createdAt: v.number()
  }).index("by_slug", ["slug"]),

  prompts: defineTable({
    authorId: v.optional(v.id("users")),
    title: v.string(),
    prompt: v.string(),
    videoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    meta: v.optional(v.any()),
    isPublished: v.boolean(),
    categoryIds: v.array(v.id("categories")),
    copies: v.number(),
    votes: v.number(),
    views: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    slug: v.string(),
    searchable: v.string()
  })
    .index("by_slug", ["slug"])
    .index("by_isPublished_createdAt", ["isPublished", "createdAt"])
    .searchIndex("prompts_search", {
      searchField: "searchable",
      filterFields: ["isPublished"]
    }),

  votes: defineTable({
    promptId: v.id("prompts"),
    userId: v.id("users"),
    value: v.number(),
    createdAt: v.number()
  }).index("by_prompt_user", ["promptId", "userId"]),

  copies: defineTable({
    promptId: v.id("prompts"),
    userId: v.optional(v.id("users")),
    ipHash: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_prompt", ["promptId"]),

  views: defineTable({
    promptId: v.id("prompts"),
    userId: v.optional(v.id("users")),
    ipHash: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_prompt", ["promptId"]),

  favorites: defineTable({
    promptId: v.id("prompts"),
    userId: v.id("users"),
    createdAt: v.number()
  }).index("by_user_prompt", ["userId", "promptId"])
});
```

---

## convex/users.ts

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const me = query(async ({ db }) => {
  // When auth is wired, look up by subject; for now just null.
  return null;
});

export const ensureUser = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string())
  },
  handler: async ({ db }, args) => {
    const existing = await db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) return existing._id;
    return await db.insert("users", {
      ...args,
      createdAt: Date.now()
    });
  }
});
```

---

## convex/prompts.ts

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

type SortKey = "trending" | "most_copied" | "most_upvoted" | "newest";

const score = (p: any) => {
  const ageH = Math.max((Date.now() - p.createdAt) / 3600000, 1);
  return (p.votes * 3 + p.copies * 1 + p.views * 0.25) / ageH;
};

export const list = query({
  args: {
    q: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async ({ db }, { q, categoryIds, sort = "trending", limit = 24, cursor }) => {
    let res;
    if (q && q.trim()) {
      res = await db
        .query("prompts")
        .withSearchIndex("prompts_search", (s) =>
          s.search("searchable", q).eq("isPublished", true)
        )
        .paginate({ numItems: limit, cursor });
    } else {
      res = await db
        .query("prompts")
        .withIndex("by_isPublished_createdAt", (i) => i.eq("isPublished", true))
        .order("desc")
        .paginate({ numItems: limit, cursor });
    }
    let items = res.page;

    if (categoryIds?.length) {
      items = items.filter((p) => p.categoryIds.some((id: any) => categoryIds.includes(id)));
    }

    items.sort((a, b) => {
      switch (sort as SortKey) {
        case "most_copied": return b.copies - a.copies;
        case "most_upvoted": return b.votes - a.votes;
        case "newest": return b.createdAt - a.createdAt;
        default: return score(b) - score(a);
      }
    });

    return { items, cursor: res.continueCursor };
  }
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, { slug }) => {
    const p = await db.query("prompts").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!p || !p.isPublished) return null;
    return p;
  }
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    videoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    meta: v.optional(v.any()),
    categoryIds: v.array(v.id("categories")),
    slug: v.string()
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    return await db.insert("prompts", {
      authorId: undefined, // fill when auth is added
      title: args.title.trim(),
      prompt: args.prompt.trim(),
      videoUrl: args.videoUrl,
      notes: args.notes,
      meta: args.meta,
      isPublished: true,
      categoryIds: args.categoryIds,
      copies: 0,
      votes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
      slug: args.slug,
      searchable: `${args.title}\n${args.prompt}\n${args.notes ?? ""}`
    });
  }
});
```

---

## convex/votes.ts

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: { promptId: v.id("prompts"), userId: v.id("users") },
  handler: async ({ db }, { promptId, userId }) => {
    const existing = await db
      .query("votes")
      .withIndex("by_prompt_user", (q) => q.eq("promptId", promptId).eq("userId", userId))
      .unique();

    let delta = 0;
    if (!existing || existing.value === 0) {
      if (existing) await db.patch(existing._id, { value: 1 });
      else await db.insert("votes", { promptId, userId, value: 1, createdAt: Date.now() });
      delta = 1;
    } else {
      await db.patch(existing._id, { value: 0 });
      delta = -1;
    }

    const p = await db.get(promptId);
    if (p) await db.patch(promptId, { votes: p.votes + delta, updatedAt: Date.now() });

    return { delta };
  }
});
```

---

## convex/events.ts

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const copy = mutation({
  args: { promptId: v.id("prompts"), userId: v.optional(v.id("users")), ipHash: v.optional(v.string()) },
  handler: async ({ db }, { promptId, userId, ipHash }) => {
    // naive rate limit: 1/min per ipHash per prompt
    if (ipHash) {
      const since = Date.now() - 60_000;
      const recent = (await db.query("copies").withIndex("by_prompt", (q) => q.eq("promptId", promptId)).collect())
        .some((e) => e.ipHash === ipHash && e.createdAt > since);
      if (recent) return { ok: false, reason: "rate_limited" };
    }

    await db.insert("copies", { promptId, userId, ipHash, createdAt: Date.now() });
    const p = await db.get(promptId);
    if (p) await db.patch(promptId, { copies: p.copies + 1, updatedAt: Date.now() });
    return { ok: true };
  }
});

export const view = mutation({
  args: { promptId: v.id("prompts"), userId: v.optional(v.id("users")), ipHash: v.optional(v.string()) },
  handler: async ({ db }, { promptId, userId, ipHash }) => {
    const since = Date.now() - 60_000;
    if (ipHash) {
      const recent = (await db.query("views").withIndex("by_prompt", (q) => q.eq("promptId", promptId)).collect())
        .some((e) => e.ipHash === ipHash && e.createdAt > since);
      if (recent) return { ok: false, reason: "rate_limited" };
    }
    await db.insert("views", { promptId, userId, ipHash, createdAt: Date.now() });
    const p = await db.get(promptId);
    if (p) await db.patch(promptId, { views: p.views + 1, updatedAt: Date.now() });
    return { ok: true };
  }
});
```

---

## app/api/iphash/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd?.split(",")[0] || req.ip || "0.0.0.0").trim();
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
  return NextResponse.json({ ipHash });
}
```

---

## app/providers.tsx

```tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

---

## app/layout.tsx

```tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "Sora Prompt Library" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-7xl p-4">
          <header className="flex items-center gap-4 py-2">
            <div className="font-bold text-xl">Sora Prompts</div>
            <div className="ml-auto">
              {/* sign-in placeholder; wire Convex Auth later */}
              <button className="rounded-lg border border-neutral-800 px-3 py-1.5">Sign in</button>
            </div>
          </header>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
```

---

## components/VideoAuto.tsx

```tsx
"use client";
import { useEffect, useRef } from "react";

export default function VideoAuto({ src }: { src?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause())),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!src) return null;
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      className="aspect-video w-full rounded-lg bg-black/40"
    />
  );
}
```

---

## components/PromptCard.tsx

```tsx
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import VideoAuto from "./VideoAuto";

export default function PromptCard({ p }: { p: any }) {
  const copyMut = useMutation(api.events.copy);
  const voteMut = useMutation(api.votes.toggle);

  const copyNow = async () => {
    await navigator.clipboard.writeText(p.prompt);
    const { ipHash } = await fetch("/api/iphash").then((r) => r.json());
    copyMut({ promptId: p._id, ipHash });
    // optimistic UI bump (optional: state)
    p.copies += 1;
  };

  const voteNow = async () => {
    // POC: using a fake user (replace with real userId when auth is added)
    const fakeUserId = p.authorId || p._id; // placeholder
    const res = await voteMut({ promptId: p._id, userId: fakeUserId });
    p.votes += res.delta;
  };

  return (
    <div className="rounded-2xl border border-neutral-800 p-4 shadow-sm">
      <h3 className="line-clamp-1 text-lg font-semibold">{p.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{p.prompt}</p>
      <div className="mt-3">
        <VideoAuto src={p.videoUrl} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button onClick={copyNow} className="rounded-lg bg-neutral-800 px-3 py-1.5">
          Copy · {p.copies}
        </button>
        <button onClick={voteNow} className="rounded-lg bg-neutral-800 px-3 py-1.5">
          Upvote · {p.votes}
        </button>
        <a href={`/p/${p.slug}`} className="text-neutral-300 underline-offset-2 hover:underline">
          Open
        </a>
      </div>
    </div>
  );
}
```

---

## components/SearchBar.tsx

```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(Array.from(params.entries()));
      if (q) sp.set("q", q);
      else sp.delete("q");
      router.replace(`/?${sp.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Search prompts…"
      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 outline-none"
    />
  );
}
```

---

## components/FilterSidebar.tsx (stub)

```tsx
export default function FilterSidebar() {
  return (
    <aside className="hidden w-64 flex-none md:block">
      <div className="sticky top-4 space-y-3">
        <div className="text-sm text-neutral-400">Filters (categories, sort…) – wire later</div>
      </div>
    </aside>
  );
}
```

---

## app/page.tsx (home grid)

```tsx
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import PromptCard from "@/components/PromptCard";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";

export default async function Home({ searchParams }: { searchParams: { q?: string; sort?: string } }) {
  const q = searchParams.q || undefined;
  const sort = (searchParams.sort as any) || "trending";

  const { items } = await fetchQuery(api.prompts.list, {
    q,
    sort,
    limit: 24
  });

  return (
    <main className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[16rem_1fr]">
      <FilterSidebar />
      <section>
        <div className="mb-4">
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PromptCard key={p._id} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
```

---

## app/p/[slug]/page.tsx (detail)

```tsx
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import VideoAuto from "@/components/VideoAuto";

export default async function PromptDetail({ params }: { params: { slug: string } }) {
  const prompt = await fetchQuery(api.prompts.bySlug, { slug: params.slug });
  if (!prompt) return <div className="p-6 text-neutral-400">Not found.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-2 md:p-6">
      <h1 className="text-2xl font-semibold">{prompt.title}</h1>
      <VideoAuto src={prompt.videoUrl} />
      <div className="rounded-xl border border-neutral-800 p-4">
        <div className="mb-2 text-sm text-neutral-400">Prompt</div>
        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{prompt.prompt}</pre>
        <button
          onClick={async () => navigator.clipboard.writeText(prompt.prompt)}
          className="mt-3 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
```

---

## lib/slug.ts

```ts
export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
```

---

## app/globals.css (Tailwind base)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
```

---

## tailwind.config.ts

```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: []
} satisfies Config;
```

---

## .env.local.example

```
NEXT_PUBLIC_CONVEX_URL=https://YOUR-CONVEX.deployment.convex.cloud
```

> When you run `npx convex dev`, it will print your Convex URL. Put it in `NEXT_PUBLIC_CONVEX_URL`.

---

## README.md (POC runbook)

```md
# Sora Prompt Library — POC (Next.js + Convex)

## Quickstart
1) `pnpm i` (or npm/yarn)
2) In one terminal: `pnpm convex:dev` (creates `convex/_generated` + gives URL)
3) Copy Convex URL into `.env.local` as `NEXT_PUBLIC_CONVEX_URL=...`
4) In another terminal: `pnpm dev`
5) Open http://localhost:3000

## Seed a prompt (Cursor quick action)
- Open `convex/prompts.ts`, temporarily export a `seed` mutation, or call `create` from the Convex dashboard with:
  - title: "Cinematic Drone Flyover"
  - prompt: "sora v2: cinematic drone shot over neon-lit city..."
  - videoUrl: "https://your-sora-video-url.mp4"
  - categoryIds: []
  - slug: "cinematic-drone-flyover"

## Next steps
- Wire **auth** (Convex Auth):
  - `pnpm add @convex-dev/auth`
  - Add providers (Google + Email OTP).
  - In server functions, replace fake `userId` with `ctx.auth.getUserIdentity()` lookup to `users`.
- Add categories UI & filtering.
- Replace vote fake user with real `users.ensureUser()` mapping.
- Add "Submit Prompt" page to create new prompts.
```

---

### How to add Convex Auth (Google + Email) later (summary)

1. Install: `pnpm add @convex-dev/auth @convex-dev/auth/react`
2. Create `app/api/auth/[...auth]/route.ts` using `@convex-dev/auth/nextjs` handlers.
3. Wrap `<Providers>` with `AuthProvider`.
4. In server functions, get identity with `auth.getUserIdentity()`, upsert user in `users`.
5. Replace fake `userId` in `votes.toggle` call with the real one from the client (via `useAuth()` or a server action).

---

## Why this POC works for you

* **Snackprompt-style cards**: title, clamped preview, **autoplay muted video**, copy & upvote counters.
* **Anonymous browsing/copying** works; **voting** is ready to lock behind auth with one line change.
* **Search/filter/sort** backed by Convex search index and simple trending score.
* **Rate-limited copy/view** logging via a tiny IP-hash route.
* Fits neatly with your existing **v0.dev** design; just swap the components/styles in.


