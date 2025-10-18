"use client"

import { Check } from "lucide-react"

type Step = "use-case" | "context" | "shots-dialogue" | "output"

interface StepIndicatorProps {
  currentStep: Step
  variant?: "sticky" | "inline"
}

const steps = [
  { id: "use-case" as Step, label: "Use Case", shortLabel: "Use Case" },
  { id: "context" as Step, label: "Context", shortLabel: "Context" },
  { id: "shots-dialogue" as Step, label: "Shots & Dialogue", shortLabel: "Shots" },
  { id: "output" as Step, label: "Output", shortLabel: "Output" },
]

export function StepIndicator({ currentStep, variant = "inline" }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  const containerClasses =
    variant === "sticky"
      ? "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      : "border-b border-border bg-background"

  return (
    <div className={containerClasses}>
      <div className="mx-auto max-w-7xl px-6 py-4">
        {/* Progress Bar */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = step.id === currentStep
            const isUpcoming = index > currentIndex

            return (
              <div key={step.id} className="flex flex-1 items-center">
                {/* Step Circle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isCurrent
                        ? "border-accent bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                        : isCompleted
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="hidden md:block">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        isCurrent
                          ? "text-foreground"
                          : isCompleted
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-xs text-muted-foreground">In Progress</p>}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="mx-2 flex-1 md:mx-4">
                    <div className={`h-0.5 w-full transition-colors ${isCompleted ? "bg-accent" : "bg-border"}`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile Step Label */}
        <div className="mt-3 text-center md:hidden">
          <p className="text-sm font-medium text-foreground">{steps[currentIndex].label}</p>
          <p className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  )
}
