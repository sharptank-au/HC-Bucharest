"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePromptStore } from "@/lib/prompt-store"
import { Badge } from "@/components/ui/badge"

interface ShotDialogueManagerProps {
    onNext: () => void
    onBack: () => void
}

export function ShotDialogueManager({ onNext, onBack }: ShotDialogueManagerProps) {
    const {
        shots,
        dialogue,
        addShot,
        updateShot,
        deleteShot,
        addDialogue,
        updateDialogue,
        deleteDialogue,
        mode,
        useCase,
        highLevelDescription,
        context,
        aspectRatio,
        setAiEnhancedPrompt
    } = usePromptStore()

    const [isProcessing, setIsProcessing] = useState(false)

    // Shot form state
    const [shotForm, setShotForm] = useState({
        start_sec: 0,
        duration_sec: 3,
        description: "",
        camera: "",
        overlays: "",
        notes: "",
    })

    // Dialogue form state
    const [dialogueForm, setDialogueForm] = useState({
        speaker: "",
        text: "",
    })

    const [editingShot, setEditingShot] = useState<number | null>(null)
    const [editingDialogue, setEditingDialogue] = useState<number | null>(null)

    const totalDuration = shots.reduce((sum, shot) => sum + shot.duration_sec, 0)

    const handleAddShot = () => {
        if (shotForm.description && shotForm.camera) {
            addShot({
                start_sec: shotForm.start_sec,
                duration_sec: shotForm.duration_sec,
                description: shotForm.description,
                camera: shotForm.camera,
                overlays: shotForm.overlays ? shotForm.overlays.split(",").map((o) => o.trim()) : [],
                notes: shotForm.notes,
            })
            setShotForm({
                start_sec: shotForm.start_sec + shotForm.duration_sec,
                duration_sec: 3,
                description: "",
                camera: "",
                overlays: "",
                notes: "",
            })
        }
    }

    const handleUpdateShot = () => {
        if (editingShot !== null && shotForm.description && shotForm.camera) {
            updateShot(editingShot, {
                start_sec: shotForm.start_sec,
                duration_sec: shotForm.duration_sec,
                description: shotForm.description,
                camera: shotForm.camera,
                overlays: shotForm.overlays ? shotForm.overlays.split(",").map((o) => o.trim()) : [],
                notes: shotForm.notes,
            })
            setEditingShot(null)
            setShotForm({
                start_sec: totalDuration,
                duration_sec: 3,
                description: "",
                camera: "",
                overlays: "",
                notes: "",
            })
        }
    }

    const handleEditShot = (shot: (typeof shots)[0]) => {
        setEditingShot(shot.index)
        setShotForm({
            start_sec: shot.start_sec,
            duration_sec: shot.duration_sec,
            description: shot.description,
            camera: shot.camera,
            overlays: shot.overlays.join(", "),
            notes: shot.notes || "",
        })
    }

    const handleAddDialogue = () => {
        if (dialogueForm.speaker && dialogueForm.text) {
            addDialogue({
                speaker: dialogueForm.speaker,
                text: dialogueForm.text,
            })
            setDialogueForm({ speaker: "", text: "" })
        }
    }

    const handleUpdateDialogue = () => {
        if (editingDialogue !== null && dialogueForm.speaker && dialogueForm.text) {
            updateDialogue(editingDialogue, {
                speaker: dialogueForm.speaker,
                text: dialogueForm.text,
            })
            setEditingDialogue(null)
            setDialogueForm({ speaker: "", text: "" })
        }
    }

    const handleEditDialogue = (line: (typeof dialogue)[0]) => {
        setEditingDialogue(line.order)
        setDialogueForm({
            speaker: line.speaker,
            text: line.text,
        })
    }

    const handleGeneratePrompt = async () => {
        try {
            setIsProcessing(true)

            // Trigger OpenAI processing
            const response = await fetch('/api/build-prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    useCase,
                    mode,
                    highLevelDescription,
                    context,
                    shots,
                    dialogue,
                    aspectRatio
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to process AI enhancement')
            }

            const result = await response.json()

            if (result.success) {
                // Store the AI-enhanced prompt in the store for the output screen
                setAiEnhancedPrompt(result.data.enhancedTextPrompt)
                console.log('AI enhancement completed:', result.data)
            }

            // Move to next step
            onNext()

        } catch (error) {
            console.error('Error generating prompt:', error)
            // Still move to next step to show output screen
            onNext()
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Shots & Dialogue</h2>
                <p className="text-muted-foreground">
                    {mode.detailedShots
                        ? "Define your shot sequence and add dialogue lines"
                        : "Add optional dialogue for your video"}
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Shots Section */}
                {mode.detailedShots && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Shot Sequence</h3>
                                <p className="text-sm text-muted-foreground">
                                    Total duration: {totalDuration}s{" "}
                                    {totalDuration > 10 && <span className="text-destructive">(exceeds 10s limit)</span>}
                                </p>
                            </div>
                        </div>

                        {/* Shot Form */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-sec">Start (sec)</Label>
                                        <Input
                                            id="start-sec"
                                            type="number"
                                            min="0"
                                            value={shotForm.start_sec}
                                            onChange={(e) => setShotForm({ ...shotForm, start_sec: Number.parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration-sec">Duration (sec)</Label>
                                        <Input
                                            id="duration-sec"
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            value={shotForm.duration_sec}
                                            onChange={(e) =>
                                                setShotForm({ ...shotForm, duration_sec: Number.parseFloat(e.target.value) || 1 })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Slow pan across metallic keys under moody lighting"
                                        value={shotForm.description}
                                        onChange={(e) => setShotForm({ ...shotForm, description: e.target.value })}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="camera">Camera Movement</Label>
                                    <Input
                                        id="camera"
                                        placeholder="Dolly left, 50mm, shallow DOF"
                                        value={shotForm.camera}
                                        onChange={(e) => setShotForm({ ...shotForm, camera: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="overlays">Overlays (comma-separated)</Label>
                                    <Input
                                        id="overlays"
                                        placeholder="GRID LOGO fade-in, Text: 'Designed to perform'"
                                        value={shotForm.overlays}
                                        onChange={(e) => setShotForm({ ...shotForm, overlays: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Additional notes or instructions"
                                        value={shotForm.notes}
                                        onChange={(e) => setShotForm({ ...shotForm, notes: e.target.value })}
                                    />
                                </div>

                                <Button
                                    onClick={editingShot !== null ? handleUpdateShot : handleAddShot}
                                    className="w-full"
                                    disabled={!shotForm.description || !shotForm.camera}
                                >
                                    {editingShot !== null ? "Update Shot" : "Add Shot"}
                                </Button>
                                {editingShot !== null && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingShot(null)
                                            setShotForm({
                                                start_sec: totalDuration,
                                                duration_sec: 3,
                                                description: "",
                                                camera: "",
                                                overlays: "",
                                                notes: "",
                                            })
                                        }}
                                        className="w-full"
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Shots List */}
                        <div className="space-y-3">
                            {shots.length === 0 ? (
                                <Card className="p-6 text-center">
                                    <p className="text-sm text-muted-foreground">No shots added yet. Add your first shot above.</p>
                                </Card>
                            ) : (
                                shots.map((shot) => (
                                    <Card key={shot.index} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">Shot {shot.index}</Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {shot.start_sec}s - {shot.start_sec + shot.duration_sec}s ({shot.duration_sec}s)
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditShot(shot)}>
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteShot(shot.index)}>
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-foreground">{shot.description}</p>
                                                <p className="text-xs text-muted-foreground">Camera: {shot.camera}</p>
                                                {shot.overlays.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {shot.overlays.map((overlay, i) => (
                                                            <Badge key={i} variant="outline" className="text-xs">
                                                                {overlay}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {shot.notes && <p className="text-xs italic text-muted-foreground">Note: {shot.notes}</p>}
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Dialogue Section */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">Dialogue</h3>
                        <p className="text-sm text-muted-foreground">Add character dialogue or narration (max 10 actors)</p>
                    </div>

                    {/* Dialogue Form */}
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="speaker">Speaker / Character</Label>
                                <Input
                                    id="speaker"
                                    placeholder="Narrator, Host, Character A, etc."
                                    value={dialogueForm.speaker}
                                    onChange={(e) => setDialogueForm({ ...dialogueForm, speaker: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dialogue-text">Dialogue Text</Label>
                                <Textarea
                                    id="dialogue-text"
                                    placeholder="Precision you can feel."
                                    value={dialogueForm.text}
                                    onChange={(e) => setDialogueForm({ ...dialogueForm, text: e.target.value })}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={editingDialogue !== null ? handleUpdateDialogue : handleAddDialogue}
                                className="w-full"
                                disabled={
                                    !dialogueForm.speaker || !dialogueForm.text || (dialogue.length >= 10 && editingDialogue === null)
                                }
                            >
                                {editingDialogue !== null ? "Update Dialogue" : "Add Dialogue"}
                            </Button>
                            {editingDialogue !== null && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditingDialogue(null)
                                        setDialogueForm({ speaker: "", text: "" })
                                    }}
                                    className="w-full"
                                >
                                    Cancel Edit
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Dialogue List */}
                    <div className="space-y-3">
                        {dialogue.length === 0 ? (
                            <Card className="p-6 text-center">
                                <p className="text-sm text-muted-foreground">No dialogue added yet. Add dialogue above.</p>
                            </Card>
                        ) : (
                            dialogue.map((line) => (
                                <Card key={line.order} className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{line.order}</Badge>
                                                <span className="font-medium text-foreground">{line.speaker}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{line.text}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditDialogue(line)}>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => deleteDialogue(line.order)}>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleGeneratePrompt}
                    className="min-w-[200px]"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            Generate Prompt
                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}