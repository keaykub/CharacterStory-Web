import { CharacterPromptD } from '@/types/character';

interface GeminiResponse {
  success: boolean;
  data?: CharacterPromptD;
  error?: string;
  rawResponse?: string;
}

// ✅ เพิ่ม enum สำหรับ Realism Types
export enum RealismType {
  PHOTOREALISTIC = "Photorealistic",
  ANIME_3D = "3D Anime Style", 
  ANIME_2D = "2D Anime Style",
  CARTOON = "Cartoon Style",
  SEMI_REALISTIC = "Semi-Realistic",
  STYLIZED = "Stylized Art",
  CINEMATIC = "Cinematic Style",
  ILLUSTRATION = "Digital Illustration",
  CONCEPT_ART = "Concept Art Style"
}

export class GeminiService {
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  /**
   * ✅ เพิ่ม function เพื่อเลือก realism type อัตโนมัติ
   */
  private static determineRealismType(processedData: any): RealismType {
    const { description, role, personalityHints } = processedData;
    const text = `${description} ${role} ${personalityHints?.join(' ') || ''}`.toLowerCase();
    
    // กำหนด realism type ตามคำใบ้
    if (text.includes('anime') || text.includes('อนิเมะ')) {
      return RealismType.ANIME_3D;
    }
    
    if (text.includes('cartoon') || text.includes('การ์ตูน')) {
      return RealismType.CARTOON;
    }
    
    if (text.includes('realistic') || text.includes('สมจริง')) {
      return RealismType.PHOTOREALISTIC;
    }
    
    if (text.includes('cinematic') || text.includes('ภาพยนตร์')) {
      return RealismType.CINEMATIC;
    }
    
    if (text.includes('concept') || text.includes('แนวคิด')) {
      return RealismType.CONCEPT_ART;
    }
    
    // Default สำหรับบทบาทต่างๆ
    if (role.includes('นักรบ') || role.includes('ซามูไร') || role.includes('warrior')) {
      return RealismType.CINEMATIC;
    }
    
    if (role.includes('แม่มด') || role.includes('เวทย์') || role.includes('magic')) {
      return RealismType.STYLIZED;
    }
    
    if (role.includes('นักสืบ') || role.includes('detective')) {
      return RealismType.SEMI_REALISTIC;
    }
    
    // Default fallback
    return RealismType.ANIME_3D;
  }

  /**
   * ✅ อัพเดต prompt ให้รองรับ realism types หลากหลาย
   */
  static createCharacterPrompt(processedData: any): string {
    const { name, description, gender, age, role, personalityHints, ageGroup } = processedData;
    const recommendedRealism = this.determineRealismType(processedData);
    
    return `
You are a professional character designer AI. Create a detailed character profile based on the input data.

**INPUT DATA:**
- Name: ${name}
- Description: ${description}
- Gender: ${gender}
- Age: ${age || 'Not specified'}
- Role: ${role}
- Age Group: ${ageGroup}
- Personality Hints: ${personalityHints?.join(', ') || 'None'}
- Recommended Style: ${recommendedRealism}

**INSTRUCTIONS:**
1. Create a comprehensive character profile following the exact JSON structure provided
2. Fill ALL fields - if information is not provided, create appropriate details that fit the character
3. Maintain consistency across all attributes
4. Use descriptive, visual language suitable for AI image generation
5. Keep the character culturally appropriate and visually appealing
6. Choose the most appropriate realism type from the available options

**AVAILABLE REALISM TYPES:**
- "Photorealistic": Hyper-realistic, lifelike human features
- "3D Anime Style": Modern 3D anime with detailed features
- "2D Anime Style": Traditional flat anime illustration style
- "Cartoon Style": Simplified, exaggerated cartoon features
- "Semi-Realistic": Blend of realistic and stylized elements
- "Stylized Art": Artistic interpretation with unique style
- "Cinematic Style": Movie-quality realistic rendering
- "Digital Illustration": High-quality digital art style
- "Concept Art Style": Professional concept art rendering

**REQUIRED JSON OUTPUT FORMAT:**
\`\`\`json
{
  "name": "character full name",
  "nickname": "character nickname or short name",
  "role": "character role/profession",
  "gender": "Male/Female/Non-binary",
  "age": "age or age range",
  "ethnicity": "character ethnicity based on name and context",
  "bodyType": "body type description (athletic, slim, muscular, etc.)",
  "heightWeight": "height and weight description",
  "skinTone": "skin tone description",
  "faceShape": "face shape description (oval, round, square, etc.)",
  "faceFeatures": "detailed facial features description",
  "eyes": "eye color, shape, and characteristics",
  "eyebrows": "eyebrow description",
  "lips": "lip description",
  "hairStyle": "hair style description",
  "hairColor": "hair color",
  "hairDetails": "additional hair details (texture, length, etc.)",
  "topShirt": "top/shirt description",
  "bottomPantsSkirt": "bottom wear description",
  "outerwear": "outer garment description",
  "shoes": "footwear description",
  "fabricMaterial": "fabric and material details",
  "headAccessories": "head accessories description (or 'None')",
  "jewelry": "jewelry description (or 'None')",
  "otherAccessories": "other accessories description (or 'None')",
  "personalityTraits": "personality traits description",
  "confidenceLevel": "confidence level description",
  "cameraPresence": "camera presence description",
  "initialPose": "starting pose description",
  "bodyLanguage": "body language description",
  "voicePitch": "voice pitch description",
  "speakingStyle": "speaking style description",
  "accentDialect": "accent or dialect description",
  "voiceCharacteristics": "voice characteristics description",
  "uniqueTraits": "unique character traits",
  "specialEffects": "special visual effects if any (or 'None')",
  "realismType": "choose from available realism types above"
}
\`\`\`

**IMPORTANT:** 
- Return ONLY the JSON object, no additional text
- Ensure all fields are filled with meaningful descriptions
- Make descriptions vivid and suitable for AI image generation
- Choose realism type that best fits the character concept
- Keep cultural sensitivity in mind
- Use "None" for accessories/effects if not applicable
`;
  }

  /**
   * เรียก Gemini API (ไม่เปลี่ยนแปลง)
   */
  static async generateCharacter(processedData: any): Promise<GeminiResponse> {
    try {
      if (!this.API_KEY) {
        return {
          success: false,
          error: 'Gemini API key not configured'
        };
      }

      const prompt = this.createCharacterPrompt(processedData);
      
      console.log('🚀 Sending request to Gemini API...');
      console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }

      const rawResponse = data.candidates[0].content.parts[0].text;
      console.log('📥 Raw Gemini response:', rawResponse);

      // แยก JSON จากการตอบกลับ
      const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       rawResponse.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      const characterData: CharacterPromptD = JSON.parse(jsonString);

      // Validate required fields
      const requiredFields = ['name', 'role', 'gender'];
      const missingFields = requiredFields.filter(field => !characterData[field as keyof CharacterPromptD]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('✅ Character generated successfully:', characterData.name);

      return {
        success: true,
        data: characterData,
        rawResponse
      };

    } catch (error) {
      console.error('❌ Gemini API error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        rawResponse: undefined
      };
    }
  }

  /**
   * ✅ อัพเดต formatting ให้แสดง realism type ได้ดีขึ้น
   */
  static formatCharacterPrompt(character: CharacterPromptD): string {
    return `
📋 **Character Identity Template**

👤 **1. ชื่อ / บทบาท (Name / Role)**
• Name: ${character.name}
• Nickname: ${character.nickname}
• Role: ${character.role}

🧑‍🎨 **2. เพศ / อายุ / เชื้อชาติ (Gender / Age / Ethnicity)**
• Gender: ${character.gender}
• Age: ${character.age}
• Ethnicity: ${character.ethnicity}

💃 **3. รูปร่าง / ผิว (Body / Skin)**
• Body type: ${character.bodyType}
• Height & Weight: ${character.heightWeight}
• Skin tone: ${character.skinTone}

👤 **4. ใบหน้า (Face)**
• Face shape: ${character.faceShape}
• Face features: ${character.faceFeatures}

👁️ **5. ดวงตา / คิ้ว (Eyes / Eyebrows)**
• Eyes: ${character.eyes}
• Eyebrows: ${character.eyebrows}

👄 **6. ริมฝีปาก (Lips)**
• Lips: ${character.lips}

💇‍♀️ **7. ผม (Hair)**
• Hair style: ${character.hairStyle}
• Hair color: ${character.hairColor}
• Hair details: ${character.hairDetails}

👗 **8. เครื่องแต่งกาย (Outfit)**
• Top/Shirt: ${character.topShirt}
• Bottom/Pants/Skirt: ${character.bottomPantsSkirt}
• Outerwear: ${character.outerwear}
• Shoes: ${character.shoes}
• Fabric/Material: ${character.fabricMaterial}

💎 **9. เครื่องประดับ (Accessories)**
• Head accessories: ${character.headAccessories}
• Jewelry: ${character.jewelry}
• Other accessories: ${character.otherAccessories}

🎭 **10. บุคลิกภาพ (Personality)**
• Personality traits: ${character.personalityTraits}
• Confidence level: ${character.confidenceLevel}
• Camera presence: ${character.cameraPresence}

🕴️ **11. ท่าทางเริ่มต้น (Starting Pose)**
• Initial pose: ${character.initialPose}
• Body language: ${character.bodyLanguage}

🎙️ **12. โทนเสียง (Voice Tone)**
• Voice pitch: ${character.voicePitch}
• Speaking style: ${character.speakingStyle}
• Accent/Dialect: ${character.accentDialect}
• Voice characteristics: ${character.voiceCharacteristics}

✨ **13. ลักษณะพิเศษ (Special Features)**
• Unique traits: ${character.uniqueTraits}
• Special effects: ${character.specialEffects}

🖼️ **14. ภาพความสมจริง (Visual Style)**
• Realism type: ${character.realismType}
`.trim();
  }

  /**
   * ✅ เพิ่ม utility function เพื่อรับ realism types ทั้งหมด
   */
  static getAllRealismTypes(): { value: RealismType; label: string; description: string }[] {
    return [
      {
        value: RealismType.PHOTOREALISTIC,
        label: "Photorealistic",
        description: "ภาพถ่ายคุณภาพสูง สมจริงทุกรายละเอียด"
      },
      {
        value: RealismType.CINEMATIC,
        label: "Cinematic Style", 
        description: "สไตล์ภาพยนตร์คุณภาพสูง"
      },
      {
        value: RealismType.ANIME_3D,
        label: "3D Anime Style",
        description: "อนิเมะ 3 มิติสมัยใหม่"
      },
      {
        value: RealismType.ANIME_2D,
        label: "2D Anime Style", 
        description: "อนิเมะแบบดั้งเดิม 2 มิติ"
      },
      {
        value: RealismType.SEMI_REALISTIC,
        label: "Semi-Realistic",
        description: "ผสมผสานระหว่างสมจริงและสไตล์"
      },
      {
        value: RealismType.STYLIZED,
        label: "Stylized Art",
        description: "ศิลปะสไตล์เฉพาะตัว"
      },
      {
        value: RealismType.CARTOON,
        label: "Cartoon Style",
        description: "การ์ตูนน่ารักแบบง่าย"
      },
      {
        value: RealismType.ILLUSTRATION,
        label: "Digital Illustration",
        description: "ภาพประกอบดิจิทัลคุณภาพสูง"
      },
      {
        value: RealismType.CONCEPT_ART,
        label: "Concept Art Style",
        description: "งานศิลปะคอนเซปต์มืออาชีพ"
      }
    ];
  }
}