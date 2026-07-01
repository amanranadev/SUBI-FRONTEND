import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/shared/ui/toaster"
import { AppProviders } from "@/app/providers"
import { sty } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "SUBI | Intelligent AI Assistant",
  description: "An elegant, context-aware AI assistant with a sleek glassy interface.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sty.variable}>
      <body
        suppressHydrationWarning
        className="font-body antialiased selection:bg-primary/50 selection:text-foreground"
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  )
}
