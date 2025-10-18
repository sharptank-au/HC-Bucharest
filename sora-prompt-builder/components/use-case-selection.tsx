"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePromptStore } from "@/lib/prompt-store"

// Import the presets (in a real app, these would be imported from the lib files)
const usecasePresets = {
  advertisements: {
    id: "advertisements",
    title: "Advertisements",
    description: "High energy cuts, motion text, voiceover pacing",
    icon: "📺",
    variants: {
      modern_product_ad: {
        id: "modern_product_ad",
        title: "Modern Product Advertisement",
        aspectRatio: "16:9" as const,
        tone: "Cinematic / Premium",
      },
      vintage_90s_ad: {
        id: "vintage_90s_ad",
        title: "90s Tech Commercial",
        aspectRatio: "4:3" as const,
        tone: "Retro / Infomercial",
      },
      chaotic_japanese_ad: {
        id: "chaotic_japanese_ad",
        title: "Chaotic Japanese Ad",
        aspectRatio: "16:9" as const,
        tone: "Hyper / Maximalist",
      },
    },
  },
  app_promotions: {
    id: "app_promotions",
    title: "App Promotions",
    description: "Vertical aspect ratio, upbeat tone, human actors",
    icon: "📱",
    variants: {
      tiktok_app_demo: {
        id: "tiktok_app_demo",
        title: "TikTok-Style App Demo",
        aspectRatio: "9:16" as const,
        tone: "Upbeat / Conversational",
      },
      ui_showcase: {
        id: "ui_showcase",
        title: "UI Showcase",
        aspectRatio: "16:9" as const,
        tone: "Clean / Explanatory",
      },
    },
  },
  company_promos: {
    id: "company_promos",
    title: "Company / Industrial Promos",
    description: "Professional voiceover, cinematic montage, brand tone",
    icon: "🏢",
    variants: {
      b2b_industrial: {
        id: "b2b_industrial",
        title: "B2B Tech / Industrial",
        aspectRatio: "16:9" as const,
        tone: "Professional / Credible",
      },
    },
  },
  product_commercials: {
    id: "product_commercials",
    title: "Product Commercials",
    description: "Macro shots, slow pans, lighting emphasis",
    icon: "📦",
    variants: {
      tech_product: {
        id: "tech_product",
        title: "Tech Product",
        aspectRatio: "16:9" as const,
        tone: "Moody / Premium",
      },
      furniture_lifestyle: {
        id: "furniture_lifestyle",
        title: "Furniture / Lifestyle",
        aspectRatio: "16:9" as const,
        tone: "Comfort / Tactile",
      },
    },
  },
  live_news_ted: {
    id: "live_news_ted",
    title: "Live / News / TED",
    description: "Realistic camera jitter, authentic dialogue tone",
    icon: "🎙️",
    variants: {
      livestream_sim: {
        id: "livestream_sim",
        title: "Livestream Simulation",
        aspectRatio: "9:16" as const,
        tone: "Raw / Spontaneous",
      },
      ted_talk: {
        id: "ted_talk",
        title: "TED Talk",
        aspectRatio: "16:9" as const,
        tone: "Thoughtful / Inspirational",
      },
      news_segment: {
        id: "news_segment",
        title: "News Segment",
        aspectRatio: "16:9" as const,
        tone: "Authoritative / Breaking",
      },
    },
  },
  social_pov: {
    id: "social_pov",
    title: "Social / POV",
    description: "Handheld feel, dynamic angles, personal tone",
    icon: "🤳",
    variants: {
      selfie_vlog: {
        id: "selfie_vlog",
        title: "Selfie Vlog",
        aspectRatio: "9:16" as const,
        tone: "Personal / Casual",
      },
      bodycam_security: {
        id: "bodycam_security",
        title: "Body Cam / Security Footage",
        aspectRatio: "16:9" as const,
        tone: "Gritty / Realistic",
      },
    },
  },
  concept_games: {
    id: "concept_games",
    title: "Concept Games & Demos",
    description: "3D-like render, game UI overlay, sound design",
    icon: "🎮",
    variants: {
      gameplay_trailer: {
        id: "gameplay_trailer",
        title: "Gameplay Trailer (Concept)",
        aspectRatio: "16:9" as const,
        tone: "Epic / Kinetic",
      },
    },
  },
  entertainment_parody: {
    id: "entertainment_parody",
    title: "Entertainment / Parody",
    description: "Dialogue-driven, comedic, stylized realism",
    icon: "🎭",
    variants: {
      tv_show_scene: {
        id: "tv_show_scene",
        title: "TV Show Scene",
        aspectRatio: "16:9" as const,
        tone: "Dramatic / Reality",
      },
      ai_episode_cartoon: {
        id: "ai_episode_cartoon",
        title: "AI Episode / Cartoon",
        aspectRatio: "16:9" as const,
        tone: "Comedic / Meta",
      },
    },
  },
  creative_experiments: {
    id: "creative_experiments",
    title: "Creative Experiments",
    description: "Novel camera perspectives, humor-driven pacing",
    icon: "🔬",
    variants: {
      doorbell_cam: {
        id: "doorbell_cam",
        title: "Doorbell / Fisheye Camera",
        aspectRatio: "16:9" as const,
        tone: "Quirky / Situational",
      },
      fake_live_event: {
        id: "fake_live_event",
        title: "Fake Live Spectacle",
        aspectRatio: "9:16" as const,
        tone: "Spectacle / Viral",
      },
    },
  },
  custom: {
    id: "custom",
    title: "Custom Use Case",
    description: "Start from scratch with full creative control",
    icon: "✨",
    variants: {},
  },
}

interface UseCaseSelectionProps {
  onNext: () => void
}

export function UseCaseSelection({ onNext }: UseCaseSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const setUseCase = usePromptStore((state) => state.setUseCase)

  const handleContinue = () => {
    if (selectedCategory === "custom") {
      setUseCase("custom", "Custom Use Case", "Custom", "16:9")
      onNext()
      return
    }

    if (selectedCategory && selectedVariant) {
      const category = usecasePresets[selectedCategory as keyof typeof usecasePresets]
      const variant = category.variants[selectedVariant as keyof typeof category.variants]
      setUseCase(variant.id, variant.title, variant.tone, variant.aspectRatio)
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Choose Your Use Case</h2>
        <p className="text-lg text-muted-foreground">Select a video style to get started with optimized presets</p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Custom Use Case Option */}
        <Card
          className={`group cursor-pointer border-2 p-6 transition-all hover:border-accent ${
            selectedCategory === "custom" ? "border-accent bg-accent/5" : "border-border"
          }`}
          onClick={() => {
            setSelectedCategory("custom")
            setSelectedVariant(null)
          }}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-3xl">✨</span>
              {selectedCategory === "custom" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <svg className="h-3 w-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Custom Use Case</h3>
              <p className="mt-1 text-sm text-muted-foreground">Start from scratch with full creative control</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Build your own
            </Badge>
          </div>
        </Card>

        {Object.entries(usecasePresets).map(
          ([key, category]) =>
            key !== "custom" && (
              <Card
                key={key}
                className={`group cursor-pointer border-2 p-6 transition-all hover:border-accent ${
                  selectedCategory === key ? "border-accent bg-accent/5" : "border-border"
                }`}
                onClick={() => {
                  setSelectedCategory(key)
                  setSelectedVariant(null)
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{category.icon}</span>
                    {selectedCategory === key && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                        <svg
                          className="h-3 w-3 text-accent-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(category.variants).length} variant
                    {Object.keys(category.variants).length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </Card>
            ),
        )}
      </div>

      {/* Variants Selection */}
      {selectedCategory && selectedCategory !== "custom" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-semibold text-foreground">Select a Variant</h3>
            <p className="mt-1 text-sm text-muted-foreground">Choose the specific style for your video</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(usecasePresets[selectedCategory as keyof typeof usecasePresets].variants).map(
              ([key, variant]) => (
                <Card
                  key={key}
                  className={`cursor-pointer border-2 p-4 transition-all hover:border-accent ${
                    selectedVariant === key ? "border-accent bg-accent/5" : "border-border"
                  }`}
                  onClick={() => setSelectedVariant(key)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{variant.title}</h4>
                      {selectedVariant === key && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                          <svg
                            className="h-2.5 w-2.5 text-accent-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {variant.aspectRatio}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{variant.tone}</span>
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {(selectedVariant || selectedCategory === "custom") && (
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button size="lg" onClick={handleContinue} className="min-w-[200px]">
            Continue to Context
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
