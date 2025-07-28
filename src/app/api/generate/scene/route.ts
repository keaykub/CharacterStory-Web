// src/app/api/generate/scene/route.ts - Fixed with Better Error Handling
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

// ✅ Enhanced Error Response Helper
function createErrorResponse(error: string, status: number = 500, details?: any) {
  console.error(`❌ API Error [${status}]:`, error, details);
  return NextResponse.json(
    { 
      success: false,
      error,
      details: details?.message || details,
      timestamp: new Date().toISOString()
    },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

// ✅ Fixed Continuation Prompt for 8-Second Scenes
function createContinuationPrompt(
  previousPrompt: string,
  aspectRatio: string,
  videoStyle: string
): string {
  return `You are a professional VEO3 scene creator. Create a CONTINUATION scene that flows naturally from the previous scene.

PREVIOUS SCENE TO CONTINUE FROM:
${previousPrompt}

CONTINUATION REQUIREMENTS:
⚠️ CRITICAL - CHARACTER IDENTITY MUST REMAIN 100% IDENTICAL:
- Extract ALL character details from the previous scene exactly
- Keep every detail: hair, face, eyes, clothing, personality, etc.
- Characters must be IDENTICAL in the new scene

⚠️ CRITICAL - MAINTAIN CONSISTENCY:
- Use same location or logical next location
- Keep same lighting/time progression (or natural progression)
- Maintain same visual style and genre
- Keep same aspect ratio: ${aspectRatio}
- Keep same video style: ${videoStyle}

🎬 CREATE NATURAL CONTINUATION:
- Progress the story naturally by 8 seconds (continuing the timeline)
- Change camera angles for fresh perspective  
- Add new actions/dialogue while maintaining character consistency
- Create logical story flow from previous scene
- Keep the same technical specifications
- Duration MUST be exactly 8 seconds

⏱️ TIMELINE CONTINUATION:
- If previous scene was 0-8s, this scene should be 8-16s
- If previous scene was 8-16s, this scene should be 16-24s
- Continue the natural progression of time and action
- Each continuation adds exactly 8 seconds to the story

FORMAT: Use the EXACT VEO3 format as before, ensuring:
1. Character Roster section contains IDENTICAL character descriptions
2. New Performance Timeline with different actions/dialogue (continuing from where previous scene ended)
3. New Camera Choreography with different shots
4. Same technical specifications and visual style
5. Duration: 8 seconds (not longer)

🎭 PERFORMANCE TIMELINE FORMAT:
Create exactly 4 timeline segments of 2 seconds each:
[X.0-X+2.0s] Character action and dialogue
[X+2.0-X+4.0s] Character action and dialogue  
[X+4.0-X+6.0s] Character action and dialogue
[X+6.0-X+8.0s] Character action and dialogue

Where X is the continuation start time (8s, 16s, 24s, etc.)

Base this continuation on the previous scene context and create a natural 8-second story progression.`;
}

function createSimpleDirectPrompt(
  description: string,
  aspectRatio: string,
  videoStyle: string,
  characterDetails: any[],
  title?: string
): string {
  const characterInfo = characterDetails.length > 0 
    ? `\n\nEXISTING CHARACTERS TO INCLUDE (use these EXACT details):
${characterDetails.map((char, i) => 
  `Character ${i + 1}: ${char.name}
${char.prompt}`
).join('\n\n')}

IMPORTANT: Use these characters EXACTLY as described in their prompts. Extract and adapt their details for the VEO3 scene format.`
    : '';

  return `You are a professional VEO3 scene creator. Create a detailed 8-second cinematic scene prompt ready for VEO3.

USER REQUEST:
- Title: ${title || 'Auto-generated based on scene'}
- Scene Description: "${description}"
- Video Style: ${videoStyle || 'Realistic'}
- Aspect Ratio: ${aspectRatio}${characterInfo}

INSTRUCTIONS:
1. Create a complete VEO3 prompt that's ready to use immediately
2. If existing characters are provided, incorporate them naturally into the scene
3. Generate additional characters if needed for a compelling scene
4. Use authentic Thai dialogue for Thai scenes, English for international scenes
5. Make the scene cinematic, detailed, and engaging
6. Follow the exact VEO3 format shown below

Create a VEO3 prompt in this EXACT format:

🎬 VEO3 MULTI-CHARACTER SCENE [GENRE: ${videoStyle || 'Realistic/Slice of Life'}]

📍 SETTING & ENVIRONMENT
- Location: [Specific detailed location based on scene]
- Time/Lighting: [Time of day with detailed lighting description]
- Atmosphere: [Emotional atmosphere and mood]
- Background Elements: [List of relevant background elements]
- Props: [Scene-appropriate props and objects]

📹 TECHNICAL SPECIFICATIONS
- Aspect Ratio: ${aspectRatio}
- Frame Rate: 24fps (cinematic feel)
- Resolution: 4K Ultra HD
- Duration: 8 seconds

🎨 VISUAL STYLE & COLOR GRADING
- Color Palette: [Detailed color scheme and palette]
- Mood Lighting: [Lighting mood and emotional impact]
- Visual Style: ${videoStyle || 'Realistic cinematography'}
- Color Grading: [Professional color grading approach]
- Special Look: [Unique visual characteristics and effects]

👥 CHARACTER ROSTER
[For each character, include detailed descriptions:
Character X: [Name]
- Hair: [Detailed hair description]
- Face: [Face shape and features]
- Eyes: [Eye color and expression]
- Lips: [Lip description]
- Skin: [Skin tone and texture]
- Ethnicity: [Specific ethnicity]
- Gender: [Gender]
- Build: [Height and build description]
- Age: [Age] years old
- Clothing:
  - Top: [Top clothing description]
  - Bottom: [Bottom clothing description]
  - Footwear: [Footwear description]
  - Accessories: [Accessories description]
- Distinguishing Features: [Unique characteristics]
- Personality Shown: [Visible personality traits]
- Position: [Position in frame]
- Initial Action: [What they're doing at scene start]]

🎭 PERFORMANCE TIMELINE (0-8s)
[Create exactly 4 timeline segments, each 2 seconds, using this EXACT format:
[0.0-2.0s] [Character Name] says in Thai: \"[Specific natural dialogue]\" + [detailed physical action] (2 seconds)
[2.0-4.0s] [Character Name] says in Thai: \"[Specific natural dialogue]\" + [detailed physical action] (2 seconds)
[4.0-6.0s] [Character Name] says in Thai: \"[Specific natural dialogue]\" + [detailed physical action] (2 seconds)
[6.0-8.0s] [Character Name] says in Thai: \"[Specific natural dialogue]\" + [detailed physical action] (2 seconds)

IMPORTANT: Each dialogue must be authentic Thai conversation that families actually use. Include natural expressions, emotions, and context-appropriate responses.]

🎥 CAMERA CHOREOGRAPHY
[Describe exactly 3-4 camera shots with precise timing and detailed descriptions:
Shot 1 (0-X s): [Detailed shot type, camera movement, framing, and focus]
Shot 2 (X-Y s): [Detailed shot type, camera movement, framing, and focus]  
Shot 3 (Y-8s): [Detailed shot type, camera movement, framing, and focus]

CAMERA REQUIREMENTS:
- Specify exact timing for each shot
- Describe camera movements (pan, tilt, zoom, dolly)
- Detail the framing and composition
- Explain what the camera focuses on and why
- Ensure shots complement the dialogue and actions]

🔊 AUDIO LAYERS
- Dialogue: [Specify clear dialogue quality, character voice distinctions, and emotional tones]
- Ambient: [Detailed environmental sounds specific to the scene location]
- Effects: [Specific foley sounds for character actions and object interactions]
- Music: [Detailed background music style, instruments, and emotional tone]

AUDIO REQUIREMENTS:
- Ensure dialogue is clear and well-separated between characters
- Include specific sound effects that match character actions
- Describe the emotional tone and delivery style of each character's voice
- Mention realistic ambient sounds that enhance the scene atmosphere

✨ VISUAL EFFECTS
[List visual effects, lighting techniques, and cinematic elements]

🚨 IMPORTANT RULES:
NO subtitles, NO text overlays, NO on-screen text, NO dialogue captions.

Base this scene on: "${description}"`;
}

// ✅ Simple Fallback Template
function createSimpleFallback(
  description: string,
  aspectRatio: string,
  characterDetails: any[],
  title?: string,
  videoStyle?: string
): string {
  const characterSection = characterDetails.length > 0 
    ? characterDetails.map((char, index) => `Character ${index + 1}: ${char.name}
- Details from character prompt: ${char.prompt.substring(0, 200)}...`).join('\n\n')
    : `Character 1: Generated Character
- Description: Character suitable for the scene
- Age: Adult
- Gender: Appropriate for scene
- Role: Scene participant
- Action: Engages naturally in scene activities`;

  return `🎬 VEO3 MULTI-CHARACTER SCENE [GENRE: ${videoStyle || 'Realistic/Slice of Life'}]

📍 SETTING & ENVIRONMENT
- Location: ${extractLocationFromDescription(description)}
- Time/Lighting: Natural cinematic lighting with professional setup
- Atmosphere: ${description}
- Background Elements: Contextual elements that enhance the scene narrative
- Props: Scene-appropriate props that support the storytelling

📹 TECHNICAL SPECIFICATIONS
- Aspect Ratio: ${aspectRatio}
- Frame Rate: 24fps (cinematic feel)
- Resolution: 4K Ultra HD
- Duration: 8 seconds

🎨 VISUAL STYLE & COLOR GRADING
- Color Palette: Cinematic colors with natural and warm tones
- Mood Lighting: Professional lighting that enhances the atmosphere
- Visual Style: ${videoStyle || 'Realistic cinematography with artistic touch'}
- Color Grading: Professional color correction for cinematic appeal
- Special Look: Film-quality grain and depth for authenticity

👥 CHARACTER ROSTER
${characterSection}

🎭 PERFORMANCE TIMELINE (0-8s)
[0.0-2.0s] Scene establishment with atmospheric setup and character introduction
[2.0-5.0s] Main scene action unfolds: ${description}
[5.0-8.0s] Natural scene conclusion with authentic character interactions

🎥 CAMERA CHOREOGRAPHY
Shot 1 (0-3s): Wide establishing shot capturing the full scene atmosphere and character positions
Shot 2 (3-6s): Medium shots focusing on character interactions and emotional moments
Shot 3 (6-8s): Close-ups highlighting key details and emotional expressions

🔊 AUDIO LAYERS
- Dialogue: Clear natural conversation appropriate to the scene context
- Ambient: Environmental sounds that enhance the location authenticity
- Effects: Realistic foley sounds supporting character actions and scene elements
- Music: Background music that complements the emotional tone and atmosphere

✨ VISUAL EFFECTS
- Natural lighting interaction with subjects and environment
- Depth of field for professional cinematic focus and bokeh effects
- Environmental atmosphere effects including shadows and natural movement
- Professional composition techniques for visual appeal and storytelling

🚨 IMPORTANT RULES:
NO subtitles, NO text overlays, NO on-screen text, NO dialogue captions.`;
}

// ✅ Generate with Retry Logic
async function generateWithGeminiRetry(
  prompt: string,
  maxRetries = 2
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Gemini attempt ${attempt}/${maxRetries}...`);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        console.log(`✅ Gemini response received (${responseText.length} chars)`);
        
        return { success: true, data: responseText };
        
      } catch (error) {
        console.error(`❌ Gemini attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { success: false, error: 'All retry attempts failed' };
  } catch (error) {
    console.error('❌ Gemini setup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Gemini setup failed' 
    };
  }
}

// ✅ Helper Functions
function extractLocationFromDescription(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('ตลาด') || lowerDesc.includes('market')) {
    return 'Bustling local market with vibrant stalls and authentic atmosphere';
  }
  if (lowerDesc.includes('บ้าน') || lowerDesc.includes('home') || lowerDesc.includes('บ้านไม้')) {
    return 'Traditional Thai home interior with warm, authentic furnishings';
  }
  if (lowerDesc.includes('ห้อง') || lowerDesc.includes('room')) {
    return 'Cozy interior room with comfortable atmosphere';
  }
  if (lowerDesc.includes('สวน') || lowerDesc.includes('garden')) {
    return 'Beautiful garden with lush greenery and natural lighting';
  }
  if (lowerDesc.includes('ร้าน') || lowerDesc.includes('shop') || lowerDesc.includes('ร้านกาแฟ')) {
    return 'Charming local shop with authentic character';
  }
  if (lowerDesc.includes('วัด') || lowerDesc.includes('temple')) {
    return 'Peaceful temple grounds with traditional architecture';
  }
  
  return 'Cinematic location with authentic atmosphere based on scene context';
}

export async function POST(req: Request) {
  try {
    // 1. Authentication
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized - Please log in', 401);
    }

    // 2. Parse request with validation
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400, parseError);
    }

    const { 
      description, 
      aspectRatio, 
      characters = [], 
      title, 
      videoStyle,
      // ✅ Continue Scene fields
      type,
      previousPrompt,
      isContinuation
    } = body;

    // ✅ Check if this is a continuation request
    const isSceneContinuation = type === 'scene-continue' || isContinuation;

    // 3. Validate input
    if (!isSceneContinuation && (!description?.trim() || !aspectRatio)) {
      return createErrorResponse('Missing required fields: description and aspectRatio are required for new scenes', 400);
    }

    if (isSceneContinuation && !previousPrompt?.trim()) {
      return createErrorResponse('Missing required field for continuation: previousPrompt is required', 400);
    }

    console.log('🎬 Scene generation request:', {
      userId,
      type: isSceneContinuation ? 'CONTINUATION' : 'NEW',
      description: description?.substring(0, 50) + '...' || 'N/A (continuation)',
      aspectRatio,
      videoStyle,
      charactersProvided: characters.length,
      timestamp: new Date().toISOString()
    });

    // 4. Check credits และ ดึง user data
    let userData;
    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('id, credits')
        .eq('clerk_id', userId)
        .single();

      if (userError) {
        console.error('❌ User query error:', userError);
        return createErrorResponse('User not found in database', 404, userError);
      }

      if (!data) {
        return createErrorResponse('User profile not found', 404);
      }

      userData = data;
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return createErrorResponse('Database connection failed', 500, dbError);
    }

    if (userData.credits < 1) {
      return createErrorResponse('Insufficient credits. Please purchase more credits to continue.', 400);
    }

    // 5. ดึง character prompts ถ้ามี
    let characterDetails: any[] = [];
    if (characters.length > 0) {
      try {
        const characterPromises = characters.map(async (c: any) => {
          if (!c.id) {
            console.warn('⚠️ Character without ID provided:', c);
            return null;
          }
          
          const { data, error } = await supabase
            .from('characters')
            .select('name, prompt')
            .eq('id', c.id)
            .single();
            
          if (error) {
            console.warn(`⚠️ Failed to fetch character ${c.id}:`, error);
            return null;
          }
          
          return data;
        });
        
        const results = await Promise.all(characterPromises);
        characterDetails = results.filter(Boolean);
        console.log(`📋 Retrieved ${characterDetails.length}/${characters.length} character prompts`);
      } catch (error) {
        console.error('❌ Failed to fetch character details:', error);
        // Continue without character details rather than failing
      }
    }

    // 6. Generate VEO3 Prompt
    let veo3Prompt = "";
    let aiGenerated = false;
    let generationMethod = "template";

    try {
      // ✅ Choose prompt type based on request
      let geminiPrompt: string;
      
      if (isSceneContinuation) {
        // Create continuation prompt
        geminiPrompt = createContinuationPrompt(
          previousPrompt,
          aspectRatio,
          videoStyle || 'Realistic'
        );
        generationMethod = "gemini-continuation";
        console.log('🔄 Creating scene continuation...');
      } else {
        // Create new scene prompt
        geminiPrompt = createSimpleDirectPrompt(
          description,
          aspectRatio,
          videoStyle,
          characterDetails,
          title
        );
        generationMethod = "gemini-with-characters";
        console.log('🆕 Creating new scene...');
      }

      const aiResult = await generateWithGeminiRetry(geminiPrompt, 2);
      
      if (aiResult.success && aiResult.data) {
        veo3Prompt = aiResult.data.trim();
        aiGenerated = true;
        console.log(`✅ ${isSceneContinuation ? 'Continuation' : 'New scene'} generation successful`);
      } else {
        throw new Error(aiResult.error || 'Gemini generation failed');
      }

    } catch (aiError) {
      console.error('❌ Gemini failed, using fallback:', aiError);
      
      // Use fallback templates
      if (isSceneContinuation) {
        // Simple continuation fallback
        veo3Prompt = `🎬 VEO3 CONTINUATION SCENE [PREVIOUS SCENE MAINTAINED]

This is a continuation of the previous scene with natural progression.
All character details, visual style, and technical specifications remain identical.
Only the actions, dialogue, and camera angles have been updated for continuity.

MAINTAINED ELEMENTS FROM PREVIOUS SCENE:
${previousPrompt.substring(0, 1000)}...

[Scene continues with new timeline and camera work while maintaining all original character and visual elements]

📹 TECHNICAL SPECIFICATIONS
- Aspect Ratio: ${aspectRatio}
- Frame Rate: 24fps (cinematic feel)
- Resolution: 4K Ultra HD
- Duration: 8 seconds

🎭 CONTINUATION TIMELINE (8-16s)
[8.0-10.0s] Characters continue their natural progression from previous scene
[10.0-12.0s] New dialogue and actions develop the scene further
[12.0-14.0s] Camera captures different angles of the ongoing interaction
[14.0-16.0s] Scene builds toward next natural transition point

🎥 NEW CAMERA CHOREOGRAPHY
Shot 1 (8-11s): Different angle capturing the continuing action
Shot 2 (11-14s): Close-up shots for emotional depth and character focus
Shot 3 (14-16s): Wide shot establishing the scene's progression

🚨 CONTINUATION RULES:
- Maintain ALL character appearances and personalities exactly
- Keep same location and lighting consistency
- Progress story naturally without major jumps
- Use different camera angles for visual variety
- NO subtitles, NO text overlays, NO on-screen text`;
        
        generationMethod = "continuation-fallback";
      } else {
        veo3Prompt = createSimpleFallback(
          description,
          aspectRatio,
          characterDetails,
          title,
          videoStyle
        );
        generationMethod = "template-with-characters";
      }
      
      aiGenerated = false;
    }

    // 7. Validate generated prompt
    if (!veo3Prompt || veo3Prompt.length < 100) {
      return createErrorResponse('Generated prompt is too short or empty', 500);
    }

    // 8. Save to database
    let scene;
    try {
      const { data, error: sceneError } = await supabase
        .from('scenes')
        .insert({
          user_id: userData.id,
          title: title || (isSceneContinuation ? "Continued Scene" : "Generated Scene"),
          description: description?.trim() || "Scene continuation",
          prompt: veo3Prompt,
          aspect_ratio: aspectRatio,
          character_ids: characters.map((c: any) => c.id).filter(Boolean),
        })
        .select()
        .single();

      if (sceneError) {
        console.error('❌ Scene save error:', sceneError);
        return createErrorResponse('Failed to save scene to database', 500, sceneError);
      }

      scene = data;
      console.log('💾 Scene saved with ID:', scene.id);
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
      return createErrorResponse('Database error during scene save', 500, dbError);
    }

    // 9. Deduct credits with rollback on failure
    try {
      const { error: creditUpdateError } = await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', userData.id);

      if (creditUpdateError) {
        console.error('❌ Credit update error:', creditUpdateError);
        
        // Rollback: Delete the created scene
        await supabase
          .from('scenes')
          .delete()
          .eq('id', scene.id);
        
        return createErrorResponse('Failed to deduct credits - transaction rolled back', 500, creditUpdateError);
      }
    } catch (creditError) {
      console.error('❌ Credit transaction error:', creditError);
      
      // Rollback: Delete the created scene
      try {
        await supabase
          .from('scenes')
          .delete()
          .eq('id', scene.id);
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
      
      return createErrorResponse('Credit transaction failed', 500, creditError);
    }

    // 10. Log credit usage
    try {
      await supabase
        .from('credit_logs')
        .insert({
          user_id: userData.id,
          amount: -1,
          reason: `Scene ${isSceneContinuation ? 'continuation' : 'generation'} (${generationMethod}): ${description?.substring(0, 50) || 'continuation'}...`
        });
    } catch (logError) {
      console.warn('⚠️ Failed to log credit usage:', logError);
      // Don't fail the request for logging errors
    }

    // 11. Prepare scene data for output
    const sceneData = {
      id: scene.id,
      title: scene.title || (isSceneContinuation ? "Continued Scene" : "Generated Scene"),
      description: description || "Scene continuation",
      veo3Prompt: veo3Prompt
    };

    console.log(`✅ Scene ${isSceneContinuation ? 'continuation' : 'generation'} completed successfully`);

    // 12. Return success response
    return NextResponse.json(
      {
        success: true,
        prompt: veo3Prompt,
        sceneData: sceneData,
        scene: {
          id: scene.id,
          title: scene.title
        },
        generation: {
          method: generationMethod,
          aiGenerated,
          promptLength: veo3Prompt.length,
          charactersUsed: characterDetails.length,
          isContinuation: isSceneContinuation
        },
        credits: {
          used: 1,
          remaining: userData.credits - 1
        },
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('❌ Unexpected scene generation error:', error);
    
    return createErrorResponse(
      'Internal server error during scene generation',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}