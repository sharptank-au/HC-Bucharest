"use client"

import { Sparkles, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import { SearchBar } from "./search-bar"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthActions } from "@convex-dev/auth/react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function Header() {
  const { isSignedIn, setIsSignedIn } = useAuth()
  const user = useQuery(api.users.me)
  const { signIn, signOut } = useAuthActions()
  const createDemoUser = useMutation(api.users.createDemoUser)

  // Simple authentication - just create a temporary user
  const handleSignIn = async () => {
    try {
      // Create a demo user in our database
      await createDemoUser({
        email: "demo@example.com",
        username: "Demo User"
      })
      setIsSignedIn(true)
    } catch (error) {
      console.error("Sign in failed:", error)
      // For demo purposes, just set signed in
      setIsSignedIn(true)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsSignedIn(false)
    } catch (error) {
      console.error("Sign out failed:", error)
      setIsSignedIn(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-2 md:gap-4 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          <span className="hidden sm:inline text-lg md:text-xl font-bold text-foreground">AI Video Prompts</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <SearchBar />
        </div>

        <SearchBar isMobile />

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isSignedIn ? (
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="text-foreground text-sm md:text-base px-2 md:px-4"
            >
              Sign in
            </Button>
          ) : (
            <>
              <div className="hidden md:flex gap-2">
                <Link href="/build">
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                    <Wrench className="h-4 w-4 mr-2" />
                    Build Prompt
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Submit Prompt
                  </Button>
                </Link>

              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full flex-shrink-0">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarImage src={(user as any)?.avatarUrl || "/placeholder.svg?height=36&width=36"} alt={(user as any)?.username || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(user as any)?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
                  <Link href="/submit">
                    <DropdownMenuItem className="md:hidden">Submit Prompt</DropdownMenuItem>
                  </Link>
                  <Link href="/build">
                    <DropdownMenuItem className="md:hidden">
                      <Wrench className="h-4 w-4 mr-2" />
                      Build Prompt
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/submissions">
                    <DropdownMenuItem>My Submissions</DropdownMenuItem>
                  </Link>
                  <Link href="/favorites">
                    <DropdownMenuItem>My Favorites</DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
