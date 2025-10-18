import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
    args: { promptId: v.id("prompts"), userId: v.optional(v.id("users")) },
    handler: async ({ db }, { promptId, userId }) => {
        // For now, create a demo user if none provided
        // TODO: Implement proper Convex Auth
        if (!userId) {
            const demoUser = await db.insert("users", {
                userId: "demo-" + Date.now(),
                email: "demo@example.com",
                username: "Demo User",
                createdAt: Date.now()
            });
            userId = demoUser;
        }

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
