import { Header } from "@/components/header"
import { PromptDetail } from "@/components/prompt-detail"
import { RelatedPrompts } from "@/components/related-prompts"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { notFound } from "next/navigation"

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch the prompt data from Convex
  const prompt = await fetchQuery(api.prompts.bySlug, { slug })

  if (!prompt) {
    notFound()
  }

  // Fetch related prompts (same categories, excluding current)
  const relatedPromptsData = await fetchQuery(api.prompts.list, {
    categoryIds: prompt.categoryIds,
    limit: 4
  })

  // Filter out current prompt and limit to 3
  const relatedPrompts = relatedPromptsData?.items
    ?.filter(p => p._id !== prompt._id)
    ?.slice(0, 3) || []

  // Transform data to match component interface
  const promptData = {
    id: prompt._id,
    title: prompt.title,
    prompt: prompt.prompt,
    creator: {
      name: "Anonymous", // TODO: Get from user data when auth is added
      avatar: "/placeholder.svg"
    },
    createdAt: new Date(prompt.createdAt).toLocaleDateString(),
    categories: [], // TODO: Get category names from categoryIds
    videoUrl: prompt.videoUrl,
    copyCount: prompt.copies,
    upvotes: prompt.votes,
    views: prompt.views,
    notes: prompt.notes,
    metadata: prompt.meta || {}
  }

  const isOwner = false // TODO: Check if current user is the owner
  const promptStatus: "public" | "private" = prompt.isPublished ? "public" : "private"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <PromptDetail prompt={promptData} isOwner={isOwner} initialStatus={promptStatus} />

        <div className="mt-12">
          <RelatedPrompts prompts={relatedPrompts.map(p => ({
            id: p._id,
            slug: p.slug,
            title: p.title,
            prompt: p.prompt,
            creator: { name: "Anonymous", avatar: "/placeholder.svg" },
            createdAt: new Date(p.createdAt).toLocaleDateString(),
            categories: [],
            videoUrl: p.videoUrl,
            copyCount: p.copies,
            upvotes: p.votes,
          }))} />
        </div>
      </main>
    </div>
  )
}
