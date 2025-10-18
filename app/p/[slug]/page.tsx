import { Header } from "@/components/header"
import { PromptDetail } from "@/components/prompt-detail"
import { RelatedPrompts } from "@/components/related-prompts"

// Mock data - in a real app this would come from a database
const mockPromptData = {
  id: "1",
  slug: "cinematic-ocean-sunset",
  title: "Cinematic Ocean Sunset",
  prompt:
    "A breathtaking cinematic shot of a golden sunset over a calm ocean, with gentle waves reflecting the warm orange and pink hues of the sky. The camera slowly pans across the horizon, capturing the serene beauty of the moment. Seagulls fly in the distance, and the sound of waves creates a peaceful atmosphere. The lighting is soft and warm, creating a dreamy, ethereal quality to the scene.",
  creator: {
    name: "Sarah Chen",
    avatar: "/diverse-woman-portrait.png",
  },
  createdAt: "2 hours ago",
  categories: ["Nature", "Cinematic"],
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  copyCount: 234,
  upvotes: 189,
  views: 1247,
  notes:
    "This prompt works best with Sora-2. Try adjusting the time of day for different moods. The panning motion creates a cinematic feel that's perfect for establishing shots.",
  metadata: {
    aspectRatio: "16:9",
    duration: "5 seconds",
    camera: "Slow pan left to right",
    seed: "42",
    model: "Sora-2",
  },
}

const relatedPrompts = [
  {
    id: "2",
    title: "Mountain Sunrise",
    prompt: "Epic mountain landscape at sunrise with fog rolling through valleys...",
    creator: { name: "Alex Rivera", avatar: "/man.jpg" },
    createdAt: "1 day ago",
    categories: ["Nature"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    copyCount: 156,
    upvotes: 123,
  },
  {
    id: "3",
    title: "Beach Waves Close-up",
    prompt: "Close-up shot of ocean waves crashing on a sandy beach...",
    creator: { name: "Maya Patel", avatar: "/woman-2.jpg" },
    createdAt: "2 days ago",
    categories: ["Nature"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    copyCount: 98,
    upvotes: 87,
  },
  {
    id: "4",
    title: "Coastal Cliffs Aerial",
    prompt: "Aerial drone shot of dramatic coastal cliffs at golden hour...",
    creator: { name: "James Wilson", avatar: "/man-2.jpg" },
    createdAt: "3 days ago",
    categories: ["Nature", "Cinematic"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    copyCount: 203,
    upvotes: 178,
  },
]

export default function PromptDetailPage({ params }: { params: { slug: string } }) {
  const isOwner = true // Set to true to test owner controls
  const promptStatus: "public" | "private" = "public"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <PromptDetail prompt={mockPromptData} isOwner={isOwner} initialStatus={promptStatus} />

        <div className="mt-12">
          <RelatedPrompts prompts={relatedPrompts} />
        </div>
      </main>
    </div>
  )
}
