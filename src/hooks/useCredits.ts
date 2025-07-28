import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useCallback } from "react"

export function useCredits() {
  const { user, isSignedIn } = useUser()
  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/user/credits')
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits')
      }
      
      const data = await response.json()
      setCredits(data.credits)
    } catch (err) {
      console.error("Failed to fetch credits:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setCredits(0)
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, user])

  const refetchCredits = useCallback(() => {
    fetchCredits()
  }, [fetchCredits])

  // Update credits locally (for optimistic updates)
  const updateCreditsLocally = useCallback((newCredits: number) => {
    setCredits(newCredits)
  }, [])

  // Deduct credits locally (for optimistic updates)
  const deductCreditsLocally = useCallback((amount: number = 1) => {
    setCredits(prev => Math.max(0, prev - amount))
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return {
    credits,
    isLoading,
    error,
    refetchCredits,
    updateCreditsLocally,
    deductCreditsLocally
  }
}