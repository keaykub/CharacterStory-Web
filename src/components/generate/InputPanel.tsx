"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface InputPanelProps {
  credits: number;
  onGenerate: (data: any) => void;
  disabled?: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  credits, 
  onGenerate,
  disabled 
}) => {
  // Character form states
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterGender, setCharacterGender] = useState('');
  const [characterAge, setCharacterAge] = useState('');
  const [characterStyle, setCharacterStyle] = useState('');

  // Validation states
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReset = () => {
    setCharacterName('');
    setCharacterDescription('');
    setCharacterGender('');
    setCharacterAge('');
    setCharacterStyle('');
    setErrors([]);
  };

  const validateCharacterInput = () => {
    const newErrors: string[] = [];

    if (!characterName.trim()) {
      newErrors.push('กรุณาใส่ชื่อตัวละคร');
    }

    if (!characterDescription.trim()) {
      newErrors.push('กรุณาใส่รายละเอียดตัวละคร');
    }

    if (characterDescription.trim().length < 10) {
      newErrors.push('รายละเอียดตัวละครต้องมีอย่างน้อย 10 ตัวอักษร');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleGenerate = async () => {
    if (disabled) {
      console.log('⚠️ Generation disabled (insufficient credits or loading)');
      return;
    }

    setIsProcessing(true);
    
    if (!validateCharacterInput()) {
      setIsProcessing(false);
      return;
    }

    const processedData = {
      name: characterName.trim(),
      description: characterDescription.trim(),
      gender: characterGender || null,
      age: characterAge ? parseInt(characterAge) : null,
      role: characterStyle || null,
      style: characterStyle || null
    };

    console.log('✅ Character data processed, sending to parent:', processedData);
    
    onGenerate({
      type: 'character',
      processedData,
      rawInput: {
        name: characterName,
        description: characterDescription,
        gender: characterGender,
        age: characterAge,
        style: characterStyle
      }
    });

    setIsProcessing(false);
  };

  const renderErrors = () => {
    if (errors.length === 0) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-red-700 text-sm">
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const isGenerateDisabled = !characterName.trim() || !characterDescription.trim() || isProcessing;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>สร้างตัวละครใหม่</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderErrors()}
        
        <div>
          <label className="text-sm font-medium mb-2 block">ชื่อตัวละคร *</label>
          <Input 
            placeholder="เช่น: นักรบซามูไร" 
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">รายละเอียด *</label>
          <Textarea 
            placeholder="บรรยายลักษณะ บุคลิก และลักษณะเด่นของตัวละคร..."
            className="min-h-[120px]"
            value={characterDescription}
            onChange={(e) => setCharacterDescription(e.target.value)}
            disabled={isProcessing}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {characterDescription.length}/200 ตัวอักษร
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">เพศ</label>
            <Select value={characterGender} onValueChange={setCharacterGender} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ชาย">ชาย</SelectItem>
                <SelectItem value="หญิง">หญิง</SelectItem>
                <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">อายุ</label>
            <Input 
              type="number" 
              placeholder="25" 
              value={characterAge}
              onChange={(e) => setCharacterAge(e.target.value)}
              disabled={isProcessing}
              min="1"
              max="200"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">สไตล์ตัวละคร</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              '3D Anime', 
              '2D Anime', 
              'Photorealistic', 
              'Cartoon', 
              'Semi-Realistic',
              'Cinematic',
              'Stylized Art'
            ].map((style) => (
              <Badge 
                key={style} 
                variant="outline" 
                className={`cursor-pointer transition-colors ${
                  characterStyle === style
                    ? 'bg-primary text-primary-foreground'
                    : isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={() => !isProcessing && setCharacterStyle(style)}
              >
                {style}
              </Badge>
            ))}
          </div>
          <Input 
            placeholder="หรือพิมพ์สไตล์เอง เช่น Digital Illustration..." 
            value={characterStyle}
            onChange={(e) => setCharacterStyle(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReset}
            disabled={isProcessing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            รีเซ็ต
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            ใช้ 1 เครดิต (คงเหลือ {credits})
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerateDisabled || disabled}
          >
            <Sparkles className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-pulse' : ''}`} />
            {isProcessing ? 'กำลังประมวลผล...' : 'สร้างตัวละคร'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputPanel;