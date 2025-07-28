import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useCallback } from "react"
import { Database } from "@/types/database"

type Character = Database['public']['Tables']['characters']['Row']

interface UseCharactersOptions {
  favoritesOnly?: boolean
  limit?: number
}

export function useCharacters(options: UseCharactersOptions = {}) {
  const { user, isSignedIn } = useUser()
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams()
      
      if (options.favoritesOnly) {
        searchParams.append('favorites', 'true')
      }
      
      if (options.limit) {
        searchParams.append('limit', options.limit.toString())
      }

      const response = await fetch(`/api/characters?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters')
      }
      
      const data = await response.json()
      setCharacters(data.characters)
    } catch (err) {
      console.error("Failed to fetch characters:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setCharacters([])
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, user, options.favoritesOnly, options.limit])

  const toggleFavorite = useCallback(async (characterId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite status')
      }

      const result = await response.json()
      
      // อัพเดท local state
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, is_favorite: isFavorite }
            : char
        )
      )

      return result
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      throw err
    }
  }, [])

  const refetchCharacters = useCallback(() => {
    fetchCharacters()
  }, [fetchCharacters])

  useEffect(() => {
    fetchCharacters()
  }, [fetchCharacters])

  return {
    characters,
    isLoading,
    error,
    refetchCharacters,
    toggleFavorite
  }
}