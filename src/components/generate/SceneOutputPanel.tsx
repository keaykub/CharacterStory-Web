// src/components/generate/SceneOutputPanel.tsx - Fixed with Credits Update
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Edit3, 
  Heart, 
  Languages, 
  ArrowRight, 
  Film, 
  User,
  Check,
  Download,
  RotateCcw,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

// ✅ Import shared types
import type { SceneData, SceneOutputPanelProps } from '@/types/scene';

// ✅ Extended Props Interface
interface ExtendedSceneOutputPanelProps extends SceneOutputPanelProps {
  credits?: number; // ✅ เพิ่ม credits prop
  onCreditsUpdate?: (newCredits: number) => void; // ✅ เพิ่ม callback สำหรับอัพเดท credits
}

const SceneOutputPanel: React.FC<ExtendedSceneOutputPanelProps> = ({
  sceneData,
  prompt,
  isLoading = false,
  error,
  sceneId,
  onContinueScene,
  onSaveScene,
  onPromptUpdate,
  credits = 0, // ✅ เพิ่ม credits prop
  onCreditsUpdate // ✅ เพิ่ม callback prop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  
  // Translation states
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('en');
  
  const { 
    translateMultiline, 
    isTranslating, 
    translationError, 
    lastTranslationStats,
    clearError 
  } = useTranslation();

  // Get current prompt (sceneData.veo3Prompt or fallback prompt)
  const currentPrompt = sceneData?.veo3Prompt || prompt || '';

  // Update edited prompt when scene data changes
  useEffect(() => {
    if (!isTranslated && currentPrompt) {
      setEditedPrompt(currentPrompt);
      setOriginalPrompt(currentPrompt);
      setCurrentLanguage('en');
    }
    setIsEditing(false);
  }, [currentPrompt, isTranslated]);

  // Check favorite status for scene
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!sceneId) return;
      
      try {
        const response = await fetch(`/api/scenes/${sceneId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.scene?.is_favorite || false);
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [sceneId]);

  const detectLanguage = (text: string): 'th' | 'en' => {
    const thaiRegex = /[\u0E00-\u0E7F]/;
    return thaiRegex.test(text) ? 'th' : 'en';
  };

  const handleCopy = async () => {
    try {
      const textToCopy = isEditing ? editedPrompt : (isTranslated ? editedPrompt : currentPrompt);
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      toast.success('คัดลอก VEO3 Prompt แล้ว!');
      
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('❌ Failed to copy:', error);
      toast.error('ไม่สามารถคัดลอกได้');
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      console.log('💾 Saving edited scene prompt');
      if (onPromptUpdate && !isTranslated) {
        onPromptUpdate(editedPrompt);
      }
      setIsEditing(false);
      toast.success('บันทึกการแก้ไขแล้ว');
    } else {
      setIsEditing(true);
    }
  };

  const handleTranslate = async () => {
    if (isTranslating) return;
    
    clearError();
    
    try {
      const textToTranslate = isEditing ? editedPrompt : currentPrompt;
      const targetLang = currentLanguage === 'th' ? 'en' : 'th';
      
      console.log(`🌐 Translating scene: ${currentLanguage} → ${targetLang}`);
      
      const result = await translateMultiline(textToTranslate, currentLanguage, targetLang);
      
      if (result.success) {
        if (!isTranslated) {
          setOriginalPrompt(textToTranslate);
        }
        
        setEditedPrompt(result.translatedText);
        setCurrentLanguage(targetLang);
        setIsTranslated(true);
        setIsEditing(false);
        
        toast.success('แปลเสร็จสิ้น!');
      } else {
        toast.error('ไม่สามารถแปลได้ กรุณาลองใหม่');
      }
      
    } catch (error) {
      console.error('❌ Translation error:', error);
      toast.error('เกิดข้อผิดพลาดในการแปล');
    }
  };

  const handleResetTranslation = () => {
    setEditedPrompt(originalPrompt);
    setCurrentLanguage(detectLanguage(originalPrompt));
    setIsTranslated(false);
    setIsEditing(false);
    toast.success('กลับไปต้นฉบับแล้ว');
  };

  const handleFavorite = async () => {
    if (isUpdatingFavorite) return;
    
    if (!sceneId) {
      toast.error('ไม่สามารถเพิ่มรายการโปรดได้ กรุณาบันทึกฉากก่อน');
      return;
    }

    setIsUpdatingFavorite(true);
    
    try {
      // TODO: Implement scene favorite API
      toast.warning('ฟีเจอร์ favorite สำหรับ scene จะมาเร็วๆ นี้');
    } catch (error) {
      console.error('❌ Failed to update favorite:', error);
      toast.error('ไม่สามารถอัพเดทรายการโปรดได้');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  // ✅ Fixed Continue Scene Handler with Credits Update
  const handleContinue = async () => {
    if (isContinuing) return;
    
    if (!sceneData || !currentPrompt) {
      toast.error('ไม่สามารถสร้างต่อได้ กรุณาลองใหม่');
      return;
    }

    setIsContinuing(true);
    
    try {
      console.log('🎬 Starting scene continuation:', {
        sceneId: sceneData.id,
        title: sceneData.title,
        promptLength: currentPrompt.length,
        currentCredits: credits
      });

      toast.loading('กำลังสร้างฉากต่อ...', { id: 'continue-scene' });
      
      // ✅ Extract aspect ratio from current prompt
      const aspectRatioMatch = currentPrompt.match(/- Aspect Ratio: ([^\n]+)/);
      const aspectRatio = aspectRatioMatch ? aspectRatioMatch[1] : '9:16';
      
      // ✅ Call API directly for scene continuation
      const response = await fetch('/api/generate/scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'scene-continue',
          isContinuation: true,
          previousPrompt: currentPrompt,
          aspectRatio: aspectRatio,
          videoStyle: 'Realistic',
          title: `${sceneData.title} - ต่อ`,
          description: `ต่อจากฉาก: ${sceneData.title}`
        })
      });

      console.log('🔍 API Response status:', response.status);

      // ✅ Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Server returned HTML:', textResponse.substring(0, 200));
        throw new Error('เซิร์ฟเวอร์ส่งข้อมูลผิดพลาด กรุณาลองใหม่');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Continue scene result:', result);

      if (result.success && result.prompt) {
        // ✅ Update the current prompt with the continued scene
        if (onPromptUpdate) {
          onPromptUpdate(result.prompt);
        }
        
        // ✅ Update local state
        setEditedPrompt(result.prompt);
        setOriginalPrompt(result.prompt);
        setIsTranslated(false);
        setIsEditing(false);
        
        // ✅ Update credits in parent component (similar to SceneInputPanel)
        if (result.credits && typeof result.credits.remaining === 'number' && onCreditsUpdate) {
          console.log('💰 Updating credits from', credits, 'to', result.credits.remaining);
          onCreditsUpdate(result.credits.remaining);
        }
        
        const creditsMessage = result.credits?.remaining !== undefined 
          ? ` (เหลือเครดิต: ${result.credits.remaining})` 
          : '';
        
        toast.success(`สร้างฉากต่อเสร็จสิ้น!`);
        
        console.log('✅ Scene continuation completed successfully');
      } else {
        throw new Error(result.error || 'ไม่ได้รับข้อมูลฉากใหม่');
      }
      
    } catch (error) {
      console.error('❌ Continue scene error:', error);
      
      // Specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', { id: 'continue-scene' });
      } else if (error instanceof Error && error.message.includes('HTML')) {
        toast.error('เซิร์ฟเวอร์เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', { id: 'continue-scene' });
      } else if (error instanceof Error && error.message.includes('Insufficient credits')) {
        toast.error('เครดิตไม่เพียงพอ กรุณาเติมเครดิตก่อน', { id: 'continue-scene' });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`, { id: 'continue-scene' });
      }
    } finally {
      setIsContinuing(false);
    }
  };

  const handleSave = () => {
    if (onSaveScene) {
      onSaveScene();
      toast.success('บันทึกฉากแล้ว!');
    } else {
      toast.info('ฟีเจอร์บันทึกจะมาเร็วๆ นี้');
    }
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedPrompt : (isTranslated ? editedPrompt : currentPrompt);
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo3-scene-${sceneData?.title?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('ดาวน์โหลด VEO3 Prompt แล้ว!');
  };

  const getCurrentText = () => {
    if (isEditing) return editedPrompt;
    if (isTranslated) return editedPrompt;
    return currentPrompt;
  };

  // ✅ Check if continue is available (include credits check)
  const canContinue = sceneData && currentPrompt && !isLoading && !isTranslating && !isContinuing && credits > 0;

  // Error State
  if (error) {
    return (
      <Card className="h-fit">
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardContent className="text-center text-muted-foreground py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>กำลังสร้างฉาก...</p>
          <p className="text-xs mt-2">อาจใช้เวลาสักครู่...</p>
        </CardContent>
      </Card>
    );
  }

  // No Data State
  if (!currentPrompt && !sceneData) {
    return (
      <Card className="h-fit">
        <CardContent className="text-center text-muted-foreground py-12">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>กรอกรายละเอียดฉากแล้วกดสร้างเพื่อดูผลลัพธ์</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* VEO3 Prompt */}
      {currentPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                VEO3 Prompt (พร้อมใช้งาน)
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentLanguage === 'en' ? '🇺🇸 English' : '🇹🇭 ไทย'}
                </Badge>
                
                {isTranslated && (
                  <Badge variant="secondary" className="text-xs">
                    <Languages className="w-3 h-3 mr-1" />
                    แปลแล้ว
                  </Badge>
                )}
                
                {lastTranslationStats && lastTranslationStats.fromCache && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <Zap className="w-3 h-3 mr-1" />
                    Cache
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {translationError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-700 text-sm">
                    ⚠️ {translationError}
                  </div>
                </div>
              )}
              
              <div className="bg-muted rounded-lg border">
                {isEditing ? (
                  <Textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="min-h-[400px] font-mono text-sm border-0 bg-transparent resize-none focus:ring-0"
                    placeholder="แก้ไข VEO3 prompt ตามต้องการ..."
                    disabled={isTranslating || isContinuing}
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-[500px] p-4">
                    {getCurrentText()}
                  </pre>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy}
                  disabled={isContinuing}
                  className={copySuccess ? 'bg-green-50 text-green-700 border-green-200' : ''}
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEdit}
                  disabled={isTranslating || isContinuing}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'บันทึก' : 'แก้ไข'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFavorite}
                  disabled={isTranslating || isUpdatingFavorite || !sceneId || isContinuing}
                  className={isFavorited ? 'bg-red-50 text-red-600 border-red-200' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''} ${isUpdatingFavorite ? 'animate-pulse' : ''}`} />
                  {isUpdatingFavorite 
                    ? 'กำลังบันทึก...' 
                    : isFavorited 
                      ? 'Favorited' 
                      : 'Favorite'
                  }
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTranslate}
                  disabled={isTranslating || isContinuing}
                  className={isTranslating ? 'opacity-50' : ''}
                >
                  <Languages className={`w-4 h-4 mr-2 ${isTranslating ? 'animate-spin' : ''}`} />
                  {isTranslating 
                    ? 'กำลังแปล...' 
                    : currentLanguage === 'en' 
                      ? 'แปลเป็นไทย' 
                      : 'แปลเป็นอังกฤษ'
                  }
                </Button>
                
                {isTranslated && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetTranslation}
                    disabled={isTranslating || isContinuing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    ต้นฉบับ
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  disabled={isTranslating || isContinuing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลด
                </Button>
                
                {/* ✅ Fixed Continue Button with Credits Update */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={canContinue && !isContinuing ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : ''}
                >
                  {isContinuing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      สร้างต่อ
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground border-l-2 border-muted-foreground pl-3">
                💡 <strong>วิธีใช้:</strong> คัดลอก prompt นี้ไปวางในช่อง "Prompt" ของ VEO3 แล้วกด Generate เพื่อสร้างวิดีโอ
              </div>
              
              {canContinue && !isContinuing && (
                <div className="text-xs text-blue-600 border-l-2 border-blue-400 pl-3">
                  🎬 <strong>สร้างต่อ:</strong> กดปุ่ม "สร้างต่อ" เพื่อสร้างฉากถัดไปที่เชื่อมโยงกับฉากนี้ (ใช้ 1 เครดิต - เหลือ {credits})
                </div>
              )}
              
              {credits <= 0 && sceneData && currentPrompt && (
                <div className="text-xs text-red-600 border-l-2 border-red-400 pl-3">
                  ⚠️ <strong>เครดิตไม่เพียงพอ:</strong> ต้องมีเครดิตอย่างน้อย 1 เครดิตเพื่อสร้างฉากต่อ
                </div>
              )}
              
              {isContinuing && (
                <div className="text-xs text-blue-600 border-l-2 border-blue-400 pl-3 animate-pulse">
                  ⏳ กำลังสร้างฉากต่อ... กรุณารอสักครู่
                </div>
              )}
              
              {isEditing && (
                <div className="text-xs text-muted-foreground border-l-2 border-orange-400 pl-3">
                  ✏️ คุณกำลังแก้ไข prompt - กด "บันทึก" เพื่อใช้การเปลี่ยนแปลง
                </div>
              )}
              
              {isTranslated && !isEditing && (
                <div className="text-xs text-muted-foreground border-l-2 border-muted-foreground pl-3">
                  🌐 prompt นี้ถูกแปลแล้ว - กด "ต้นฉบับ" เพื่อดูต้นฉบับ หรือ "แก้ไข" เพื่อแก้ไข
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SceneOutputPanel;