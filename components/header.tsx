"use client"

import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThemeToggle } from "./theme-toggle"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const user = useQuery(api.users.me)

  // For now, we'll use a simple state-based auth
  // TODO: Implement real authentication

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-2 md:gap-4 px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
          <span className="hidden sm:inline text-lg md:text-xl font-bold text-foreground">AI Video Prompts</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts..."
              className="w-full pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="top-[10%] translate-y-0">
            <DialogHeader>
              <DialogTitle>Search Prompts</DialogTitle>
            </DialogHeader>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts..."
                className="w-full pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isSignedIn ? (
            <Button
              variant="ghost"
              onClick={() => setIsSignedIn(true)}
              className="text-foreground text-sm md:text-base px-2 md:px-4"
            >
              Sign in
            </Button>
          ) : (
            <>
              <Link href="/submit" className="hidden md:block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Submit Prompt</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full flex-shrink-0">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=36&width=36"} alt={user?.username || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
                  <Link href="/submit">
                    <DropdownMenuItem className="md:hidden">Submit Prompt</DropdownMenuItem>
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
                  <DropdownMenuItem onClick={() => setIsSignedIn(false)}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
