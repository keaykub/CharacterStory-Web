// src/components/navbar/main-nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const routes = [
  { 
    href: "/", 
    label: "Home", 
    requireAuth: false 
  },
  { 
    href: "/generate", 
    label: "Generate", 
    requireAuth: false 
  },
  { 
    href: "/pricing", 
    label: "Pricing", 
    requireAuth: false 
  },
  { 
    href: "/inventory", 
    label: "My Creations", 
    requireAuth: true 
  },
]

interface MainNavProps {
  pathname?: string
}

export function MainNav({ pathname: propPathname }: MainNavProps) {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const currentPath = propPathname || pathname

  // Filter routes based on auth status
  const visibleRoutes = routes.filter(route => 
    !route.requireAuth || (route.requireAuth && isSignedIn)
  )

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {visibleRoutes.map((route) => {
          const isActive = currentPath === route.href
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={clsx(
                "text-sm font-medium transition-colors",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {route.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}