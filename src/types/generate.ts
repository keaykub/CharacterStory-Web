// types/generate.ts
import { Database } from '@/types/database'

// ใช้ type จาก Database โดยตรง (แนะนำวิธีนี้)
export type Character = Database['public']['Tables']['characters']['Row']

// หรือถ้าต้องการ interface แยก ก็ใช้แบบด้านบน
// export interface Character {
//   id: string;
//   name: string;
//   description: string;
//   prompt: string;
//   gender: string | null;
//   age: number | null;
//   role: string | null;
//   is_favorite: boolean;
//   user_id: string;
//   created_at: string;
//   updated_at: string;
// }

export interface HistoryItem {
  id: number;
  title: string;
  prompt: string;
  createdAt: string;
}

export type TabType = 'scene' | 'character' | 'my-characters' | 'history';