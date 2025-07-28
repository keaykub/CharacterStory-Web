import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: ดึงรายการ characters
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const favoritesOnly = searchParams.get('favorites') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

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

    // สร้าง query
    let query = supabase
      .from('characters')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    // เพิ่มเงื่อนไข favorites ถ้าต้องการ
    if (favoritesOnly) {
      query = query.eq('is_favorite', true)
    }

    // เพิ่ม limit ถ้ามี
    if (limit) {
      query = query.limit(limit)
    }

    const { data: characters, error } = await query

    if (error) {
      console.error('Error fetching characters:', error)
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      characters: characters || []
    })

  } catch (error) {
    console.error('Error in characters API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}