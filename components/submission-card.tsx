"use client"

import { useState } from "react"
import { Copy, Heart, ExternalLink, Play, Volume2, VolumeX, Trash2, Globe, Lock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SubmissionCardProps {
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
  status: "public" | "private"
  onDelete: (id: string) => void
  onStatusToggle: (id: string) => void
}

export function SubmissionCard({
  id,
  title,
  prompt,
  creator,
  createdAt,
  categories,
  videoUrl,
  copyCount,
  upvotes,
  status,
  onDelete,
  onStatusToggle,
}: SubmissionCardProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [localCopyCount, setLocalCopyCount] = useState(copyCount)
  const [localUpvotes, setLocalUpvotes] = useState(upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setLocalCopyCount((prev) => prev + 1)
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
      duration: 2000,
    })
  }

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setLocalUpvotes((prev) => prev + 1)
      setHasUpvoted(true)
    }
  }

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-secondary overflow-hidden">
          {videoUrl ? (
            <>
              <video src={videoUrl} autoPlay loop muted={isMuted} playsInline className="w-full h-full object-cover" />
              <button
                onClick={() => onStatusToggle(id)}
                className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10 flex items-center gap-1.5 text-xs font-medium"
              >
                {status === "public" ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">Private</span>
                  </>
                )}
              </button>
              <button
                onClick={() => onDelete(id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/90 hover:text-destructive-foreground transition-colors z-10 group/delete"
              >
                <Trash2 className="h-4 w-4 text-destructive group-hover/delete:text-destructive-foreground" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-foreground" />
                )}
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
              <button
                onClick={() => onStatusToggle(id)}
                className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10 flex items-center gap-1.5 text-xs font-medium"
              >
                {status === "public" ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">Private</span>
                  </>
                )}
              </button>
              <button
                onClick={() => onDelete(id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/90 hover:text-destructive-foreground transition-colors z-10 group/delete"
              >
                <Trash2 className="h-4 w-4 text-destructive group-hover/delete:text-destructive-foreground" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{creator.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {creator.name} · {createdAt}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-1 text-balance">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{prompt}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
              >
                <Copy className="h-4 w-4 mr-1.5" />
                {localCopyCount}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Copy prompt</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpvote}
                className={`flex-1 border-border hover:bg-secondary ${
                  hasUpvoted ? "text-primary border-primary" : "text-foreground"
                }`}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${hasUpvoted ? "fill-primary" : ""}`} />
                {localUpvotes}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>Upvote</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-border text-foreground hover:bg-secondary bg-transparent"
              >
                <Link href={`/p/${id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>View details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}
