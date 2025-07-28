// hooks/useTranslation.ts
import { useState } from 'react';

// Types
interface TranslationResult {
  success: boolean;
  translatedText: string;
  originalText: string;
  fromCache: boolean;
  error?: string;
}

interface MultilineTranslationResult {
  success: boolean;
  translatedText: string;
  originalText: string;
  cacheHits: number;
  apiCalls: number;
  error?: string;
}

interface AutoTranslationResult extends TranslationResult {
  detectedLanguage: 'th' | 'en';
  targetLanguage: 'th' | 'en';
}

interface TranslationStats {
  cacheHits: number;
  apiCalls: number;
  fromCache: boolean;
}

interface CacheStats {
  totalItems: number;
  oldestItem: Date | null;
  newestItem: Date | null;
  cacheSize: string;
}

// Translation Service
class TranslationService {
  private static readonly MYMEMORY_API = 'https://api.mymemory.translated.net/get';
  private static readonly CACHE_KEY = 'characterstory_translation_cache';
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 วัน
  private static readonly MAX_CACHE_SIZE = 100;

  // สร้าง hash สำหรับ cache key
  private static createHash(text: string, fromLang: string, toLang: string): string {
    const input = `${text}_${fromLang}_${toLang}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // จัดการ cache
  private static getCache(): any[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];
      
      const parsedCache = JSON.parse(cached);
      const now = Date.now();
      
      return parsedCache.filter((item: any) => {
        return (now - item.timestamp) < this.CACHE_EXPIRY;
      });
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return [];
    }
  }

  private static saveCache(cache: any[]): void {
    try {
      const limitedCache = cache.slice(-this.MAX_CACHE_SIZE);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(limitedCache));
    } catch (error) {
      console.error('❌ Cache save error:', error);
    }
  }

  private static findInCache(text: string, fromLang: 'th' | 'en', toLang: 'th' | 'en'): any | null {
    const cache = this.getCache();
    const hash = this.createHash(text, fromLang, toLang);
    
    return cache.find(item => 
      item.hash === hash &&
      item.originalText === text &&
      item.fromLang === fromLang &&
      item.toLang === toLang
    ) || null;
  }

  private static addToCache(originalText: string, translatedText: string, fromLang: 'th' | 'en', toLang: 'th' | 'en'): void {
    const cache = this.getCache();
    const hash = this.createHash(originalText, fromLang, toLang);
    
    const newItem = {
      originalText,
      translatedText,
      fromLang,
      toLang,
      timestamp: Date.now(),
      hash
    };
    
    const filteredCache = cache.filter(item => item.hash !== hash);
    filteredCache.push(newItem);
    
    this.saveCache(filteredCache);
  }

  // ตรวจจับภาษา
  static detectLanguage(text: string): 'th' | 'en' {
    const thaiRegex = /[\u0E00-\u0E7F]/;
    const hasThaiChars = thaiRegex.test(text);
    
    const englishRegex = /[a-zA-Z]/;
    const hasEnglishChars = englishRegex.test(text);
    
    if (hasThaiChars && !hasEnglishChars) return 'th';
    if (!hasThaiChars && hasEnglishChars) return 'en';
    
    const thaiMatches = text.match(/[\u0E00-\u0E7F]/g);
    const englishMatches = text.match(/[a-zA-Z]/g);
    
    const thaiCount = thaiMatches ? thaiMatches.length : 0;
    const englishCount = englishMatches ? englishMatches.length : 0;
    
    return thaiCount > englishCount ? 'th' : 'en';
  }

  // แปลข้อความ
  static async translateText(text: string, fromLang: 'th' | 'en' = 'th', toLang: 'th' | 'en' = 'en'): Promise<TranslationResult> {
    try {
      if (!text.trim()) {
        return {
          success: false,
          translatedText: '',
          originalText: text,
          fromCache: false,
          error: 'ไม่มีข้อความที่จะแปล'
        };
      }

      // ตรวจสอบ cache ก่อน
      const cached = this.findInCache(text, fromLang, toLang);
      if (cached) {
        return {
          success: true,
          translatedText: cached.translatedText,
          originalText: text,
          fromCache: true
        };
      }

      // เรียก API
      const langPair = `${fromLang}|${toLang}`;
      const encodedText = encodeURIComponent(text);
      
      const response = await fetch(`${this.MYMEMORY_API}?q=${encodedText}&langpair=${langPair}`);
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'Translation failed');
      }

      const translatedText = data.responseData.translatedText;
      
      // บันทึกลง cache
      this.addToCache(text, translatedText, fromLang, toLang);
      
      return {
        success: true,
        translatedText,
        originalText: text,
        fromCache: false
      };

    } catch (error) {
      return {
        success: false,
        translatedText: text,
        originalText: text,
        fromCache: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแปล'
      };
    }
  }

  // แปลอัตโนมัติ
  static async autoTranslate(text: string): Promise<AutoTranslationResult> {
    const detectedLang = this.detectLanguage(text);
    const targetLang = detectedLang === 'th' ? 'en' : 'th';
    
    const result = await this.translateText(text, detectedLang, targetLang);
    
    return {
      ...result,
      detectedLanguage: detectedLang,
      targetLanguage: targetLang
    };
  }

  // แปลหลายบรรทัด
  static async translateMultiline(text: string, fromLang: 'th' | 'en' = 'th', toLang: 'th' | 'en' = 'en'): Promise<MultilineTranslationResult> {
    try {
      const lines = text.split('\n');
      const translatedLines: string[] = [];
      let cacheHits = 0;
      let apiCalls = 0;
      
      for (const line of lines) {
        if (line.trim() === '') {
          translatedLines.push(line);
          continue;
        }
        
        const result = await this.translateText(line, fromLang, toLang);
        
        if (result.success) {
          translatedLines.push(result.translatedText);
          
          if (result.fromCache) {
            cacheHits++;
          } else {
            apiCalls++;
            // หน่วงเวลาเฉพาะ API calls
            if (apiCalls > 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } else {
          translatedLines.push(line);
        }
      }
      
      return {
        success: true,
        translatedText: translatedLines.join('\n'),
        originalText: text,
        cacheHits,
        apiCalls
      };
      
    } catch (error) {
      return {
        success: false,
        translatedText: text,
        originalText: text,
        cacheHits: 0,
        apiCalls: 0,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแปล'
      };
    }
  }

  // สถิติ cache
  static getCacheStats(): CacheStats {
    const cache = this.getCache();
    
    if (cache.length === 0) {
      return {
        totalItems: 0,
        oldestItem: null,
        newestItem: null,
        cacheSize: '0 KB'
      };
    }
    
    const timestamps = cache.map(item => item.timestamp);
    const oldest = new Date(Math.min(...timestamps));
    const newest = new Date(Math.max(...timestamps));
    
    const cacheString = localStorage.getItem(this.CACHE_KEY) || '';
    const sizeInBytes = new Blob([cacheString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      totalItems: cache.length,
      oldestItem: oldest,
      newestItem: newest,
      cacheSize: `${sizeInKB} KB`
    };
  }

  // ล้าง cache
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }
}

// Custom Hook
export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [lastTranslationStats, setLastTranslationStats] = useState<TranslationStats | null>(null);

  const translateText = async (
    text: string,
    fromLang?: 'th' | 'en',
    toLang?: 'th' | 'en'
  ): Promise<TranslationResult | AutoTranslationResult> => {
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = fromLang && toLang 
        ? await TranslationService.translateText(text, fromLang, toLang)
        : await TranslationService.autoTranslate(text);

      if (!result.success) {
        setTranslationError(result.error || 'การแปลล้มเหลว');
      } else {
        // อัพเดตสถิติ
        setLastTranslationStats({
          cacheHits: 'fromCache' in result ? (result.fromCache ? 1 : 0) : 0,
          apiCalls: 'fromCache' in result ? (result.fromCache ? 0 : 1) : 1,
          fromCache: 'fromCache' in result ? result.fromCache : false
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแปล';
      setTranslationError(errorMessage);
      
      return {
        success: false,
        translatedText: text,
        originalText: text,
        fromCache: false,
        error: errorMessage
      };
    } finally {
      setIsTranslating(false);
    }
  };

  const translateMultiline = async (
    text: string,
    fromLang?: 'th' | 'en',
    toLang?: 'th' | 'en'
  ): Promise<MultilineTranslationResult> => {
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await TranslationService.translateMultiline(
        text,
        fromLang || 'th',
        toLang || 'en'
      );

      if (!result.success) {
        setTranslationError(result.error || 'การแปลล้มเหลว');
      } else {
        // อัพเดตสถิติ
        setLastTranslationStats({
          cacheHits: result.cacheHits,
          apiCalls: result.apiCalls,
          fromCache: result.apiCalls === 0
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแปล';
      setTranslationError(errorMessage);
      
      return {
        success: false,
        translatedText: text,
        originalText: text,
        cacheHits: 0,
        apiCalls: 0,
        error: errorMessage
      };
    } finally {
      setIsTranslating(false);
    }
  };

  const detectLanguage = (text: string): 'th' | 'en' => {
    return TranslationService.detectLanguage(text);
  };

  const getCacheStats = (): CacheStats => {
    return TranslationService.getCacheStats();
  };

  const clearCache = (): void => {
    TranslationService.clearCache();
  };

  const clearError = (): void => {
    setTranslationError(null);
  };

  return {
    // Functions
    translateText,
    translateMultiline,
    detectLanguage,
    getCacheStats,
    clearCache,
    clearError,
    
    // States
    isTranslating,
    translationError,
    lastTranslationStats,
    
    // Cache stats (computed)
    cacheStats: getCacheStats()
  };
};