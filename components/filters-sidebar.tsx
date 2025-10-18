"use client"

import { useState, useEffect } from "react"
import { Filter, ArrowUpDown, Grid3x3, Video, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, useSearchParams } from "next/navigation"

function FilterContent({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get categories from Convex
  const categories = useQuery(api.categories.list) || []

  // Get current filter values from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [hasVideo, setHasVideo] = useState(false)
  const [myFavorites, setMyFavorites] = useState(false)
  const [sort, setSort] = useState(searchParams.get("sort") || "trending")

  // Update URL when filters change
  const updateURL = (newFilters: {
    categories?: string[]
    hasVideo?: boolean
    myFavorites?: boolean
    sort?: string
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newFilters.categories !== undefined) {
      if (newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","))
      } else {
        params.delete("categories")
      }
    }

    if (newFilters.hasVideo !== undefined) {
      if (newFilters.hasVideo) {
        params.set("hasVideo", "true")
      } else {
        params.delete("hasVideo")
      }
    }

    if (newFilters.myFavorites !== undefined) {
      if (newFilters.myFavorites) {
        params.set("myFavorites", "true")
      } else {
        params.delete("myFavorites")
      }
    }

    if (newFilters.sort !== undefined) {
      params.set("sort", newFilters.sort)
    }

    router.push(`/?${params.toString()}`)
  }

  // Initialize filters from URL on mount
  useEffect(() => {
    const categoriesParam = searchParams.get("categories")
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(","))
    }
    setHasVideo(searchParams.get("hasVideo") === "true")
    setMyFavorites(searchParams.get("myFavorites") === "true")
    setSort(searchParams.get("sort") || "trending")
  }, [searchParams])

  const toggleCategory = (categoryName: string) => {
    const newCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter((c) => c !== categoryName)
      : [...selectedCategories, categoryName]

    setSelectedCategories(newCategories)
    updateURL({ categories: newCategories })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    updateURL({ sort: newSort })
  }

  const handleHasVideoChange = (checked: boolean) => {
    setHasVideo(checked)
    updateURL({ hasVideo: checked })
  }

  const handleMyFavoritesChange = (checked: boolean) => {
    setMyFavorites(checked)
    updateURL({ myFavorites: checked })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setHasVideo(false)
    setMyFavorites(false)
    setSort("trending")
    router.push("/")
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">Sort by</Label>
        </div>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="most_copied">Most Copied</SelectItem>
            <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">Categories</Label>
        </div>
        <div className={isMobile ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
          {categories.map((category) => (
            <Badge
              key={category._id}
              variant={selectedCategories.includes(category.name) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${isMobile ? "w-full justify-start" : ""} ${selectedCategories.includes(category.name)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
                }`}
              onClick={() => toggleCategory(category.name)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-video"
            checked={hasVideo}
            onCheckedChange={handleHasVideoChange}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Video className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="has-video" className="text-sm font-normal cursor-pointer text-foreground">
            Has video
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="my-favorites"
            checked={myFavorites}
            onCheckedChange={handleMyFavoritesChange}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Heart className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="my-favorites" className="text-sm font-normal cursor-pointer text-foreground">
            My favorites
          </Label>
        </div>
      </div>

      {/* Clear filters */}
      {(selectedCategories.length > 0 || hasVideo || myFavorites) && (
        <Button
          variant="outline"
          className="w-full border-border text-foreground hover:bg-secondary bg-transparent"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}

export function FiltersSidebar() {
  return (
    <>
      {/* Mobile: Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-background border-border w-[300px] sm:w-[350px] px-6">
            <SheetHeader className="flex flex-row items-center justify-between">
              <SheetTitle className="text-foreground">Filters</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <FilterContent isMobile={false} />
        </div>
      </aside>
    </>
  )
}
