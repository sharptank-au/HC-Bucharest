"use client";

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { FiltersSidebar } from "@/components/filters-sidebar"
import { PromptCard } from "@/components/prompt-card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Id } from "@/convex/_generated/dataModel"

interface FilterState {
  selectedCategories: Id<"categories">[]
  sort: string
  hasVideo: boolean
  myFavorites: boolean
}

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const q = searchParams.get("q") || undefined
  const sort = searchParams.get("sort") || "trending"
  
  // Parse category IDs from URL
  const categoryParam = searchParams.get("categories")
  const selectedCategories = categoryParam 
    ? categoryParam.split(",").filter(Boolean) as Id<"categories">[]
    : []

  const [filterState, setFilterState] = useState<FilterState>({
    selectedCategories,
    sort,
    hasVideo: false,
    myFavorites: false
  })

  // Update URL when filters change
  const updateURL = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filterState, ...newFilters }
    const params = new URLSearchParams(searchParams.toString())
    
    if (updatedFilters.selectedCategories.length > 0) {
      params.set("categories", updatedFilters.selectedCategories.join(","))
    } else {
      params.delete("categories")
    }
    
    if (updatedFilters.sort !== "trending") {
      params.set("sort", updatedFilters.sort)
    } else {
      params.delete("sort")
    }
    
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }))
    updateURL(newFilters)
  }

  // Fetch categories and prompts
  const categoriesData = useQuery(api.categories.listWithCounts)
  const promptsData = useQuery(api.prompts.list, {
    q,
    categoryIds: filterState.selectedCategories.length > 0 ? filterState.selectedCategories : undefined,
    sort: filterState.sort,
    limit: 24
  })

  const prompts = promptsData?.items
  const categories = categoriesData || []
  const isLoading = promptsData === undefined || categoriesData === undefined

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-[1600px] mx-auto px-4 md:px-6 py-8">
          <div className="flex gap-8">
            <FiltersSidebar 
              categories={categories}
              filterState={filterState}
              onFilterChange={handleFilterChange}
            />
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
          <FiltersSidebar 
            categories={categories}
            filterState={filterState}
            onFilterChange={handleFilterChange}
          />

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
                  categories={prompt.categoryIds.map((catId: Id<"categories">) => 
                    categories.find(cat => cat._id === catId)?.name || ""
                  ).filter(Boolean)}
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
