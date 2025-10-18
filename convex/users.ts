import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const me = query(async ({ db, auth }) => {
    // For now, return null until we get proper auth working
    // TODO: Implement proper Convex Auth
    return null;
});

export const createDemoUser = mutation({
    args: {
        email: v.optional(v.string()),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string())
    },
    handler: async ({ db }, args) => {
        // Create a demo user for authentication
        const userId = await db.insert("users", {
            userId: "demo-" + Date.now(),
            email: args.email || "demo@example.com",
            username: args.username || "Demo User",
            avatarUrl: args.avatarUrl,
            createdAt: Date.now()
        });

        return userId;
    }
});

export const ensureUser = mutation({
    args: {
        email: v.optional(v.string()),
        username: v.optional(v.string()),
        avatarUrl: v.optional(v.string())
    },
    handler: async ({ db }, args) => {
        // For now, create a demo user
        // TODO: Implement proper Convex Auth
        return await db.insert("users", {
            userId: "demo-" + Date.now(),
            email: args.email || "demo@example.com",
            username: args.username || "Demo User",
            avatarUrl: args.avatarUrl,
            createdAt: Date.now()
        });
    }
});
