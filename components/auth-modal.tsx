"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Check } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<"auth" | "username">("auth")
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const { toast } = useToast()

  const validateUsername = (value: string): boolean => {
    setUsernameError("")

    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return false
    }

    if (value.length > 20) {
      setUsernameError("Username must be less than 20 characters")
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores")
      return false
    }

    return true
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      // In production, this would redirect to: POST /api/auth/google
      // The backend would return: { isNewUser: boolean, user: User }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate new user response
      const isNewUser = true // This would come from backend

      if (isNewUser) {
        setStep("username")
      } else {
        // Existing user - close modal and sign in
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameSubmit = async () => {
    if (!validateUsername(username)) {
      return
    }

    setIsLoading(true)

    try {
      // In production: POST /api/users/username with { username }
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Welcome to AI Prompts!",
        description: "Your account has been created successfully.",
      })

      onOpenChange(false)
      // Reset state
      setStep("auth")
      setUsername("")
    } catch (error) {
      setUsernameError("This username is already taken")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("auth")
      setUsername("")
      setUsernameError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {step === "auth" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground text-center">Welcome to PROMPTPLAY AI Video Prompt Library</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center">
                Sign in to save favorites, submit prompts, and engage with the community.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-6">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Secure authentication</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground px-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground text-center">Choose your username</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center">
                This will be your public display name on AI Prompts
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (usernameError) setUsernameError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleUsernameSubmit()
                    }
                  }}
                  className={usernameError ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {usernameError && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{usernameError}</span>
                  </div>
                )}
                {username && !usernameError && username.length >= 3 && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Username is available</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Username requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>3-20 characters long</li>
                  <li>Letters, numbers, and underscores only</li>
                  <li>No spaces or special characters</li>
                </ul>
              </div>

              <Button
                onClick={handleUsernameSubmit}
                disabled={isLoading || !username || !!usernameError}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-background border-t-foreground rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
