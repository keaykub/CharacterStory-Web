// src/types/scene.ts - Enhanced Scene Types

export interface SceneCharacter {
  id: string;
  name: string;
  hair: string;
  face: string;
  eyes: string;
  lips: string;
  skin: string;
  ethnicity: string;
  gender: string;
  build: string;
  age: number;
  clothing: {
    top: string;
    bottom: string;
    footwear: string;
    accessories: string;
  };
  distinguishingFeatures: string;
  personalityShown: string;
  position: string;
  initialAction: string;
}

export interface SceneTimeline {
  timeRange: string;
  character: string;
  action: string;
  dialogue?: string;
  duration: string;
}

export interface CameraShot {
  shotNumber: number;
  timeRange: string;
  description: string;
}

export interface AudioLayers {
  dialogue: string;
  ambient: string;
  effects: string;
  music: string;
}

export interface SceneSetting {
  location: string;
  timeOfDay: string;
  lighting: string;
  atmosphere: string;
  backgroundElements: string[];
  props: string[];
}

export interface TechnicalSpecs {
  aspectRatio: string;
  frameRate: string;
  resolution: string;
  duration: string;
}

export interface VisualStyle {
  colorPalette: string;
  moodLighting: string;
  visualStyle: string;
  colorGrading: string;
  specialLook: string;
}

export interface GeminiSceneResponse {
  title: string;
  genre: string;
  setting: SceneSetting;
  technical: TechnicalSpecs;
  visualStyle: VisualStyle;
  characters: SceneCharacter[];
  timeline: SceneTimeline[];
  cameraShots: CameraShot[];
  audioLayers: AudioLayers;
  visualEffects: string[];
  veo3Prompt: string;
}

export interface SceneData {
  id: string;
  title: string;
  description: string;
  genre: string;
  setting: {
    location: string;
    timeOfDay: string;
    lighting: string;
    atmosphere: string;
    props: string[];
  };
  characters: {
    id: string;
    name: string;
    age?: number;
    gender?: string;
    description: string;
    appearance: string;
    personality: string;
    role: string;
    position: string;
    action: string;
  }[];
  timeline: {
    timeRange: string;
    character: string;
    action: string;
    dialogue?: string;
  }[];
  technical: {
    aspectRatio: string;
    duration: string;
    resolution: string;
    frameRate: string;
    style: string;
    colorGrading: string;
  };
  cameraShots: string[];
  audioLayers: string[];
  visualEffects: string[];
  veo3Prompt: string;
}

export interface SceneInputData {
  type: 'scene';
  description: string;
  characters: any[];
  characterCount: number;
  videoStyle: string;
  aspectRatio: string;
  title?: string;
}

export interface SceneOutputPanelProps {
  sceneData?: SceneData;
  prompt?: string;
  isLoading?: boolean;
  error?: string;
  sceneId?: string;
  onContinueScene?: (sceneData: SceneData) => void; // เปลี่ยนให้รับ sceneData
  onSaveScene?: () => void;
  onPromptUpdate?: (newPrompt: string) => void;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  gender?: string;
  age?: number;
  role?: string;
  appearance?: string;
  personality?: string;
}

export interface SceneInputPanelProps {
  credits: number;
  savedCharacters: Character[];
  onGenerate: (data: SceneInputData) => void;
  disabled?: boolean;
}

export interface SceneValidationError {
  field: string;
  message: string;
}