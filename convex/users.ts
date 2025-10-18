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
