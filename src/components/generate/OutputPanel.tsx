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
  User,
  Check,
  Download,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCharacters } from '@/contexts/CharactersContext';
import { toast } from 'sonner';

interface OutputPanelProps {
  prompt: string;
  isLoading?: boolean;
  onPromptUpdate?: (newPrompt: string) => void;
  characterId?: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ 
  prompt, 
  isLoading = false,
  onPromptUpdate,
  characterId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  
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

  const { toggleFavorite: toggleFavoriteInContext } = useCharacters();

  // Update edited prompt when prompt changes
  useEffect(() => {
    if (!isTranslated) {
      setEditedPrompt(prompt);
      setOriginalPrompt(prompt);
      setCurrentLanguage('en');
    }
    setIsEditing(false);
  }, [prompt, isTranslated]);

  // Check favorite status for character
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!characterId) return;
      
      try {
        const response = await fetch(`/api/characters/${characterId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.character?.is_favorite || false);
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [characterId]);

  const detectLanguage = (text: string): 'th' | 'en' => {
    const thaiRegex = /[\u0E00-\u0E7F]/;
    return thaiRegex.test(text) ? 'th' : 'en';
  };

  const handleCopy = async () => {
    try {
      const textToCopy = isEditing ? editedPrompt : (isTranslated ? editedPrompt : prompt);
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      toast.success('คัดลอกแล้ว!');
      
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('❌ Failed to copy:', error);
      toast.error('ไม่สามารถคัดลอกได้');
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      console.log('💾 Saving edited character prompt');
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
      const textToTranslate = isEditing ? editedPrompt : prompt;
      const targetLang = currentLanguage === 'th' ? 'en' : 'th';
      
      console.log(`🌐 Translating character: ${currentLanguage} → ${targetLang}`);
      
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
    
    if (!characterId) {
      toast.error('ไม่สามารถเพิ่มรายการโปรดได้ กรุณาบันทึกตัวละครก่อน');
      return;
    }

    setIsUpdatingFavorite(true);
    
    try {
      await toggleFavoriteInContext(characterId, !isFavorited);
      setIsFavorited(!isFavorited);
      
      toast.success(
        !isFavorited 
          ? 'เพิ่มในรายการโปรดแล้ว' 
          : 'ลบออกจากรายการโปรดแล้ว'
      );
    } catch (error) {
      console.error('❌ Failed to update favorite:', error);
      toast.error('ไม่สามารถอัพเดทรายการโปรดได้');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedPrompt : (isTranslated ? editedPrompt : prompt);
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `character-prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('ดาวน์โหลดเสร็จสิ้น!');
  };

  const getCurrentText = () => {
    if (isEditing) return editedPrompt;
    if (isTranslated) return editedPrompt;
    return prompt;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ผลลัพธ์</CardTitle>
          
          {prompt && (
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
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>กำลังสร้างตัวละคร...</p>
            <p className="text-xs mt-2">อาจใช้เวลาสักครู่...</p>
          </div>
        ) : prompt ? (
          <div className="space-y-4">
            {translationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-red-700 text-sm">
                  ⚠️ {translationError}
                </div>
              </div>
            )}
            
            <div className="bg-muted p-4 rounded-lg">
              {isEditing ? (
                <Textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="min-h-[400px] font-mono text-sm border-0 bg-transparent resize-none focus:ring-0"
                  placeholder="แก้ไข prompt ตามต้องการ..."
                  disabled={isTranslating}
                />
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-[500px]">
                  {getCurrentText()}
                </pre>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
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
                    Copy
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                disabled={isTranslating}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFavorite}
                disabled={isTranslating || isUpdatingFavorite || !characterId}
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
                disabled={isTranslating}
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
                  disabled={isTranslating}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ต้นฉบับ
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isTranslating}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            {isEditing && (
              <div className="text-xs text-muted-foreground border-l-2 border-orange-400 pl-3">
                💡 คุณกำลังแก้ไข prompt - กด "Save" เพื่อบันทึกการเปลี่ยนแปลง
              </div>
            )}
            
            {isTranslated && !isEditing && (
              <div className="text-xs text-muted-foreground border-l-2 border-blue-400 pl-3">
                🌐 prompt นี้ถูกแปลแล้ว - กด "ต้นฉบับ" เพื่อดูต้นฉบับ หรือ "Edit" เพื่อแก้ไข
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>กรอกรายละเอียดตัวละครแล้วกดสร้างเพื่อดูผลลัพธ์</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutputPanel;