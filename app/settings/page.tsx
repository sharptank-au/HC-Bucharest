"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Check, Upload, X } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [email] = useState("user@example.com") // This would come from Google auth
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=100&width=100") // From Google profile
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    toast({
      title: "Username saved",
      description: "Your username has been updated successfully",
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfilePicture = async () => {
    if (!imageFile) return

    setIsLoading(true)
    // Simulate API call to upload image
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update avatar URL with the new image
    setAvatarUrl(selectedImage!)
    setSelectedImage(null)
    setImageFile(null)
    setIsLoading(false)

    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been changed successfully",
    })
  }

  const handleCancelImageSelection = () => {
    setSelectedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Profile Section */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Profile</h2>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedImage || avatarUrl || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage ? "New picture selected" : "Click to upload a new picture"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {!selectedImage ? (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Picture
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSaveProfilePicture}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isLoading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save Picture
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelImageSelection}
                        disabled={isLoading}
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 200x200px. Max file size: 5MB
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email is managed by your Google account</p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={20}
                  />
                  <Button
                    onClick={handleSaveUsername}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is your public display name. It can be your real name or a pseudonym.
                </p>
              </div>
            </div>
          </Card>

          {/* Account Section */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Connected Account</p>
                  <p className="text-sm text-muted-foreground">Google</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Connected
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
