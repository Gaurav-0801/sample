import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "./globals.css"
import { TRPCProvider } from "@/lib/trpc-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@auth0/nextjs-auth0/client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChatGPT Mobile Clone",
  description: "A beautiful mobile-first ChatGPT clone with image generation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
