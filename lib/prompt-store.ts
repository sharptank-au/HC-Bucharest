"use client"

import { create } from "zustand"
import type { PromptData, Shot, DialogueLine, AspectRatio } from "./types"

interface PromptStore extends PromptData {
    setUseCase: (id: string, title: string, tone: string, aspectRatio: AspectRatio) => void
    setMode: (highLevel: boolean, detailedShots: boolean) => void
    setHighLevelDescription: (description: string) => void
    setContext: (key: string, value: string) => void
    setAspectRatio: (ratio: AspectRatio) => void
    addShot: (shot: Omit<Shot, "index">) => void
    updateShot: (index: number, shot: Partial<Shot>) => void
    deleteShot: (index: number) => void
    reorderShots: (fromIndex: number, toIndex: number) => void
    addDialogue: (dialogue: Omit<DialogueLine, "order">) => void
    updateDialogue: (order: number, dialogue: Partial<DialogueLine>) => void
    deleteDialogue: (order: number) => void
    reorderDialogue: (fromOrder: number, toOrder: number) => void
    reset: () => void
}

const initialState: PromptData = {
    useCase: {
        id: "",
        title: "",
        aspectRatio: "9:16",
        tone: "",
    },
    mode: {
        highLevel: true,
        detailedShots: false,
    },
    highLevelDescription: "",
    context: {
        grade: "none",
        lighting: "none",
        location: "none",
        wardrobe: "none",
        sound: "none",
    },
    shots: [],
    dialogue: [],
    aspectRatio: "9:16",
}

export const usePromptStore = create<PromptStore>((set) => ({
    ...initialState,
    setUseCase: (id, title, tone, aspectRatio) => set({ useCase: { id, title, aspectRatio, tone } }),
    setMode: (highLevel, detailedShots) => set({ mode: { highLevel, detailedShots } }),
    setHighLevelDescription: (description) => set({ highLevelDescription: description }),
    setContext: (key, value) => set((state) => ({ context: { ...state.context, [key]: value } })),
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    addShot: (shot) =>
        set((state) => ({
            shots: [...state.shots, { ...shot, index: state.shots.length + 1 }],
        })),
    updateShot: (index, shot) =>
        set((state) => ({
            shots: state.shots.map((s) => (s.index === index ? { ...s, ...shot } : s)),
        })),
    deleteShot: (index) =>
        set((state) => ({
            shots: state.shots.filter((s) => s.index !== index).map((s, i) => ({ ...s, index: i + 1 })),
        })),
    reorderShots: (fromIndex, toIndex) =>
        set((state) => {
            const shots = [...state.shots]
            const [removed] = shots.splice(fromIndex, 1)
            shots.splice(toIndex, 0, removed)
            return { shots: shots.map((s, i) => ({ ...s, index: i + 1 })) }
        }),
    addDialogue: (dialogue) =>
        set((state) => ({
            dialogue: [...state.dialogue, { ...dialogue, order: state.dialogue.length + 1 }],
        })),
    updateDialogue: (order, dialogue) =>
        set((state) => ({
            dialogue: state.dialogue.map((d) => (d.order === order ? { ...d, ...dialogue } : d)),
        })),
    deleteDialogue: (order) =>
        set((state) => ({
            dialogue: state.dialogue.filter((d) => d.order !== order).map((d, i) => ({ ...d, order: i + 1 })),
        })),
    reorderDialogue: (fromOrder, toOrder) =>
        set((state) => {
            const dialogue = [...state.dialogue]
            const [removed] = dialogue.splice(fromOrder, 1)
            dialogue.splice(toOrder, 0, removed)
            return { dialogue: dialogue.map((d, i) => ({ ...d, order: i + 1 })) }
        }),
    reset: () => set(initialState),
}))
