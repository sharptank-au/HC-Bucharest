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
        cursor: v.optional(v.string()),
        hasVideo: v.optional(v.boolean()),
        myFavorites: v.optional(v.boolean())
    },
    handler: async ({ db, auth }, { q, categoryIds, sort = "trending", limit = 24, cursor, hasVideo, myFavorites }) => {
        let res;
        if (q && q.trim()) {
            res = await db
                .query("prompts")
                .withSearchIndex("prompts_search", (s) =>
                    s.search("searchable", q).eq("isPublished", true)
                )
                .paginate({ numItems: limit, cursor: cursor || null });
        } else {
            res = await db
                .query("prompts")
                .withIndex("by_isPublished_createdAt", (i) => i.eq("isPublished", true))
                .order("desc")
                .paginate({ numItems: limit, cursor: cursor || null });
        }
        let items = res.page;

        // Apply filters
        if (categoryIds?.length) {
            items = items.filter((p) => p.categoryIds.some((id: any) => categoryIds.includes(id)));
        }

        if (hasVideo) {
            items = items.filter((p) => p.videoUrl && p.videoUrl.trim() !== "");
        }

        if (myFavorites) {
            // For now, we'll need to implement favorites functionality
            // This is a placeholder - you'll need to add favorites table and logic
            const identity = await auth.getUserIdentity();
            if (identity) {
                // TODO: Implement favorites filtering
                // items = items.filter((p) => isFavorite(p._id, identity.subject));
            }
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
