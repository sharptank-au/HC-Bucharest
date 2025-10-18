"use client"

import { useState, useEffect } from "react"
import { Copy, Heart, Eye, Volume2, VolumeX, ArrowLeft, Globe, Lock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PromptDetailProps {
  prompt: {
    id: string
    title: string
    prompt: string
    creator: {
      name: string
      avatar: string
    }
    createdAt: string
    categories: string[]
    videoUrl?: string
    copyCount: number
    upvotes: number
    views: number
    notes?: string
    metadata?: {
      aspectRatio?: string
      duration?: string
      camera?: string
      seed?: string
      model?: string
    }
  }
  isOwner?: boolean
  initialStatus?: "public" | "private"
}

export function PromptDetail({ prompt, isOwner = false, initialStatus = "public" }: PromptDetailProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [localCopyCount, setLocalCopyCount] = useState(prompt.copyCount)
  const [localUpvotes, setLocalUpvotes] = useState(prompt.upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [status, setStatus] = useState<"public" | "private">(initialStatus)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const copyMutation = useMutation(api.events.copy)
  const voteMutation = useMutation(api.votes.toggle)
  const viewMutation = useMutation(api.events.view)

  // Track view when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        const { ipHash } = await fetch("/api/iphash").then((r) => r.json())
        await viewMutation({ promptId: prompt.id as any, ipHash })
      } catch (error) {
        console.error("Failed to track view:", error)
      }
    }
    trackView()
  }, [prompt.id, viewMutation])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt)
    setLocalCopyCount((prev) => prev + 1)

    // Track copy in Convex
    try {
      const { ipHash } = await fetch("/api/iphash").then((r) => r.json())
      await copyMutation({ promptId: prompt.id as any, ipHash })
    } catch (error) {
      console.error("Failed to log copy:", error)
    }

    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
      duration: 2000,
    })
  }

  const handleUpvote = async () => {
    if (!hasUpvoted) {
      try {
        // For now, use a placeholder user ID - this will be replaced with real auth
        const fakeUserId = prompt.id // placeholder
        const { delta } = await voteMutation({ promptId: prompt.id as any, userId: fakeUserId as any })
        setLocalUpvotes((prev) => prev + delta)
        setHasUpvoted(delta > 0)

        toast({
          title: "Upvoted!",
          description: "Thanks for your support",
          duration: 2000,
        })
      } catch (error) {
        console.error("Failed to vote:", error)
        toast({
          title: "Error",
          description: "Failed to vote. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleStatusToggle = () => {
    const newStatus = status === "public" ? "private" : "public"
    setStatus(newStatus)
    toast({
      title: "Status updated",
      description: `Prompt is now ${newStatus}`,
      duration: 2000,
    })
  }

  const handleDelete = () => {
    toast({
      title: "Prompt deleted",
      description: "Your prompt has been permanently deleted",
      duration: 2000,
    })
    router.push("/submissions")
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to prompts
          </Link>
        </Button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              className="border-border hover:bg-secondary bg-transparent"
            >
              {status === "public" ? (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Private
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4 text-balance">{prompt.title}</h1>

            {/* Creator */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prompt.creator.avatar || "/placeholder.svg"} alt={prompt.creator.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{prompt.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{prompt.creator.name}</p>
                <p className="text-sm text-muted-foreground">{prompt.createdAt}</p>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.categories.map((category) => (
                <Badge key={category} className="bg-primary text-primary-foreground">
                  {category}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Copy className="h-4 w-4" />
                <span>{localCopyCount} copies</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{localUpvotes} upvotes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{prompt.views} views</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger
                value="prompt"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Prompt
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Usage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <p className="text-foreground leading-relaxed mb-4 text-pretty">{prompt.prompt}</p>
                  <Button
                    onClick={handleCopy}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Prompt
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <p className="text-foreground leading-relaxed text-pretty">
                    {prompt.notes || "No additional notes provided for this prompt."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  {prompt.metadata ? (
                    <dl className="space-y-3">
                      {prompt.metadata.model && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="font-medium text-muted-foreground">Model</dt>
                          <dd className="text-foreground">{prompt.metadata.model}</dd>
                        </div>
                      )}
                      {prompt.metadata.aspectRatio && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="font-medium text-muted-foreground">Aspect Ratio</dt>
                          <dd className="text-foreground">{prompt.metadata.aspectRatio}</dd>
                        </div>
                      )}
                      {prompt.metadata.duration && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="font-medium text-muted-foreground">Duration</dt>
                          <dd className="text-foreground">{prompt.metadata.duration}</dd>
                        </div>
                      )}
                      {prompt.metadata.camera && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <dt className="font-medium text-muted-foreground">Camera Movement</dt>
                          <dd className="text-foreground">{prompt.metadata.camera}</dd>
                        </div>
                      )}
                      {prompt.metadata.seed && (
                        <div className="flex justify-between py-2">
                          <dt className="font-medium text-muted-foreground">Seed</dt>
                          <dd className="text-foreground font-mono">{prompt.metadata.seed}</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">No metadata available for this prompt.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpvote}
              variant={hasUpvoted ? "default" : "outline"}
              className={`flex-1 ${hasUpvoted ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"
                }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${hasUpvoted ? "fill-current" : ""}`} />
              {hasUpvoted ? "Upvoted" : "Upvote"}
            </Button>
          </div>
        </div>

        {/* Right: Video */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="overflow-hidden bg-card border-border">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-secondary">
                {prompt.videoUrl ? (
                  <>
                    <video
                      src={prompt.videoUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-foreground" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-foreground" />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No video available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
