"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePromptStore } from "@/lib/prompt-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OutputScreenProps {
    onBack: () => void
}

export function OutputScreen({ onBack }: OutputScreenProps) {
    const { useCase, mode, highLevelDescription, context, shots, dialogue, aspectRatio } = usePromptStore()
    const [copied, setCopied] = useState(false)

    // Generate text output
    const generateTextOutput = () => {
        let output = ""

        // Use Case
        output += `Use Case: ${useCase.title}\n`
        output += `Aspect Ratio: ${aspectRatio}\n`
        output += `Tone: ${useCase.tone}\n\n`

        // High-Level Description
        if (mode.highLevel && highLevelDescription) {
            output += `High-Level Description:\n${highLevelDescription}\n\n`
        }

        // Shots
        if (mode.detailedShots && shots.length > 0) {
            output += `Shots:\n`
            shots.forEach((shot) => {
                output += `${shot.index}. (${shot.start_sec}–${shot.start_sec + shot.duration_sec}s) ${shot.description}\n`
                output += `   Camera: ${shot.camera}\n`
                if (shot.overlays.length > 0) {
                    output += `   Overlays: ${shot.overlays.join(", ")}\n`
                }
                if (shot.notes) {
                    output += `   Notes: ${shot.notes}\n`
                }
                output += `\n`
            })
        }

        // Context
        output += `Context:\n\n`

        if (context.grade && context.grade !== "none") {
            output += `Grade / Palette:\n${context.grade.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`
        }

        if (context.lighting && context.lighting !== "none") {
            output += `Lighting & Atmosphere:\n${context.lighting.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`
        }

        if (context.location && context.location !== "none") {
            output += `Location & Framing:\n${context.location.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`
        }

        if (context.wardrobe && context.wardrobe !== "none") {
            output += `Wardrobe / Props / Extras:\n${context.wardrobe.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`
        }

        if (context.sound && context.sound !== "none") {
            output += `Sound:\n${context.sound.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\n`
        }

        // Dialogue
        if (dialogue.length > 0) {
            output += `Dialogue:\n`
            dialogue.forEach((line) => {
                output += `${line.speaker}: "${line.text}"\n`
            })
        }

        return output
    }

    // Generate JSON output
    const generateJSONOutput = () => {
        const totalDuration = shots.reduce((sum, shot) => sum + shot.duration_sec, 0)
        const uniqueSpeakers = new Set(dialogue.map((d) => d.speaker)).size

        return JSON.stringify(
            {
                use_case: {
                    id: useCase.id,
                    title: useCase.title,
                    aspect_ratio: aspectRatio,
                    tone: useCase.tone,
                },
                mode: {
                    high_level: mode.highLevel,
                    detailed_shots: mode.detailedShots,
                },
                high_level_description: mode.highLevel ? highLevelDescription : null,
                context: {
                    grade_palette: context.grade !== "none" ? context.grade : null,
                    lighting_atmosphere: context.lighting !== "none" ? context.lighting : null,
                    location_framing: context.location !== "none" ? context.location : null,
                    wardrobe_props_extras: context.wardrobe !== "none" ? context.wardrobe : null,
                    sound: context.sound !== "none" ? context.sound : null,
                },
                shots: mode.detailedShots ? shots : [],
                dialogue: dialogue,
                validation: {
                    total_duration_sec: totalDuration,
                    max_duration_allowed_sec: 10,
                    is_valid: totalDuration <= 10,
                    actors_count: uniqueSpeakers,
                    actors_limit: 10,
                    errors:
                        totalDuration > 10
                            ? [`Total duration (${totalDuration}s) exceeds maximum allowed (10s)`]
                            : uniqueSpeakers > 10
                                ? [`Actor count (${uniqueSpeakers}) exceeds maximum allowed (10)`]
                                : [],
                },
                metadata: {
                    created_at_iso: new Date().toISOString(),
                    app_version: "1.0.0",
                    source: "Sora Prompt Builder",
                },
            },
            null,
            2,
        )
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const textOutput = generateTextOutput()
    const jsonOutput = generateJSONOutput()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Sora Prompt</h2>
                <p className="text-muted-foreground">Copy or download your generated prompt in text or JSON format</p>
            </div>

            {/* Output Tabs */}
            <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="text">Formatted Text</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>

                {/* Text Output */}
                <TabsContent value="text" className="space-y-4">
                    <Card className="relative">
                        <div className="absolute right-4 top-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(textOutput)}>
                                {copied ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(textOutput, `sora-prompt-${Date.now()}.txt`)}
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Download
                            </Button>
                        </div>
                        <div className="p-6">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">{textOutput}</pre>
                        </div>
                    </Card>
                </TabsContent>

                {/* JSON Output */}
                <TabsContent value="json" className="space-y-4">
                    <Card className="relative">
                        <div className="absolute right-4 top-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(jsonOutput)}>
                                {copied ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(jsonOutput, `sora-prompt-${Date.now()}.json`)}
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Download
                            </Button>
                        </div>
                        <div className="p-6">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">{jsonOutput}</pre>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Shots</p>
                        <p className="text-2xl font-bold text-foreground">{shots.length}</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Dialogue Lines</p>
                        <p className="text-2xl font-bold text-foreground">{dialogue.length}</p>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Duration</p>
                        <p className="text-2xl font-bold text-foreground">
                            {shots.reduce((sum, shot) => sum + shot.duration_sec, 0)}s
                        </p>
                    </div>
                </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Edit
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        window.location.reload()
                    }}
                >
                    Start New Prompt
                </Button>
            </div>
        </div>
    )
}