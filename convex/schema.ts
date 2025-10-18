import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,

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
