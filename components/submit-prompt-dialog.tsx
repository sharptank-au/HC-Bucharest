"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const availableCategories = ["Nature", "Urban", "Abstract", "Animals", "Technology", "Fantasy", "Cinematic", "Portrait"]

export function SubmitPromptDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [metadata, setMetadata] = useState({
    aspectRatio: "",
    duration: "",
    camera: "",
    seed: "",
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !prompt) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and prompt",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would submit to an API
    toast({
      title: "Prompt submitted!",
      description: "Your prompt has been added to the library",
    })

    // Reset form
    setTitle("")
    setPrompt("")
    setVideoUrl("")
    setNotes("")
    setSelectedCategories([])
    setMetadata({ aspectRatio: "", duration: "", camera: "", seed: "" })
    setOpen(false)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const addNewCategory = () => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      setSelectedCategories((prev) => [...prev, newCategory])
      setNewCategory("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Submit a Prompt</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your AI prompt with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prompt a catchy title"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-foreground">
              Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your full AI video prompt here..."
              className="min-h-32 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-foreground">Categories</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${selectedCategories.includes(category)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
                    }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add custom category"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addNewCategory()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addNewCategory}
                className="border-border text-foreground hover:bg-secondary bg-transparent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-foreground">
              Video URL
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://... (Sora-2 result link)"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share tips or insights about this prompt..."
              className="min-h-24 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <Label className="text-foreground">Metadata (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio" className="text-sm text-muted-foreground">
                  Aspect Ratio
                </Label>
                <Select
                  value={metadata.aspectRatio}
                  onValueChange={(value) => setMetadata({ ...metadata, aspectRatio: value })}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground">
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
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
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
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
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
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Prompt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
