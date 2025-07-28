// src/components/navbar/navbar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ModeToggle } from "@/components/navbar/darkmodeToogle"
import { MainNav } from "@/components/navbar/main-nav"
import { UserMenu } from "@/components/navbar/user-menu"
import { CreditDisplay } from "@/components/navbar/credit-display"

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-background">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors">
          CharacterStory-AI
        </Link>
        
        {/* Main Navigation - ซ่อนใน mobile */}
        <MainNav pathname={pathname} />
      </div>

      {/* Right: Theme + Credits + User/Menu */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        
        {/* แสดง Credits เฉพาะ desktop เมื่อ login */}
        {isSignedIn && (
          <div className="hidden md:block">
            <CreditDisplay />
          </div>
        )}
        
        <UserMenu />
      </div>
    </nav>
  )
}