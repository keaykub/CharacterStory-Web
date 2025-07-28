import { createClient } from '@supabase/supabase-js'

// ✅ เพิ่ม error handling สำหรับ missing env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ตรวจสอบว่ามี environment variables ครบหรือไม่
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// สร้าง client เฉพาะเมื่อมี env vars ครบ
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// สำหรับ Server-side operations (ใช้ service role)
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null

// ✅ Helper function เพื่อตรวจสอบว่า Supabase พร้อมใช้งานหรือไม่
export const isSupabaseReady = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}