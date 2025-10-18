import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Providers from "./providers"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "PromptPlay - AI Video Prompt Library",
  description: "Discover and share amazing AI video prompts",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <ThemeProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <Toaster />
            </Suspense>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
