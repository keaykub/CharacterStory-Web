import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PATCH: Toggle favorite status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const characterId = params.id
    const body = await req.json()
    const { is_favorite } = body

    if (typeof is_favorite !== 'boolean') {
      return NextResponse.json(
        { error: 'is_favorite must be a boolean' },
        { status: 400 }
      )
    }

    // หา user_id จาก clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่า character เป็นของ user นี้หรือไม่
    const { data: existingCharacter, error: checkError } = await supabase
      .from('characters')
      .select('id, user_id, is_favorite')
      .eq('id', characterId)
      .eq('user_id', userData.id)
      .single()

    if (checkError || !existingCharacter) {
      return NextResponse.json(
        { error: 'Character not found or access denied' },
        { status: 404 }
      )
    }

    // อัพเดท favorite status
    const { data: updatedCharacter, error: updateError } = await supabase
      .from('characters')
      .update({ 
        is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating character favorite:', updateError)
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      message: is_favorite ? 'Added to favorites' : 'Removed from favorites'
    })

  } catch (error) {
    console.error('Error in character favorite API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}