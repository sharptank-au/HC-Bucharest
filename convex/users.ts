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
    args: {
        email: v.optional(v.string()),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string())
    },
    handler: async ({ db, auth }, args) => {
        const identity = await auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

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
            createdAt: Date.now()
        });
    }
});
