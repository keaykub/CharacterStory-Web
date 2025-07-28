"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { Coins, Plus } from "lucide-react"
import Link from "next/link"
import { useCredits } from "@/contexts/CreditsContext" // เปลี่ยน import path

export function CreditDisplay() {
  const { isSignedIn } = useUser()
  const { credits, isLoading } = useCredits()

  if (!isSignedIn) {
    return null
  }

  return (
    <Link href="/pricing">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 hover:bg-accent transition-colors"
      >
        <Coins className="h-4 w-4 text-yellow-500" />
        <span className="font-medium">
          {isLoading ? "..." : credits.toLocaleString()}
        </span>
        <Plus className="h-3 w-3 opacity-60" />
      </Button>
    </Link>
  )
}