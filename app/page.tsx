"use client";

import { Header } from "@/components/header"
import { FiltersSidebar } from "@/components/filters-sidebar"
import { PromptCard } from "@/components/prompt-card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const q = searchParams.get("q") || undefined
  const sort = (searchParams.get("sort") as any) || "trending"

  const clearSearch = () => {
    router.push("/")
  }

  const promptsData = useQuery(api.prompts.list, {
    q,
    sort,
    limit: 24
  })

  const user = useQuery(api.users.me)
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

            {/* Search Results Header */}
            {q && (
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Search results for "{q}"
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {prompts?.length || 0} prompt{prompts?.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSearch}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear search
                </Button>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {prompts?.map((prompt: any) => (
                <PromptCard
                  key={prompt._id}
                  id={prompt._id}
                  slug={prompt.slug}
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
                  isSignedIn={isSignedIn}
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
