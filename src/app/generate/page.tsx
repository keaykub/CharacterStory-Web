// src/app/generate/page.tsx - Protected with Authentication
"use client";

import React, { useState } from 'react';
import { useUser, SignInButton } from "@clerk/nextjs";
import SubTabNavbar from '@/components/generate/SubTabNavbar';
import SceneInputPanel from '@/components/generate/SceneInputPanel';
import InputPanel from '@/components/generate/InputPanel';
import OutputPanel from '@/components/generate/OutputPanel';
import SceneOutputPanel from '@/components/generate/SceneOutputPanel';
import { TabType, Character } from '@/types/generate';
import { Button } from '@/components/ui/button';
import { Copy, Edit3, Heart, HeartOff, LogIn, Sparkles,Film,Users} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCredits } from '@/contexts/CreditsContext';
import { useCharacters } from '@/contexts/CharactersContext';
import { toast } from 'sonner';

// ✅ Import shared scene types
import type { SceneData } from '@/types/scene';

const GeneratePage = () => {
  // ✅ Authentication check
  const { isSignedIn, isLoaded, user } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>('scene');
  
  // ✅ ใช้ context method ที่มีอยู่แล้ว
  const { credits, isLoading: creditsLoading, refetchCredits, deductCreditsLocally, updateCreditsLocally } = useCredits();
  
  const { 
    characters: favoriteCharacters, 
    isLoading: charactersLoading, 
    toggleFavorite,
    refetchCharacters 
  } = useCharacters({ favoritesOnly: true });

  const { 
    characters: allCharacters, 
    isLoading: allCharactersLoading,
    addNewCharacter
  } = useCharacters();
  
  // ✅ แยก state สำหรับ scene และ character
  const [scenePrompt, setScenePrompt] = useState<string>('');
  const [characterPrompt, setCharacterPrompt] = useState<string>('');
  
  // ✅ เพิ่ม state สำหรับ scene data และ error
  const [sceneData, setSceneData] = useState<SceneData | undefined>(undefined);
  const [sceneError, setSceneError] = useState<string>('');
  const [characterError, setCharacterError] = useState<string>('');
  
  const [lastCreatedCharacterId, setLastCreatedCharacterId] = useState<string | null>(null);
  const [lastCreatedSceneId, setLastCreatedSceneId] = useState<string | null>(null);
  
  const [isSceneLoading, setIsSceneLoading] = useState<boolean>(false);
  const [isCharacterLoading, setIsCharacterLoading] = useState<boolean>(false);

  // ✅ Loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ✅ Authentication required screen
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h1 className="text-2xl font-bold mb-2">VEO3 Generator</h1>
          <p className="text-muted-foreground mb-6">
            เข้าสู่ระบบเพื่อสร้างฉากและตัวละครด้วย AI
          </p>
          
          <SignInButton mode="modal">
            <Button size="lg" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              เข้าสู่ระบบ
            </Button>
          </SignInButton>
          
          <p className="text-xs text-muted-foreground mt-4">
            ฟรี - รับเครดิตฟรีทันที
          </p>
        </div>
      </div>
    );
  }

  // ✅ Credits update callback for SceneOutputPanel
  const handleCreditsUpdate = (newCredits: number) => {
    console.log('💰 Credits updated from', credits, 'to', newCredits);
    updateCreditsLocally(newCredits);
  };

  const handleGenerate = async (data: any) => {
    try {
      if (credits < 1) {
        toast.error('เครดิตไม่เพียงพอ กรุณาซื้อเครดิตเพิ่ม');
        return;
      }

      if (data.type === 'scene') {
        setIsSceneLoading(true);
        setScenePrompt('');
        setSceneData(undefined);
        setSceneError('');
        
        deductCreditsLocally(1);
        
        try {
          const response = await fetch('/api/generate/scene', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description: data.description,
              aspectRatio: data.aspectRatio,
              characters: data.characters,
              characterCount: data.characterCount,
              videoStyle: data.videoStyle,
              title: data.title || null
            }),
          });
          
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to generate scene');
          }

          if (result.success) {
            setScenePrompt(result.prompt);
            setSceneData(result.sceneData);
            setLastCreatedSceneId(result.scene?.id || null);
            
            // ✅ Update credits from API response
            if (result.credits && typeof result.credits.remaining === 'number') {
              updateCreditsLocally(result.credits.remaining);
            }
            
            toast.success('สร้างฉากเสร็จสิ้น!');
          }

        } catch (error: any) {
          console.error('❌ Scene generation failed:', error);
          refetchCredits();
          const errorMessage = error.message || 'เกิดข้อผิดพลาดในการสร้างฉาก';
          setSceneError(errorMessage);
          toast.error(errorMessage);
        }
        
        setIsSceneLoading(false);
        
      } else if (data.type === 'character' && data.processedData) {
        setIsCharacterLoading(true);
        setCharacterPrompt('');
        setCharacterError('');
        
        deductCreditsLocally(1);
        
        console.log('🎯 Starting character generation with processed data:', data.processedData);
        
        try {
          const response = await fetch('/api/generate/character', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: data.processedData.name,
              description: data.processedData.description,
              gender: data.processedData.gender,
              age: data.processedData.age,
              role: data.processedData.role
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to generate character');
          }

          if (result.success) {
            setCharacterPrompt(result.prompt);
            setLastCreatedCharacterId(result.character?.id || null);
            
            // ✅ Update credits from API response
            if (result.credits && typeof result.credits.remaining === 'number') {
              updateCreditsLocally(result.credits.remaining);
            }
            
            if (result.character) {
              addNewCharacter(result.character);
            }
            
            if (result.aiGenerated) {
              toast.success('สร้างตัวละครด้วย AI เสร็จสิ้น!');
            } else {
              toast.warning('สร้างตัวละครด้วย Template เสร็จสิ้น (AI ไม่พร้อมใช้งาน)');
            }
            
            console.log('✅ Character generation completed successfully');
          }

        } catch (error: any) {
          console.error('❌ Character generation failed:', error);
          refetchCredits();
          const errorMessage = error.message || 'เกิดข้อผิดพลาดในการสร้างตัวละคร';
          setCharacterError(errorMessage);
          toast.error(errorMessage);
        }
        
        setIsCharacterLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด');
      
      if (data.type === 'scene') {
        setSceneError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
        setIsSceneLoading(false);
      } else {
        setCharacterError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
        setIsCharacterLoading(false);
      }
    }
  };

  // ✅ Scene callback functions
  const handleContinueScene = async () => {
    console.log('🎬 Continue scene from:', sceneData?.title);
    
    if (!sceneData) {
      toast.error('ไม่มีข้อมูลฉากสำหรับสร้างต่อ');
      return;
    }

    setIsSceneLoading(true);
    setSceneError('');
    
    try {
      const response = await fetch('/api/generate/scene/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousSceneId: lastCreatedSceneId,
          previousSceneData: sceneData
        }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to continue scene');
      }

      if (result.success) {
        setSceneData(result.sceneData);
        setScenePrompt(result.prompt);
        setLastCreatedSceneId(result.scene?.id || null);
        
        // ✅ Update credits from API response
        if (result.credits && typeof result.credits.remaining === 'number') {
          updateCreditsLocally(result.credits.remaining);
        }
        
        toast.success('สร้างฉากต่อเสร็จสิ้น!');
      }

    } catch (error: any) {
      console.error('❌ Continue scene failed:', error);
      setSceneError(error.message || 'เกิดข้อผิดพลาดในการสร้างฉากต่อ');
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างฉากต่อ');
    }
    
    setIsSceneLoading(false);
  };

  const handleSaveScene = async () => {
    if (!sceneData || !lastCreatedSceneId) {
      toast.error('ไม่มีข้อมูลฉากสำหรับบันทึก');
      return;
    }

    try {
      const response = await fetch(`/api/scenes/${lastCreatedSceneId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('บันทึกฉากแล้ว!');
      } else {
        throw new Error('Failed to save scene');
      }
    } catch (error) {
      console.error('❌ Save scene failed:', error);
      toast.error('ไม่สามารถบันทึกฉากได้');
    }
  };

  const handleScenePromptUpdate = (newPrompt: string) => {
    setScenePrompt(newPrompt);
    if (sceneData) {
      setSceneData({
        ...sceneData,
        veo3Prompt: newPrompt
      });
    }
  };

  const handleToggleFavorite = async (characterId: string, currentFavoriteStatus: boolean) => {
    try {
      await toggleFavorite(characterId, !currentFavoriteStatus);
      toast.success(
        !currentFavoriteStatus 
          ? 'เพิ่มในรายการโปรดแล้ว' 
          : 'ลบออกจากรายการโปรดแล้ว'
      );
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัพเดทรายการโปรด');
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('คัดลอก Prompt แล้ว!');
    } catch (error) {
      toast.error('ไม่สามารถคัดลอกได้');
    }
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
  };

  // ✅ แยก function สำหรับ render input panel
  const renderInputPanel = () => {
    if (activeTab === 'scene') {
      return (
        <SceneInputPanel
          credits={credits}
          savedCharacters={allCharacters}
          onGenerate={handleGenerate}
          disabled={isSceneLoading}
        />
      );
    }
    
    // Character mode
    return (
      <InputPanel
        credits={credits}
        onGenerate={handleGenerate}
        disabled={isCharacterLoading}
      />
    );
  };

  // ✅ แยก function สำหรับ render output panel with credits props
  const renderOutputPanel = () => {
    if (activeTab === 'scene') {
      return (
        <SceneOutputPanel 
          sceneData={sceneData}
          prompt={scenePrompt}
          isLoading={isSceneLoading}
          error={sceneError}
          sceneId={lastCreatedSceneId || undefined}
          credits={credits}
          onCreditsUpdate={handleCreditsUpdate}
          onContinueScene={handleContinueScene}
          onSaveScene={handleSaveScene}
          onPromptUpdate={handleScenePromptUpdate}
        />
      );
    }
    
    // Character mode
    return (
      <OutputPanel
        prompt={characterPrompt}
        isLoading={isCharacterLoading}
        characterId={lastCreatedCharacterId || undefined}
        onPromptUpdate={setCharacterPrompt}
      />
    );
  };

  const renderMainContent = () => {
    if (activeTab === 'my-characters') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">ตัวละครโปรดของฉัน</h2>
            <p className="text-sm text-muted-foreground">
              {charactersLoading ? 'กำลังโหลด...' : `${favoriteCharacters.length} ตัวละคร`}
            </p>
          </div>
          
          {charactersLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">กำลังโหลดตัวละคร...</p>
            </div>
          ) : favoriteCharacters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">ยังไม่มีตัวละครในรายการโปรด</p>
              <p className="text-sm text-muted-foreground">สร้างตัวละครใหม่และกดปุ่ม ❤️ เพื่อเพิ่มในรายการโปรด</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteCharacters.map((character) => (
                <Card key={character.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex-1">{character.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(character.id, character.is_favorite)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        {character.is_favorite ? (
                          <Heart className="w-4 h-4 fill-current" />
                        ) : (
                          <HeartOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {character.description}
                    </p>
                    {character.gender && (
                      <p className="text-xs text-muted-foreground mb-2">
                        เพศ: {character.gender} 
                        {character.age && ` | อายุ: ${character.age}`}
                        {character.role && ` | บทบาท: ${character.role}`}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCopyPrompt(character.prompt)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Prompt
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'history') {
      return (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">ประวัติการสร้าง</h2>
          <p className="text-muted-foreground">ฟีเจอร์ History จะมาเร็วๆ นี้...</p>
        </div>
      );
    }

    // Scene Creator และ Character Creator
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input */}
        {renderInputPanel()}

        {/* Right Panel - Output */}
        {renderOutputPanel()}
      </div>
    );
  };

  // ✅ Authenticated user content
  return (
    <div className="min-h-screen bg-background">
      {/* Sub Tab Navigation */}
      <SubTabNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default GeneratePage;