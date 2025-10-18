import { Header } from "@/components/header"
import { FiltersSidebar } from "@/components/filters-sidebar"
import { PromptCard } from "@/components/prompt-card"

// Mock data
const mockPrompts = [
  {
    id: "1",
    title: "Cinematic Ocean Sunset",
    prompt:
      "A breathtaking cinematic shot of a golden sunset over a calm ocean, with gentle waves reflecting the warm orange and pink hues of the sky. Camera slowly pans across the horizon.",
    creator: {
      name: "Sarah Chen",
      avatar: "/diverse-woman-portrait.png",
    },
    createdAt: "2 hours ago",
    categories: ["Nature", "Cinematic"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    copyCount: 234,
    upvotes: 189,
  },
  {
    id: "2",
    title: "Futuristic City Night",
    prompt:
      "A sprawling futuristic cityscape at night with neon lights, flying vehicles, and towering skyscrapers. Rain falls gently, creating reflections on the wet streets below.",
    creator: {
      name: "Alex Rivera",
      avatar: "/man.jpg",
    },
    createdAt: "5 hours ago",
    categories: ["Urban", "Technology", "Fantasy"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    copyCount: 456,
    upvotes: 312,
  },
  {
    id: "3",
    title: "Abstract Particle Flow",
    prompt:
      "Mesmerizing abstract visualization of colorful particles flowing and swirling in space, creating organic patterns and shapes. Smooth camera movement follows the flow.",
    creator: {
      name: "Maya Patel",
      avatar: "/woman-2.jpg",
    },
    createdAt: "1 day ago",
    categories: ["Abstract", "Technology"],
    copyCount: 178,
    upvotes: 145,
  },
  {
    id: "4",
    title: "Wildlife in Forest",
    prompt:
      "A majestic deer walking through a misty forest at dawn, sunlight filtering through the trees creating god rays. Peaceful and serene atmosphere with natural sounds.",
    creator: {
      name: "James Wilson",
      avatar: "/man-2.jpg",
    },
    createdAt: "1 day ago",
    categories: ["Nature", "Animals"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    copyCount: 289,
    upvotes: 234,
  },
  {
    id: "5",
    title: "Cosmic Journey",
    prompt:
      "A journey through space passing by colorful nebulas, distant galaxies, and twinkling stars. Camera moves smoothly through the cosmic landscape.",
    creator: {
      name: "Emma Thompson",
      avatar: "/woman-3.jpg",
    },
    createdAt: "2 days ago",
    categories: ["Abstract", "Fantasy"],
    copyCount: 567,
    upvotes: 423,
  },
  {
    id: "6",
    title: "Urban Street Life",
    prompt:
      "Bustling city street scene with people walking, cars passing by, and vibrant storefronts. Golden hour lighting creates long shadows and warm atmosphere.",
    creator: {
      name: "David Kim",
      avatar: "/man-3.jpg",
    },
    createdAt: "3 days ago",
    categories: ["Urban"],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    copyCount: 345,
    upvotes: 267,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          <FiltersSidebar />

          <div className="flex-1">
            {/* Mobile filter button is inside FiltersSidebar */}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockPrompts.map((prompt) => (
                <PromptCard key={prompt.id} {...prompt} isSignedIn={false} />
              ))}
            </div>

            {/* Empty state would go here if no results */}
          </div>
        </div>
      </main>
    </div>
  )
}
