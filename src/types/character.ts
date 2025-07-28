export interface CharacterInput {
  name: string;
  description: string;
  gender: string;
  age: string;
  role: string;
}

export interface ProcessedCharacterData {
  name: string;
  description: string;
  gender: string;
  age: number | null;
  role: string;
  // เพิ่มข้อมูลที่ประมวลผลแล้ว
  isValid: boolean;
  errors: string[];
}

export interface CharacterPromptD {
  // 1. ชื่อ / บทบาท
  name: string;
  nickname: string;
  role: string;
  
  // 2. เพศ / อายุ / เชื้อชาติ
  gender: string;
  age: string;
  ethnicity: string;
  
  // 3. รูปร่าง / ผิว
  bodyType: string;
  heightWeight: string;
  skinTone: string;
  
  // 4. ใบหน้า
  faceShape: string;
  faceFeatures: string;
  
  // 5. ดวงตา / คิ้ว
  eyes: string;
  eyebrows: string;
  
  // 6. ริมฝีปาก
  lips: string;
  
  // 7. ผม
  hairStyle: string;
  hairColor: string;
  hairDetails: string;
  
  // 8. เครื่องแต่งกาย
  topShirt: string;
  bottomPantsSkirt: string;
  outerwear: string;
  shoes: string;
  fabricMaterial: string;
  
  // 9. เครื่องประดับ
  headAccessories: string;
  jewelry: string;
  otherAccessories: string;
  
  // 10. บุคลิกภาพ
  personalityTraits: string;
  confidenceLevel: string;
  cameraPresence: string;
  
  // 11. ท่าทางเริ่มต้น
  initialPose: string;
  bodyLanguage: string;
  
  // 12. โทนเสียง
  voicePitch: string;
  speakingStyle: string;
  accentDialect: string;
  voiceCharacteristics: string;
  
  // 13. ลักษณะพิเศษ
  uniqueTraits: string;
  specialEffects: string;
  
  // 14. ภาพความสมจริง
  realismType: string;
}

export interface GeminiResponse {
  success: boolean;
  data?: CharacterPromptD;
  error?: string;
  rawResponse?: string;
}