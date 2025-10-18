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
