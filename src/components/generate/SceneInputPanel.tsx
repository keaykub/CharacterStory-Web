// src/components/generate/SceneInputPanel.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, X, Sparkles, Users } from 'lucide-react';
import { Character } from '@/types/generate';

interface SceneInputPanelProps {
  credits: number;
  savedCharacters: Character[];
  onGenerate: (data: any) => void;
  disabled?: boolean;
}

const SceneInputPanel: React.FC<SceneInputPanelProps> = ({ 
  credits, 
  savedCharacters = [],
  onGenerate,
  disabled 
}) => {
  // Scene title
  const [sceneTitle, setSceneTitle] = useState('');
  
  // 1. Scene description
  const [sceneDescription, setSceneDescription] = useState('');
  
  // 2. Characters - เลือกจำนวนก่อน แล้วค่อยเลือกตัวละคร
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  
  // 3. Video style
  const [videoStyle, setVideoStyle] = useState('');
  
  // 4. Video size (aspect ratio)
  const [aspectRatio, setAspectRatio] = useState('9:16');

  const handleCharacterCountChange = (count: string) => {
    const numCount = parseInt(count);
    setCharacterCount(numCount);
    // Reset selected characters เมื่อเปลี่ยนจำนวน
    setSelectedCharacters([]);
  };

  const addCharacter = (characterId: string) => {
    if (selectedCharacters.length >= characterCount) return;
    
    const character = savedCharacters.find(c => c.id === characterId);
    if (character && !selectedCharacters.find(c => c.id === characterId)) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

    const removeCharacter = (characterId: string) => {
        setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId));
    };

    const handleReset = () => {
        setSceneDescription('');
        setSceneTitle('');  // เพิ่มบรรทัดนี้
        setCharacterCount(0);
        setSelectedCharacters([]);
        setVideoStyle('');
        setAspectRatio('9:16');
    };

  const handleGenerate = () => {
    if (disabled) return;

    onGenerate({
        type: 'scene',
        description: sceneDescription,
        characters: selectedCharacters,
        characterCount: characterCount,
        videoStyle: videoStyle,
        aspectRatio: aspectRatio,
        title: sceneTitle.trim() || undefined  // เพิ่มบรรทัดนี้
    });
  };

  const isGenerateDisabled = !sceneDescription.trim() || disabled;

  // Video styles
  const videoStyles = [
    'Cinematic',
    'Documentary',
    'Anime Style',
    'Realistic',
    'Artistic',
    'Vintage',
    'Modern',
    'Fantasy',
    'Sci-Fi',
    'Horror'
  ];

  // Aspect ratios
  const aspectRatios = [
    { value: '9:16', label: '9:16 (แนวตั้ง - TikTok/Stories)' },
    { value: '16:9', label: '16:9 (แนวนอน - YouTube)' },
    { value: '1:1', label: '1:1 (สี่เหลี่ยมจัตุรัส - Instagram)' },
    { value: '4:3', label: '4:3 (แนวนอนแบบคลาสสิก)' },
    { value: '21:9', label: '21:9 (Cinematic Wide)' }
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>สร้างฉากใหม่</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
            <label className="text-sm font-medium mb-2 block">ชื่อฉาก (ไม่บังคับ)</label>
            <Input 
                placeholder="เช่น: ครอบครัวไทยกินข้าวเย็นร่วมกัน"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
            />
        </div>
        {/* 1. Scene Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            อธิบายฉาก <span className="text-red-500">*</span>
          </label>
          <Textarea 
            placeholder="เช่น: ฉากครอบครัวไทยกินข้าวเย็นด้วยกันในบ้านไม้แบบดั้งเดิม บรรยากาศอบอุ่น มีแสงโคมไฟส่องสวยงาม..."
            value={sceneDescription}
            onChange={(e) => setSceneDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {sceneDescription.length}/500 ตัวอักษร
          </div>
        </div>

        {/* 2. Characters */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            ตัวละครในฉาก (สูงสุด 5 ตัว)
          </label>
          
          {/* Character Count Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                เลือกจำนวนตัวละคร
              </label>
              <Select value={characterCount.toString()} onValueChange={handleCharacterCountChange}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจำนวนตัวละคร">
                    {characterCount > 0 ? (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {characterCount} ตัวละคร
                      </div>
                    ) : (
                      "เลือกจำนวนตัวละคร"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">ไม่มีตัวละคร</SelectItem>
                  <SelectItem value="1">1 ตัวละคร</SelectItem>
                  <SelectItem value="2">2 ตัวละคร</SelectItem>
                  <SelectItem value="3">3 ตัวละคร</SelectItem>
                  <SelectItem value="4">4 ตัวละคร</SelectItem>
                  <SelectItem value="5">5 ตัวละคร</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Characters Display */}
            {selectedCharacters.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  ตัวละครที่เลือก ({selectedCharacters.length}/{characterCount})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacters.map((char) => (
                    <Badge key={char.id} variant="secondary" className="px-3 py-1">
                      {char.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeCharacter(char.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Character Selection */}
            {characterCount > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  เพิ่มตัวละครจากคลัง
                </label>
                {savedCharacters.length > 0 ? (
                  <Select 
                    onValueChange={addCharacter}
                    disabled={selectedCharacters.length >= characterCount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedCharacters.length >= characterCount 
                          ? "เลือกครบแล้ว" 
                          : "เลือกตัวละครจากคลัง"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {savedCharacters
                        .filter(c => !selectedCharacters.find(sc => sc.id === c.id))
                        .map((char) => (
                          <SelectItem key={char.id} value={char.id}>
                            <div className="flex items-center gap-2">
                              <span>{char.name}</span>
                              {char.gender && (
                                <span className="text-xs text-muted-foreground">
                                  ({char.gender}{char.age ? `, ${char.age}ปี` : ''})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    ยังไม่มีตัวละครในคลัง สร้างตัวละครใหม่ในแท็บ Character Creator ก่อน
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Video Style */}
        <div>
          <label className="text-sm font-medium mb-2 block">สไตล์ภาพ</label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {videoStyles.map((style) => (
                <Badge 
                  key={style} 
                  variant="outline" 
                  className={`cursor-pointer transition-colors ${
                    videoStyle === style
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary hover:text-primary-foreground'
                  }`}
                  onClick={() => setVideoStyle(style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="หรือพิมพ์สไตล์เอง เช่น Vintage Film, Dark Fantasy..." 
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value)}
            />
            {videoStyle && (
              <div className="text-xs text-muted-foreground">
                เลือกแล้ว: <span className="font-medium">{videoStyle}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Video Size */}
        <div>
          <label className="text-sm font-medium mb-2 block">ขนาดวิดีโอ</label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aspectRatios.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReset}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเซ็ต
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            ใช้ 1 เครดิต (คงเหลือ {credits})
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            สร้างฉาก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SceneInputPanel;