import { CharacterInput, ProcessedCharacterData } from '@/types/character';

export class CharacterProcessor {
  /**
   * ตรวจสอบและทำความสะอาดข้อมูล input
   */
  static validateAndCleanInput(input: CharacterInput): ProcessedCharacterData {
    const errors: string[] = [];
    
    // ทำความสะอาดข้อมูล
    const cleanedData = {
      name: input.name.trim(),
      description: input.description.trim(),
      gender: input.gender.trim(),
      age: this.parseAge(input.age),
      role: input.role.trim()
    };

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!cleanedData.name) {
      errors.push('กรุณาระบุชื่อตัวละคร');
    }
    
    if (!cleanedData.description) {
      errors.push('กรุณาระบุรายละเอียดตัวละคร');
    }
    
    if (cleanedData.name.length > 100) {
      errors.push('ชื่อตัวละครยาวเกิน 100 ตัวอักษร');
    }
    
    if (cleanedData.description.length > 1000) {
      errors.push('รายละเอียดยาวเกิน 1000 ตัวอักษร');
    }

    // ตรวจสอบอายุ
    if (cleanedData.age !== null && (cleanedData.age < 1 || cleanedData.age > 1000)) {
      errors.push('อายุต้องอยู่ระหว่าง 1-1000 ปี');
    }

    return {
      ...cleanedData,
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * แปลงอายุจาก string เป็น number
   */
  private static parseAge(ageStr: string): number | null {
    if (!ageStr.trim()) return null;
    
    const age = parseInt(ageStr.trim(), 10);
    return isNaN(age) ? null : age;
  }

  /**
   * สร้างข้อมูลเพิ่มเติมสำหรับ prompt
   */
  static enrichCharacterData(data: ProcessedCharacterData): ProcessedCharacterData & {
    genderInEnglish: string;
    ageGroup: string;
    personalityHints: string[];
  } {
    return {
      ...data,
      genderInEnglish: this.translateGender(data.gender),
      ageGroup: this.categorizeAge(data.age),
      personalityHints: this.extractPersonalityHints(data.description)
    };
  }

  /**
   * แปลเพศเป็นภาษาอังกฤษ
   */
  private static translateGender(gender: string): string {
    const genderMap: Record<string, string> = {
      'ชาย': 'male',
      'หญิง': 'female',
      'อื่นๆ': 'non-binary',
      'male': 'male',
      'female': 'female',
      'other': 'non-binary'
    };
    
    return genderMap[gender.toLowerCase()] || 'unspecified';
  }

  /**
   * จัดกลุ่มอายุ
   */
  private static categorizeAge(age: number | null): string {
    if (age === null) return 'unspecified';
    
    if (age < 13) return 'child';
    if (age < 20) return 'teenager';
    if (age < 30) return 'young adult';
    if (age < 50) return 'adult';
    if (age < 65) return 'middle-aged';
    return 'elderly';
  }

  /**
   * สกัดคำใบ้เกี่ยวกับบุคลิกภาพจากรายละเอียด
   */
  private static extractPersonalityHints(description: string): string[] {
    const hints: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    // คำสำคัญภาษาไทย
    const personalityKeywords = {
      'กล้าหาญ': 'brave',
      'ใจดี': 'kind',
      'ฉลาด': 'intelligent',
      'แข็งแกร่ง': 'strong',
      'อ่อนโยน': 'gentle',
      'มั่นใจ': 'confident',
      'เงียบขรึม': 'mysterious',
      'ร่าเริง': 'cheerful',
      'จริงจัง': 'serious',
      'ตลก': 'humorous'
    };
    
    Object.entries(personalityKeywords).forEach(([thai, english]) => {
      if (lowerDesc.includes(thai)) {
        hints.push(english);
      }
    });
    
    return hints;
  }
}