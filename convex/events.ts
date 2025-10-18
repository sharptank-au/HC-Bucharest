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
