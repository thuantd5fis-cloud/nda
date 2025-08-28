/**
 * AI Translation Service
 * Provides automatic translation between Vietnamese and English
 */

export interface TranslationRequest {
  text: string;
  fromLanguage: 'vi' | 'en';
  toLanguage: 'vi' | 'en';
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  fromLanguage: string;
  toLanguage: string;
  service?: string;
}

/**
 * Simple translation service using Google Translate API
 * In production, consider using more sophisticated services like:
 * - OpenAI GPT API
 * - Google Cloud Translation API
 * - Azure Translator
 * - DeepL API
 */
export class TranslationService {
  private static readonly GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';
  
  /**
   * Translate text using Next.js API route (bypasses CORS)
   */
  static async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      console.log('🔄 Translation request via API route:', request);
      
      // Use Next.js API route to bypass CORS issues
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Translation API success:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('❌ Translation API error:', error);
        throw new Error(error.details || 'Translation API failed');
      }
      
    } catch (error) {
      console.error('❌ Translation client error:', error);
      
      // Fallback to client-side mock translation
      console.warn('🔄 API route failed, using client fallback...');
      return this.fallbackTranslate(request);
    }
  }

  // Server-side translation methods moved to /api/translate route

  /**
   * Fallback translation method when external APIs fail
   */
  private static fallbackTranslate(request: TranslationRequest): TranslationResponse {
    console.log('🔄 Using fallback translation...');
    let translatedText = request.text;
      
    if (request.fromLanguage === 'vi' && request.toLanguage === 'en') {
      // Vietnamese to English - Extended pattern replacement for demo
      const viToEnMap: Record<string, string> = {
        // Basic words
        'Tiêu đề': 'Title',
        'tiêu đề': 'title',
        'Nội dung': 'Content',
        'nội dung': 'content',
        'Tóm tắt': 'Summary',
        'tóm tắt': 'summary',
        'Bài viết': 'Article',
        'bài viết': 'article',
        'Hướng dẫn': 'Guide',
        'hướng dẫn': 'guide',
        'Giới thiệu': 'Introduction',
        'giới thiệu': 'introduction',
        'Thông tin': 'Information',
        'thông tin': 'information',
        'Dự án': 'Project',
        'dự án': 'project',
        'Công nghệ': 'Technology',
        'công nghệ': 'technology',
        'Phát triển': 'Development',
        'phát triển': 'development',
        'Ứng dụng': 'Application',
        'ứng dụng': 'application',
        // Extended vocabulary
        'tạo': 'create',
        'xây dựng': 'build',
        'thiết kế': 'design',
        'website': 'website',
        'web': 'web',
        'React': 'React',
        'JavaScript': 'JavaScript',
        'TypeScript': 'TypeScript',
        'frontend': 'frontend',
        'backend': 'backend',
        'database': 'database',
        'API': 'API',
        'server': 'server',
        'client': 'client',
        'component': 'component',
        'framework': 'framework',
        'library': 'library'
      };
      
      // Replace known patterns (case insensitive)
      for (const [vi, en] of Object.entries(viToEnMap)) {
        translatedText = translatedText.replace(new RegExp(vi, 'gi'), en);
      }
      
      // Add more Vietnamese specific replacements
      translatedText = translatedText
        .replace(/\bvà\b/g, 'and')
        .replace(/\bhoặc\b/g, 'or')
        .replace(/\bvới\b/g, 'with')
        .replace(/\bcho\b/g, 'for')
        .replace(/\btrong\b/g, 'in')
        .replace(/\bở\b/g, 'at')
        .replace(/\bmột\b/g, 'a')
        .replace(/\bcác\b/g, 'the');
      
      // If no significant changes, add English prefix for demo
      if (translatedText === request.text || translatedText.length < 3) {
        translatedText = `[Fallback EN] ${request.text}`;
      }
    } else if (request.fromLanguage === 'en' && request.toLanguage === 'vi') {
      // English to Vietnamese - Basic reverse mapping
      const enToViMap: Record<string, string> = {
        'Title': 'Tiêu đề',
        'title': 'tiêu đề',
        'Content': 'Nội dung',
        'content': 'nội dung',
        'Summary': 'Tóm tắt',
        'summary': 'tóm tắt',
        'Guide': 'Hướng dẫn',
        'guide': 'hướng dẫn',
        'Technology': 'Công nghệ',
        'technology': 'công nghệ',
        'Development': 'Phát triển',
        'development': 'phát triển',
        'Application': 'Ứng dụng',
        'application': 'ứng dụng'
      };
      
      // Replace known patterns
      for (const [en, vi] of Object.entries(enToViMap)) {
        translatedText = translatedText.replace(new RegExp(en, 'gi'), vi);
      }
      
      // Add common English words replacement
      translatedText = translatedText
        .replace(/\band\b/g, 'và')
        .replace(/\bor\b/g, 'hoặc')
        .replace(/\bwith\b/g, 'với')
        .replace(/\bfor\b/g, 'cho')
        .replace(/\bin\b/g, 'trong');
      
      if (translatedText === request.text) {
        translatedText = `[Fallback VI] ${request.text}`;
      }
    }
    
    return {
      translatedText,
      confidence: 0.6, // Lower confidence for fallback
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      service: 'Client Fallback'
    };
  }

  /**
   * Translate post content (title, excerpt, content)
   */
  static async translatePostContent(
    content: {
      title: string;
      excerpt?: string;
      content: string;
      metaTitle?: string;
      metaDescription?: string;
    },
    fromLanguage: 'vi' | 'en' = 'vi',
    toLanguage: 'vi' | 'en' = 'en'
  ) {
    try {
      const [
        titleResult,
        excerptResult,
        contentResult,
        metaTitleResult,
        metaDescriptionResult
      ] = await Promise.all([
        this.translateText({ text: content.title, fromLanguage, toLanguage }),
        content.excerpt && content.excerpt.trim()
          ? this.translateText({ text: content.excerpt, fromLanguage, toLanguage })
          : Promise.resolve({ translatedText: '', confidence: 1, fromLanguage, toLanguage }),
        this.translateText({ text: content.content, fromLanguage, toLanguage }),
        content.metaTitle
          ? this.translateText({ text: content.metaTitle, fromLanguage, toLanguage })
          : Promise.resolve({ translatedText: '', confidence: 1, fromLanguage, toLanguage }),
        content.metaDescription
          ? this.translateText({ text: content.metaDescription, fromLanguage, toLanguage })
          : Promise.resolve({ translatedText: '', confidence: 1, fromLanguage, toLanguage })
      ]);

      return {
        title: titleResult.translatedText,
        excerpt: excerptResult.translatedText || undefined,
        content: contentResult.translatedText,
        metaTitle: metaTitleResult.translatedText || undefined,
        metaDescription: metaDescriptionResult.translatedText || undefined,
        slug: this.generateSlug(titleResult.translatedText, toLanguage),
        confidence: Math.min(
          titleResult.confidence,
          excerptResult.confidence,
          contentResult.confidence,
          metaTitleResult.confidence,
          metaDescriptionResult.confidence
        )
      };
    } catch (error) {
      console.error('Post translation error:', error);
      throw new Error('Failed to translate post content');
    }
  }

  /**
   * Generate SEO-friendly slug for translated content
   */
  private static generateSlug(title: string, language: 'vi' | 'en'): string {
    let slug = title
      .toLowerCase()
      .trim();

    if (language === 'vi') {
      // Handle Vietnamese diacritics
      slug = slug
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
    }

    return slug
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Detect language of given text
   */
  static async detectLanguage(text: string): Promise<'vi' | 'en'> {
    // Simple language detection based on common patterns
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    if (vietnamesePattern.test(text)) {
      return 'vi';
    }
    
    // Default to English if no Vietnamese characters detected
    return 'en';
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return [
      { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }
}

/**
 * React hook for translation functionality
 */
export const useTranslation = () => {
  const translateContent = async (
    content: Parameters<typeof TranslationService.translatePostContent>[0],
    fromLang: 'vi' | 'en' = 'vi',
    toLang: 'vi' | 'en' = 'en'
  ) => {
    return await TranslationService.translatePostContent(content, fromLang, toLang);
  };

  const detectLanguage = async (text: string) => {
    return await TranslationService.detectLanguage(text);
  };

  return {
    translateContent,
    detectLanguage,
    supportedLanguages: TranslationService.getSupportedLanguages()
  };
};
