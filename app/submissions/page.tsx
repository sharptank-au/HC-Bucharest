"use client"

import { useState } from "react"
import { SubmissionCard } from "@/components/submission-card"
import { Button } from "@/components/ui/button"
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
import { FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type Submission = {
  id: string
  title: string
  prompt: string
  videoUrl: string
  thumbnailUrl: string
  creator: {
    name: string
    avatar: string
  }
  upvotes: number
  categories: string[]
  createdAt: string
  copyCount: number
  views: number
  status: "public" | "private"
}

export default function SubmissionsPage() {
  const [isSignedIn] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const { toast } = useToast()

  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([
    {
      id: "1",
      title: "Cinematic Ocean Sunset",
      prompt:
        "A breathtaking cinematic shot of a golden sunset over a calm ocean, with gentle waves reflecting the warm orange and pink hues of the sky...",
      videoUrl: "/ocean-sunset.png",
      thumbnailUrl: "/ocean-sunset.png",
      creator: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      upvotes: 234,
      categories: ["Nature", "Cinematic"],
      createdAt: "2024-01-15",
      copyCount: 45,
      views: 1250,
      status: "public",
    },
    {
      id: "2",
      title: "Futuristic City Night",
      prompt: "A stunning aerial view of a futuristic city at night with neon lights and flying vehicles...",
      videoUrl: "/futuristic-cityscape.png",
      thumbnailUrl: "/futuristic-cityscape.png",
      creator: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      upvotes: 189,
      categories: ["Sci-Fi", "Urban"],
      createdAt: "2024-01-10",
      copyCount: 32,
      views: 890,
      status: "private",
    },
  ])

  const handleDeleteClick = (id: string) => {
    setSelectedSubmission(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedSubmission) {
      setUserSubmissions((prev) => prev.filter((submission) => submission.id !== selectedSubmission))
      toast({
        title: "Submission deleted",
        description: "Your prompt has been successfully deleted.",
      })
      setDeleteDialogOpen(false)
      setSelectedSubmission(null)
    }
  }

  const handleStatusToggle = (id: string) => {
    setUserSubmissions((prev) =>
      prev.map((submission) => {
        if (submission.id === id) {
          const newStatus = submission.status === "public" ? "private" : "public"
          toast({
            title: "Status updated",
            description: `Your prompt is now ${newStatus}.`,
          })
          return { ...submission, status: newStatus }
        }
        return submission
      }),
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Sign in to view your submissions</h2>
            <p className="text-muted-foreground">
              You need to be signed in to see the prompts you've submitted to the library.
            </p>
            <Button className="mt-4">Sign In</Button>
          </div>
        </div>
      </div>
    )
  }

  if (userSubmissions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">No submissions yet</h2>
            <p className="text-muted-foreground">
              You haven't submitted any prompts yet. Share your creative prompts with the community!
            </p>
            <Link href="/submit">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Prompt
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Submissions</h1>
            <p className="text-muted-foreground">
              {userSubmissions.length} {userSubmissions.length === 1 ? "prompt" : "prompts"} submitted
            </p>
          </div>
          <Link href="/submit">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Submit New Prompt
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSubmissions.map((prompt) => (
            <SubmissionCard
              key={prompt.id}
              {...prompt}
              onDelete={handleDeleteClick}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your prompt submission from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
