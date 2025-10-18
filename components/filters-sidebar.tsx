"use client"

import { Filter, ArrowUpDown, Grid3x3, Video, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Id } from "@/convex/_generated/dataModel"

interface Category {
  _id: Id<"categories">
  name: string
  slug: string
  count: number
}

interface FilterState {
  selectedCategories: Id<"categories">[]
  sort: string
  hasVideo: boolean
  myFavorites: boolean
}

interface FiltersSidebarProps {
  categories: Category[]
  filterState: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
}

function FilterContent({ 
  isMobile = false, 
  categories, 
  filterState, 
  onFilterChange 
}: { 
  isMobile?: boolean
  categories: Category[]
  filterState: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
}) {

  const toggleCategory = (categoryId: Id<"categories">) => {
    const newCategories = filterState.selectedCategories.includes(categoryId)
      ? filterState.selectedCategories.filter((id) => id !== categoryId)
      : [...filterState.selectedCategories, categoryId]
    
    onFilterChange({ selectedCategories: newCategories })
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">Sort by</Label>
        </div>
        <Select value={filterState.sort} onValueChange={(value) => onFilterChange({ sort: value })}>
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
              variant={filterState.selectedCategories.includes(category._id) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${isMobile ? "w-full justify-start" : ""} ${
                filterState.selectedCategories.includes(category._id)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
              }`}
              onClick={() => toggleCategory(category._id)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-video"
            checked={filterState.hasVideo}
            onCheckedChange={(checked) => onFilterChange({ hasVideo: checked as boolean })}
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
            checked={filterState.myFavorites}
            onCheckedChange={(checked) => onFilterChange({ myFavorites: checked as boolean })}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Heart className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="my-favorites" className="text-sm font-normal cursor-pointer text-foreground">
            My favorites
          </Label>
        </div>
      </div>

      {/* Clear filters */}
      {(filterState.selectedCategories.length > 0 || filterState.hasVideo || filterState.myFavorites) && (
        <Button
          variant="outline"
          className="w-full border-border text-foreground hover:bg-secondary bg-transparent"
          onClick={() => {
            onFilterChange({
              selectedCategories: [],
              hasVideo: false,
              myFavorites: false
            })
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}

export function FiltersSidebar({ categories, filterState, onFilterChange }: FiltersSidebarProps) {
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
              <FilterContent 
                isMobile={true} 
                categories={categories}
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <FilterContent 
            isMobile={false} 
            categories={categories}
            filterState={filterState}
            onFilterChange={onFilterChange}
          />
        </div>
      </aside>
    </>
  )
}
