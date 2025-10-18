"use client"

import { PromptCard } from "./prompt-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface RelatedPromptsProps {
  prompts: Array<{
    id: string
    slug: string
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
  }>
}

export function RelatedPrompts({ prompts }: RelatedPromptsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Related Prompts</h2>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {prompts.map((prompt) => (
            <CarouselItem key={prompt.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <PromptCard {...prompt} isSignedIn={false} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-secondary border-border text-foreground hover:bg-secondary/80" />
        <CarouselNext className="bg-secondary border-border text-foreground hover:bg-secondary/80" />
      </Carousel>
    </div>
  )
}
