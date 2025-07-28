import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { inter, notoSansThai, kanit } from "../lib/font";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer"
import { CreditsProvider } from '@/contexts/CreditsContext'
import { CharactersProvider } from '@/contexts/CharactersContext'
import { Toaster } from 'sonner' // เพิ่ม Toaster สำหรับ notifications

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "CharacterStory AI - Create Characters & Scenes with AI",
  description: "Create stunning characters and story scenes with AI. Support Thai input, prompt generation, and export to VEO3 or other AI tools. Free daily credits available.",
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.className} ${notoSansThai.className} ${kanit.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <CreditsProvider>
              <CharactersProvider>
                <Navbar />
                {children}
                <Footer />
                <Toaster position="top-right" />
              </CharactersProvider>
            </CreditsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
    </>
  )
}