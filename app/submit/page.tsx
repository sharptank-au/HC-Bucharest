"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { slugify } from "@/lib/slug"

export default function SubmitPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [promptType, setPromptType] = useState<"public" | "private">("public")
  const [metadata, setMetadata] = useState({
    aspectRatio: "",
    duration: "",
    camera: "",
    seed: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Get categories from Convex
  const categories = useQuery(api.categories.list) || []
  const createPrompt = useMutation(api.prompts.create)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !prompt) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and prompt",
        variant: "destructive",
      })
      return
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Categories required",
        description: "Please select at least one category",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Generate slug from title
      const baseSlug = slugify(title)
      const slug = baseSlug

      // Map category names to IDs
      const categoryIds = selectedCategories
        .map(catName => categories.find(cat => cat.name === catName)?._id)
        .filter(Boolean) as any[]

      if (categoryIds.length === 0) {
        throw new Error("Invalid categories selected")
      }

      // Prepare metadata
      const meta = {
        aspectRatio: metadata.aspectRatio || undefined,
        duration: metadata.duration || undefined,
        camera: metadata.camera || undefined,
        seed: metadata.seed || undefined,
      }

      // Submit to Convex
      await createPrompt({
        title: title.trim(),
        prompt: prompt.trim(),
        videoUrl: videoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        meta: Object.keys(meta).some(key => meta[key as keyof typeof meta]) ? meta : undefined,
        categoryIds,
        slug,
      })

      toast({
        title: "Prompt submitted!",
        description: "Your prompt has been added to the library",
      })

      // Navigate back to home
      router.push("/")
    } catch (error) {
      console.error("Failed to submit prompt:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto py-8 px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Submit a Prompt</h1>
          <p className="text-lg text-muted-foreground">Share your AI prompt with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground text-base">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prompt a catchy title"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
              required
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-foreground text-base">
              Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your full AI prompt here..."
              className="min-h-40 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-base"
              required
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-foreground text-base">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category._id}
                  variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors text-sm py-1.5 px-3 ${selectedCategories.includes(category.name)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
                    }`}
                  onClick={() => toggleCategory(category.name)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-foreground text-base">Prompt Type</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPromptType("public")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${promptType === "public"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                  }`}
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setPromptType("private")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${promptType === "private"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                  }`}
              >
                <Lock className="h-5 w-5" />
                <span className="font-medium">Private</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {promptType === "public"
                ? "Your prompt will be visible to everyone in the library"
                : "Only you can see this prompt in your submissions"}
            </p>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-foreground text-base">
              Video URL
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://... (Sora-2 result link)"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground text-base">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share tips or insights about this prompt..."
              className="min-h-32 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <Label className="text-foreground text-base">Metadata (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio" className="text-sm text-muted-foreground">
                  Aspect Ratio
                </Label>
                <Select
                  value={metadata.aspectRatio}
                  onValueChange={(value) => setMetadata({ ...metadata, aspectRatio: value })}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground h-11">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm text-muted-foreground">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={metadata.duration}
                  onChange={(e) => setMetadata({ ...metadata, duration: e.target.value })}
                  placeholder="e.g., 5 seconds"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camera" className="text-sm text-muted-foreground">
                  Camera Movement
                </Label>
                <Input
                  id="camera"
                  value={metadata.camera}
                  onChange={(e) => setMetadata({ ...metadata, camera: e.target.value })}
                  placeholder="e.g., Slow pan"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seed" className="text-sm text-muted-foreground">
                  Seed
                </Label>
                <Input
                  id="seed"
                  value={metadata.seed}
                  onChange={(e) => setMetadata({ ...metadata, seed: e.target.value })}
                  placeholder="e.g., 42"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1 border-border text-foreground hover:bg-secondary h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Prompt"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
