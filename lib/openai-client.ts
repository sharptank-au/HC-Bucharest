import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export interface BuildPromptData {
    useCase: {
        id: string
        title: string
        tone: string
    }
    mode: {
        highLevel: boolean
        detailedShots: boolean
    }
    highLevelDescription?: string
    context: {
        grade: string
        lighting: string
        location: string
        wardrobe: string
        sound: string
    }
    shots: Array<{
        index: number
        start_sec: number
        duration_sec: number
        description: string
        camera: string
        overlays: string[]
        notes?: string
    }>
    dialogue: Array<{
        order: number
        speaker: string
        text: string
    }>
    aspectRatio: string
}

export interface EnhancedPrompts {
    enhancedTextPrompt: string
    enhancedJsonPrompt: any
    metadata: {
        model: string
        tokens_used: number
        processing_time_ms: number
    }
}

export async function enhancePromptWithAI(buildPromptData: BuildPromptData): Promise<EnhancedPrompts> {
    const startTime = Date.now()

    // Build the context for the AI
    let contextDescription = ""

    if (buildPromptData.context.grade && buildPromptData.context.grade !== "none") {
        contextDescription += `Color Grade: ${buildPromptData.context.grade.replace(/_/g, " ")}\n`
    }

    if (buildPromptData.context.lighting && buildPromptData.context.lighting !== "none") {
        contextDescription += `Lighting: ${buildPromptData.context.lighting.replace(/_/g, " ")}\n`
    }

    if (buildPromptData.context.location && buildPromptData.context.location !== "none") {
        contextDescription += `Location: ${buildPromptData.context.location.replace(/_/g, " ")}\n`
    }

    if (buildPromptData.context.wardrobe && buildPromptData.context.wardrobe !== "none") {
        contextDescription += `Wardrobe/Props: ${buildPromptData.context.wardrobe.replace(/_/g, " ")}\n`
    }

    if (buildPromptData.context.sound && buildPromptData.context.sound !== "none") {
        contextDescription += `Sound: ${buildPromptData.context.sound.replace(/_/g, " ")}\n`
    }

    // Build shots description
    let shotsDescription = ""
    if (buildPromptData.mode.detailedShots && buildPromptData.shots.length > 0) {
        shotsDescription = "Shot Sequence:\n"
        buildPromptData.shots.forEach((shot) => {
            shotsDescription += `${shot.index}. (${shot.start_sec}-${shot.start_sec + shot.duration_sec}s) ${shot.description}\n`
            shotsDescription += `   Camera: ${shot.camera}\n`
            if (shot.overlays.length > 0) {
                shotsDescription += `   Overlays: ${shot.overlays.join(", ")}\n`
            }
            if (shot.notes) {
                shotsDescription += `   Notes: ${shot.notes}\n`
            }
            shotsDescription += "\n"
        })
    }

    // Build dialogue description
    let dialogueDescription = ""
    if (buildPromptData.dialogue.length > 0) {
        dialogueDescription = "Dialogue:\n"
        buildPromptData.dialogue.forEach((line) => {
            dialogueDescription += `${line.speaker}: "${line.text}"\n`
        })
    }

    const systemPrompt = `You are an expert Sora video prompt engineer. Your task is to enhance and optimize video prompts for OpenAI's Sora model.

Key guidelines:
- Create cinematic, visually stunning prompts
- Use specific technical terms (camera movements, lighting, composition)
- Optimize for Sora's capabilities (realistic motion, physics, lighting)
- Maintain the original intent while enhancing visual appeal
- Keep prompts concise but descriptive
- Focus on visual storytelling

Return both a formatted text prompt and a structured JSON format.`

    const userPrompt = `Enhance this Sora video prompt:

Use Case: ${buildPromptData.useCase.title}
Aspect Ratio: ${buildPromptData.aspectRatio}
Tone: ${buildPromptData.useCase.tone}

${buildPromptData.mode.highLevel && buildPromptData.highLevelDescription ?
            `High-Level Description:\n${buildPromptData.highLevelDescription}\n\n` : ''}

${contextDescription ? `Context:\n${contextDescription}\n` : ''}

${shotsDescription}

${dialogueDescription}

Please enhance this into a professional Sora prompt that will generate high-quality video content. Return both a formatted text version and a structured JSON format.`

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        })

        const response = completion.choices[0]?.message?.content
        if (!response) {
            throw new Error("No response from OpenAI")
        }

        // Parse the response to extract text and JSON
        const lines = response.split('\n')
        let enhancedTextPrompt = ""
        let enhancedJsonPrompt = null

        // Try to find JSON in the response
        const jsonStart = response.indexOf('{')
        const jsonEnd = response.lastIndexOf('}') + 1

        if (jsonStart !== -1 && jsonEnd > jsonStart) {
            try {
                const jsonStr = response.substring(jsonStart, jsonEnd)
                enhancedJsonPrompt = JSON.parse(jsonStr)
            } catch (e) {
                // If JSON parsing fails, create a structured format
                enhancedJsonPrompt = {
                    prompt: response,
                    metadata: {
                        use_case: buildPromptData.useCase.title,
                        aspect_ratio: buildPromptData.aspectRatio,
                        tone: buildPromptData.useCase.tone,
                        enhanced_by: "OpenAI GPT-4o"
                    }
                }
            }
        }

        // Use the full response as the text prompt
        enhancedTextPrompt = response

        const processingTime = Date.now() - startTime

        return {
            enhancedTextPrompt,
            enhancedJsonPrompt,
            metadata: {
                model: "gpt-4o",
                tokens_used: completion.usage?.total_tokens || 0,
                processing_time_ms: processingTime
            }
        }

    } catch (error) {
        console.error("OpenAI API error:", error)
        throw new Error(`OpenAI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}
