import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedPrompts = mutation({
    args: {},
    handler: async ({ db }) => {
        // Create some sample categories first
        const categoryIds = await Promise.all([
            db.insert("categories", { name: "Nature", slug: "nature", createdAt: Date.now() }),
            db.insert("categories", { name: "Cinematic", slug: "cinematic", createdAt: Date.now() }),
            db.insert("categories", { name: "Urban", slug: "urban", createdAt: Date.now() }),
            db.insert("categories", { name: "Abstract", slug: "abstract", createdAt: Date.now() }),
            db.insert("categories", { name: "Technology", slug: "technology", createdAt: Date.now() }),
        ]);

        // Create sample prompts
        const prompts = [
            {
                title: "Cinematic Ocean Sunset",
                prompt: "A breathtaking cinematic shot of a golden sunset over a calm ocean, with gentle waves reflecting the warm orange and pink hues of the sky. Camera slowly pans across the horizon.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                categoryIds: [categoryIds[0], categoryIds[1]], // Nature, Cinematic
                slug: "cinematic-ocean-sunset"
            },
            {
                title: "Futuristic City Night",
                prompt: "A sprawling futuristic cityscape at night with neon lights, flying vehicles, and towering skyscrapers. Rain falls gently, creating reflections on the wet streets below.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                categoryIds: [categoryIds[2], categoryIds[4]], // Urban, Technology
                slug: "futuristic-city-night"
            },
            {
                title: "Abstract Particle Flow",
                prompt: "Mesmerizing abstract visualization of colorful particles flowing and swirling in space, creating organic patterns and shapes. Smooth camera movement follows the flow.",
                categoryIds: [categoryIds[3], categoryIds[4]], // Abstract, Technology
                slug: "abstract-particle-flow"
            },
            {
                title: "Wildlife in Forest",
                prompt: "A majestic deer walking through a misty forest at dawn, sunlight filtering through the trees creating god rays. Peaceful and serene atmosphere with natural sounds.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                categoryIds: [categoryIds[0]], // Nature
                slug: "wildlife-in-forest"
            },
            {
                title: "Cosmic Journey",
                prompt: "A journey through space passing by colorful nebulas, distant galaxies, and twinkling stars. Camera moves smoothly through the cosmic landscape.",
                categoryIds: [categoryIds[3]], // Abstract
                slug: "cosmic-journey"
            },
            {
                title: "Urban Street Life",
                prompt: "Bustling city street scene with people walking, cars passing by, and vibrant storefronts. Golden hour lighting creates long shadows and warm atmosphere.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                categoryIds: [categoryIds[2]], // Urban
                slug: "urban-street-life"
            }
        ];

        const now = Date.now();
        const createdPrompts = [];

        for (const promptData of prompts) {
            const prompt = await db.insert("prompts", {
                authorId: undefined,
                title: promptData.title,
                prompt: promptData.prompt,
                videoUrl: promptData.videoUrl,
                notes: undefined,
                meta: undefined,
                isPublished: true,
                categoryIds: promptData.categoryIds,
                copies: Math.floor(Math.random() * 500) + 50,
                votes: Math.floor(Math.random() * 200) + 20,
                views: Math.floor(Math.random() * 1000) + 100,
                createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
                updatedAt: now,
                slug: promptData.slug,
                searchable: `${promptData.title}\n${promptData.prompt}`
            });
            createdPrompts.push(prompt);
        }

        return { categories: categoryIds.length, prompts: createdPrompts.length };
    }
});
