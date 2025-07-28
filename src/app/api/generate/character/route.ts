import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // ตรวจสอบ authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, gender, age, role } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      )
    }

    // 1. ตรวจสอบเครดิตของ user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits')
      .eq('clerk_id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 2. ตรวจสอบว่ามีเครดิตเพียงพอหรือไม่
    if (userData.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }

    // 3. เรียก Gemini API เพื่อสร้าง character prompt
    let generatedPrompt = ''
    let aiSuccess = false

    try {
      // Import GeminiService แบบ dynamic
      const { GeminiService } = await import('@/services/geminiService')
      
      const processedData = {
        name,
        description,
        gender,
        age,
        role
      }
      
      const response = await GeminiService.generateCharacter(processedData)
      
      if (response.success && response.data) {
        generatedPrompt = GeminiService.formatCharacterPrompt(response.data)
        aiSuccess = true
      } else {
        throw new Error(response.error || 'Failed to generate character')
      }
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError)
      
      // Fallback prompt หาก AI ล้มเหลว
      generatedPrompt = `
📋 **Character Identity Template**

👤 **1. ชื่อ / บทบาท (Name / Role)**
• Name: ${name}
• Role: ${role || 'ไม่ระบุ'}

🧑‍🎨 **2. เพศ / อายุ / เชื้อชาติ (Gender / Age / Ethnicity)**
• Gender: ${gender || 'ไม่ระบุ'}
• Age: ${age || 'ไม่ระบุ'}

📝 **รายละเอียด:**
${description}

⚠️ **หมายเหตุ:** สร้างด้วย Fallback Template
      `.trim()
    }

    // 4. บันทึกข้อมูลใน database (transaction)
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .insert({
        user_id: userData.id,
        name,
        description,
        prompt: generatedPrompt,
        gender,
        age,
        role,
        is_favorite: false, // เริ่มต้นไม่เป็น favorite
      })
      .select()
      .single()

    if (characterError) {
      console.error('Error creating character:', characterError)
      return NextResponse.json(
        { error: 'Failed to create character' },
        { status: 500 }
      )
    }

    // 5. หักเครดิต
    const { error: creditUpdateError } = await supabase
      .from('users')
      .update({ 
        credits: userData.credits - 1 
      })
      .eq('id', userData.id)

    if (creditUpdateError) {
      console.error('Error updating credits:', creditUpdateError)
      
      // ถ้าหักเครดิตไม่ได้ ให้ลบ character ที่สร้างไปแล้ว
      await supabase
        .from('characters')
        .delete()
        .eq('id', character.id)
      
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // 6. บันทึก credit log
    await supabase
      .from('credit_logs')
      .insert({
        user_id: userData.id,
        amount: -1,
        reason: `Character generation: ${name}`
      })

    // 7. ส่งผลลัพธ์กลับ
    return NextResponse.json({
      success: true,
      character,
      prompt: generatedPrompt,
      remainingCredits: userData.credits - 1,
      aiGenerated: aiSuccess
    })

  } catch (error) {
    console.error('Error in character generation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}