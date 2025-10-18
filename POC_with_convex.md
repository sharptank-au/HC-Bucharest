perfect — we can keep your v0.dev UI and swap the backend to **Convex** for data, auth, and server logic. Below is a clean, production-ready blueprint:

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

### Option B — **Clerk + Convex**

* ✅ Best-in-class auth UI (email + Google out of the box).
* 🔧 You’ll forward Clerk JWT to Convex; Convex verifies; `subject` becomes your stable user key.
* 🔧 Create/maintain a `users` row on first call.

**Recommendation:** If you’re happy with ready-made UIs, **Clerk** is great; otherwise **Convex Auth** keeps the stack lean. Either works perfectly here.

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
* **Use Clerk** if you want **premium auth UIs** and flows (email + Google are trivial). The glue code above already fits; your Convex functions remain the same since they check `auth.getUserIdentity()` which Clerk enables via the Convex auth adapter.

If you want, I can generate:

* the **full `convex/` folder** with the code above wired to your collection names,
* a **minimal Next.js client** for list/detail/submit pages,
* and a **middleware** example to pass IP → `hashIp` for rate limiting.
