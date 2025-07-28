import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ✅ แก้ไข interface สำหรับ Next.js 15
interface RouteParams {
  params: Promise<{ id: string }>  // เปลี่ยนเป็น Promise
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ await params
    const { id } = await context.params
    const { is_favorite } = await request.json()

    // อัพเดท favorite status
    const { error } = await supabase
      .from('characters')
      .update({ is_favorite })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Favorite toggle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}