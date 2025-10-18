"use client"

import { useState } from "react"
import { PromptCard } from "@/components/prompt-card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const mockFavorites = [
  {
    id: "1",
    slug: "cinematic-portrait",
    title: "Cinematic Portrait",
    prompt: "A cinematic portrait of a woman with flowing hair in golden hour lighting...",
    videoUrl: "/diverse-woman-portrait.png",
    creator: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2 days ago",
    categories: ["Portrait", "Cinematic"],
    copyCount: 45,
    upvotes: 234,
  },
  {
    id: "2",
    slug: "urban-exploration",
    title: "Urban Exploration",
    prompt: "A man walking through a neon-lit cyberpunk city at night...",
    videoUrl: "/man.jpg",
    creator: {
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "5 days ago",
    categories: ["Urban", "Cyberpunk"],
    copyCount: 32,
    upvotes: 189,
  },
  {
    id: "3",
    slug: "nature-documentary",
    title: "Nature Documentary",
    prompt: "A woman observing wildlife in a lush rainforest environment...",
    videoUrl: "/woman-2.jpg",
    creator: {
      name: "Maria Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "1 week ago",
    categories: ["Nature", "Documentary"],
    copyCount: 28,
    upvotes: 156,
  },
]

export default function FavoritesPage() {
  const [isSignedIn, setIsSignedIn] = useState(true) // Mock auth state
  const [favorites, setFavorites] = useState(mockFavorites)

  // Handle removing from favorites
  const handleUnlike = (id: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 py-16 md:px-6">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Sign in to view favorites</h1>
            <p className="text-muted-foreground">
              Create an account or sign in to save your favorite prompts and access them anytime.
            </p>
            <Button
              onClick={() => setIsSignedIn(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Empty favorites state
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 py-16 md:px-6">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-3xl font-bold text-foreground">No favorites yet</h1>
            <p className="text-muted-foreground">
              Start exploring prompts and click the heart icon to save your favorites here.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="/">Browse Prompts</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Favorites grid
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "prompt" : "prompts"} saved
          </p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              slug={prompt.slug || prompt.id} // Use slug if available, fallback to id
              title={prompt.title}
              prompt={prompt.prompt}
              creator={prompt.creator}
              createdAt={prompt.createdAt}
              categories={prompt.categories}
              videoUrl={prompt.videoUrl}
              copyCount={prompt.copyCount}
              upvotes={prompt.upvotes}
              isSignedIn={isSignedIn}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
