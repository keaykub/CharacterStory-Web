"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useUser } from "@clerk/nextjs"
import { Database } from '@/types/database'

type Character = Database['public']['Tables']['characters']['Row']

interface CharactersContextType {
  favoriteCharacters: Character[]
  allCharacters: Character[]
  isLoading: boolean
  error: string | null
  refetchFavorites: () => Promise<void>
  refetchAllCharacters: () => Promise<void>
  updateCharacterFavorite: (characterId: string, isFavorite: boolean) => void
  addNewCharacter: (character: Character) => void
}

const CharactersContext = createContext<CharactersContextType | undefined>(undefined)

export function CharactersProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()
  const [favoriteCharacters, setFavoriteCharacters] = useState<Character[]>([])
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = useCallback(async (favoritesOnly: boolean = false) => {
    if (!isSignedIn || !user) {
      setIsLoading(false)
      return []
    }

    try {
      const searchParams = new URLSearchParams()
      if (favoritesOnly) {
        searchParams.append('favorites', 'true')
      }

      const response = await fetch(`/api/characters?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters')
      }
      
      const data = await response.json()
      return data.characters || []
    } catch (err) {
      console.error("Failed to fetch characters:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    }
  }, [isSignedIn, user])

  const refetchFavorites = useCallback(async () => {
    setIsLoading(true)
    const favorites = await fetchCharacters(true)
    setFavoriteCharacters(favorites)
    setIsLoading(false)
  }, [fetchCharacters])

  const refetchAllCharacters = useCallback(async () => {
    setIsLoading(true)
    const all = await fetchCharacters(false)
    setAllCharacters(all)
    setIsLoading(false)
  }, [fetchCharacters])

  // ✅ Function สำหรับอัพเดท favorite status แบบ real-time
  const updateCharacterFavorite = useCallback((characterId: string, isFavorite: boolean) => {
    // อัพเดท allCharacters
    setAllCharacters(prev => 
      prev.map(char => 
        char.id === characterId 
          ? { ...char, is_favorite: isFavorite }
          : char
      )
    )

    // อัพเดท favoriteCharacters
    if (isFavorite) {
      // เพิ่มเข้า favorites (หาจาก allCharacters)
      setAllCharacters(prev => {
        const updatedChar = prev.find(char => char.id === characterId)
        if (updatedChar) {
          setFavoriteCharacters(prevFav => {
            // ตรวจสอบว่ายังไม่มีใน favorites
            if (!prevFav.find(char => char.id === characterId)) {
              return [...prevFav, { ...updatedChar, is_favorite: true }]
            }
            return prevFav
          })
        }
        return prev
      })
    } else {
      // ลบออกจาก favorites
      setFavoriteCharacters(prev => 
        prev.filter(char => char.id !== characterId)
      )
    }
  }, [])

  // ✅ Function สำหรับเพิ่ม character ใหม่
  const addNewCharacter = useCallback((character: Character) => {
    setAllCharacters(prev => [character, ...prev])
    
    // ถ้าเป็น favorite ให้เพิ่มใน favorites ด้วย
    if (character.is_favorite) {
      setFavoriteCharacters(prev => [character, ...prev])
    }
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      // Fetch ทั้งสองแบบพร้อมกัน
      Promise.all([
        fetchCharacters(true),  // favorites
        fetchCharacters(false)  // all
      ]).then(([favorites, all]) => {
        setFavoriteCharacters(favorites)
        setAllCharacters(all)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, user, fetchCharacters])

  const value: CharactersContextType = {
    favoriteCharacters,
    allCharacters,
    isLoading,
    error,
    refetchFavorites,
    refetchAllCharacters,
    updateCharacterFavorite,
    addNewCharacter
  }

  return (
    <CharactersContext.Provider value={value}>
      {children}
    </CharactersContext.Provider>
  )
}

export function useCharacters(options: { favoritesOnly?: boolean } = {}) {
  const context = useContext(CharactersContext)
  if (context === undefined) {
    throw new Error('useCharacters must be used within a CharactersProvider')
  }

  return {
    characters: options.favoritesOnly ? context.favoriteCharacters : context.allCharacters,
    isLoading: context.isLoading,
    error: context.error,
    refetchCharacters: options.favoritesOnly ? context.refetchFavorites : context.refetchAllCharacters,
    toggleFavorite: async (characterId: string, isFavorite: boolean) => {
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

        // อัพเดท local state ทันที
        context.updateCharacterFavorite(characterId, isFavorite)
        
        return await response.json()
      } catch (err) {
        console.error("Failed to toggle favorite:", err)
        throw err
      }
    },
    addNewCharacter: context.addNewCharacter
  }
}