"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SearchBarProps {
    isMobile?: boolean
    className?: string
}

export function SearchBar({ isMobile = false, className = "" }: SearchBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
    const [isOpen, setIsOpen] = useState(false)

    // Update search query when URL params change
    useEffect(() => {
        setSearchQuery(searchParams.get("q") || "")
    }, [searchParams])

    const handleSearch = (query: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (query.trim()) {
            params.set("q", query.trim())
        } else {
            params.delete("q")
        }

        // Navigate to home page with search params
        router.push(`/?${params.toString()}`)

        // Close mobile dialog if open
        if (isMobile) {
            setIsOpen(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(searchQuery)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch(searchQuery)
        }
    }

    if (isMobile) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    <form onSubmit={handleSubmit} className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                            autoFocus
                        />
                    </form>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <div className={`relative w-full ${className}`}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <form onSubmit={handleSubmit}>
                <Input
                    type="search"
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
            </form>
        </div>
    )
}
