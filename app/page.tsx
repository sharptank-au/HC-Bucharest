"use client";

import { Header } from "@/components/header"
import { FiltersSidebar } from "@/components/filters-sidebar"
import { PromptCard } from "@/components/prompt-card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || undefined
  const sort = (searchParams.get("sort") as any) || "trending"

  const promptsData = useQuery(api.prompts.list, {
    q,
    sort,
    limit: 24
  })

  const prompts = promptsData?.items
  const isLoading = promptsData === undefined

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-[1600px] mx-auto px-4 md:px-6 py-8">
          <div className="flex gap-8">
            <FiltersSidebar />
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-secondary animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          <FiltersSidebar />

          <div className="flex-1">
            {/* Mobile filter button is inside FiltersSidebar */}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {prompts?.map((prompt: any) => (
                <PromptCard
                  key={prompt._id}
                  id={prompt._id}
                  title={prompt.title}
                  prompt={prompt.prompt}
                  creator={{
                    name: "Anonymous", // TODO: Get from user data
                    avatar: "/placeholder.svg"
                  }}
                  createdAt="Recently"
                  categories={[]} // TODO: Get from categories
                  videoUrl={prompt.videoUrl}
                  copyCount={prompt.copies}
                  upvotes={prompt.votes}
                  isSignedIn={false}
                />
              ))}
            </div>

            {prompts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No prompts found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
