import { NextRequest, NextResponse } from "next/server"
import { enhancePromptWithAI } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            useCase,
            mode,
            highLevelDescription,
            context,
            shots,
            dialogue,
            aspectRatio
        } = body

        // Validate required fields
        if (!useCase || !mode || !context || !aspectRatio) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: "Missing required fields" }
                },
                { status: 400 }
            )
        }

        // Process AI enhancement synchronously
        try {
            const enhancedPrompts = await enhancePromptWithAI({
                useCase,
                mode,
                highLevelDescription,
                context,
                shots: shots || [],
                dialogue: dialogue || [],
                aspectRatio
            })

            return NextResponse.json({
                success: true,
                data: {
                    enhancedTextPrompt: enhancedPrompts.enhancedTextPrompt,
                    enhancedJsonPrompt: enhancedPrompts.enhancedJsonPrompt,
                    metadata: enhancedPrompts.metadata
                }
            })

        } catch (aiError) {
            console.error("AI processing error:", aiError)
            return NextResponse.json(
                {
                    success: false,
                    error: { message: "AI processing failed" }
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("Error in build-prompts POST:", error)
        return NextResponse.json(
            {
                success: false,
                error: { message: "Internal server error" }
            },
            { status: 500 }
        )
    }
}
