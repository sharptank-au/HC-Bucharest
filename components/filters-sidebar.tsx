"use client"

import { useState } from "react"
import { Filter, ArrowUpDown, Grid3x3, Video, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"

const categories = [
  { name: "Nature", count: 234 },
  { name: "Urban", count: 189 },
  { name: "Abstract", count: 156 },
  { name: "Animals", count: 143 },
  { name: "Technology", count: 98 },
  { name: "Fantasy", count: 87 },
]

function FilterContent({ isMobile = false }: { isMobile?: boolean }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [hasVideo, setHasVideo] = useState(false)
  const [myFavorites, setMyFavorites] = useState(false)

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">Sort by</Label>
        </div>
        <Select defaultValue="trending">
          <SelectTrigger className="bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="most-copied">Most Copied</SelectItem>
            <SelectItem value="most-upvoted">Most Upvoted</SelectItem>
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
              key={category.name}
              variant={selectedCategories.includes(category.name) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${isMobile ? "w-full justify-start" : ""} ${
                selectedCategories.includes(category.name)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
              }`}
              onClick={() => toggleCategory(category.name)}
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
            checked={hasVideo}
            onCheckedChange={(checked) => setHasVideo(checked as boolean)}
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
            onCheckedChange={(checked) => setMyFavorites(checked as boolean)}
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
          onClick={() => {
            setSelectedCategories([])
            setHasVideo(false)
            setMyFavorites(false)
          }}
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
