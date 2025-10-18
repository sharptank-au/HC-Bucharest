// Type definitions for Sora Prompt Builder

export type AspectRatio = "16:9" | "9:16" | "1:1"

export type OutputFormat = "text" | "json"

export interface Shot {
  index: number
  start_sec: number
  duration_sec: number
  description: string
  camera: string
  overlays: string[]
  notes?: string
}

export interface DialogueLine {
  order: number
  speaker: string
  text: string
}

export interface ContextSelection {
  grade?: string
  lighting?: string
  location?: string
  wardrobe?: string
  sound?: string
}

export interface PromptData {
  useCase: {
    id: string
    title: string
    aspectRatio: AspectRatio
    tone: string
  }
  mode: {
    highLevel: boolean
    detailedShots: boolean
  }
  highLevelDescription: string
  context: ContextSelection
  shots: Shot[]
  dialogue: DialogueLine[]
  aspectRatio: AspectRatio
}
