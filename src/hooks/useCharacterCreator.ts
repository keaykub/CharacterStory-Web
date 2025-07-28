import { useState } from 'react';
import { CharacterInput, ProcessedCharacterData, CharacterPromptD, GeminiResponse } from '@/types/character';
import { CharacterProcessor } from '@/utils/characterProcessor';
import { GeminiService } from '@/services/geminiService';

export const useCharacterCreator = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedCharacterData | null>(null);
  const [characterPrompt, setCharacterPrompt] = useState<CharacterPromptD | null>(null);
  const [formattedPrompt, setFormattedPrompt] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const processCharacterInput = async (input: CharacterInput): Promise<boolean> => {
    setIsProcessing(true);
    setErrors([]);
    
    try {
      // ขั้นตอนที่ 1: ตรวจสอบและทำความสะอาดข้อมูล
      const validatedData = CharacterProcessor.validateAndCleanInput(input);
      
      if (!validatedData.isValid) {
        setErrors(validatedData.errors);
        setIsProcessing(false);
        return false;
      }
      
      // ขั้นตอนที่ 2: เพิ่มข้อมูลเสริม
      const enrichedData = CharacterProcessor.enrichCharacterData(validatedData);
      setProcessedData(enrichedData);
      
      console.log('✅ Character data processed successfully:', enrichedData);
      setIsProcessing(false);
      return true;
      
    } catch (error) {
      console.error('❌ Error processing character data:', error);
      setErrors(['เกิดข้อผิดพลาดในการประมวลผลข้อมูล']);
      setIsProcessing(false);
      return false;
    }
  };

  const generateCharacterPrompt = async (): Promise<boolean> => {
    if (!processedData) {
      setErrors(['ไม่พบข้อมูลที่ประมวลผลแล้ว']);
      return false;
    }

    setIsGenerating(true);
    setErrors([]);

    try {
      console.log('🚀 Generating character with Gemini API...');
      
      const response: GeminiResponse = await GeminiService.generateCharacter(processedData);
      
      if (!response.success) {
        setErrors([response.error || 'เกิดข้อผิดพลาดในการสร้างตัวละคร']);
        setIsGenerating(false);
        return false;
      }

      if (response.data) {
        setCharacterPrompt(response.data);
        
        // สร้าง formatted prompt
        const formatted = GeminiService.formatCharacterPrompt(response.data);
        setFormattedPrompt(formatted);
        
        console.log('✅ Character prompt generated successfully');
      }

      setIsGenerating(false);
      return true;

    } catch (error) {
      console.error('❌ Error generating character prompt:', error);
      setErrors(['เกิดข้อผิดพลาดในการเรียก AI API']);
      setIsGenerating(false);
      return false;
    }
  };

  const resetProcessor = () => {
    setProcessedData(null);
    setCharacterPrompt(null);
    setFormattedPrompt('');
    setErrors([]);
    setIsProcessing(false);
    setIsGenerating(false);
  };

  return {
    // Process functions
    processCharacterInput,
    generateCharacterPrompt,
    resetProcessor,
    
    // States
    isProcessing,
    isGenerating,
    processedData,
    characterPrompt,
    formattedPrompt,
    errors,
    
    // Computed
    isLoading: isProcessing || isGenerating
  };
};