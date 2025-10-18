import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
    return await db.query("categories").order("desc").collect();
});

export const listWithCounts = query(async ({ db }) => {
    const categories = await db.query("categories").order("desc").collect();
    
    // Get prompt counts for each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const prompts = await db
                .query("prompts")
                .withIndex("by_isPublished_createdAt", (q) => q.eq("isPublished", true))
                .collect();
            
            const count = prompts.filter(prompt => 
                prompt.categoryIds.includes(category._id)
            ).length;
            
            return {
                ...category,
                count
            };
        })
    );
    
    return categoriesWithCounts;
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
