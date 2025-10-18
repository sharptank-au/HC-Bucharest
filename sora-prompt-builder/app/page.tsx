"use client"

import { useState } from "react"
import { UseCaseSelection } from "@/components/use-case-selection"
import { ContextBuilder } from "@/components/context-builder"
import { ShotDialogueManager } from "@/components/shot-dialogue-manager"
import { OutputScreen } from "@/components/output-screen"
import { StepIndicator } from "@/components/step-indicator"
import { usePromptStore } from "@/lib/prompt-store"

type Step = "use-case" | "context" | "shots-dialogue" | "output"

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("use-case")
  const useCase = usePromptStore((state) => state.useCase)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <svg className="h-5 w-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Sora Prompt Builder</h1>
              {useCase.title && <p className="text-sm text-muted-foreground">{useCase.title}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} variant="inline" />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {currentStep === "use-case" && <UseCaseSelection onNext={() => setCurrentStep("context")} />}
        {currentStep === "context" && (
          <ContextBuilder onNext={() => setCurrentStep("shots-dialogue")} onBack={() => setCurrentStep("use-case")} />
        )}
        {currentStep === "shots-dialogue" && (
          <ShotDialogueManager onNext={() => setCurrentStep("output")} onBack={() => setCurrentStep("context")} />
        )}
        {currentStep === "output" && <OutputScreen onBack={() => setCurrentStep("shots-dialogue")} />}
      </main>
    </div>
  )
}
