import { NextRequest, NextResponse } from 'next/server';

interface TranslationRequest {
  text: string;
  fromLanguage: 'vi' | 'en';
  toLanguage: 'vi' | 'en';
}

interface TranslationResponse {
  translatedText: string;
  confidence: number;
  fromLanguage: string;
  toLanguage: string;
  service: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, fromLanguage, toLanguage } = body;

    console.log('🔄 API Translation request:', { 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
      textLength: text.length,
      fromLanguage, 
      toLanguage 
    });

    // 1. Try Google Translate (unofficial API)
    const googleResult = await tryGoogleTranslate(text, fromLanguage, toLanguage);
    if (googleResult) {
      return NextResponse.json(googleResult);
    }

    // 2. Try LibreTranslate
    const libreResult = await tryLibreTranslate(text, fromLanguage, toLanguage);
    if (libreResult) {
      return NextResponse.json(libreResult);
    }

    // 3. Fallback to mock translation
    const fallbackResult = await fallbackTranslate(text, fromLanguage, toLanguage);
    return NextResponse.json(fallbackResult);

  } catch (error) {
    console.error('❌ Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Strip HTML tags from text for better translation
 */
function stripHtmlTags(html: string): string {
  // Remove HTML tags but preserve content
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
}

/**
 * Try Google Translate API from server-side
 */
async function tryGoogleTranslate(text: string, fromLang: string, toLang: string): Promise<TranslationResponse | null> {
  const endpoints = [
    'https://translate.googleapis.com/translate_a/single',
    'https://clients5.google.com/translate_a/t'
  ];

  // Clean HTML from content for better translation
  const cleanText = stripHtmlTags(text);
  console.log('🧹 Cleaned text for translation:', {
    original: text.substring(0, 50) + '...',
    cleaned: cleanText.substring(0, 50) + '...',
    hadHtml: text !== cleanText
  });

  for (const endpoint of endpoints) {
    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: fromLang,
        tl: toLang,
        dt: 't',
        q: cleanText // Use cleaned text instead of raw HTML
      });

      const response = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://translate.google.com/',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Google Translate server success');
        
        // Parse Google Translate response
        let translatedText = '';
        if (data && data[0]) {
          if (Array.isArray(data[0])) {
            translatedText = data[0].map((item: any) => item[0]).join('');
          } else {
            translatedText = data[0];
          }
        }
        
        if (translatedText && translatedText !== text) {
          return {
            translatedText,
            confidence: 0.9,
            fromLanguage: fromLang,
            toLanguage: toLang,
            service: 'Google Translate'
          };
        }
      }
    } catch (error) {
      console.warn(`❌ Google endpoint ${endpoint} failed:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Try LibreTranslate API from server-side
 */
async function tryLibreTranslate(text: string, fromLang: string, toLang: string): Promise<TranslationResponse | null> {
  const endpoints = [
    'https://libretranslate.com/translate',
    'https://translate.argosopentech.com/translate'
  ];

  // Clean HTML from content for better translation
  const cleanText = stripHtmlTags(text);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          q: cleanText, // Use cleaned text instead of raw HTML
          source: fromLang,
          target: toLang,
          format: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ LibreTranslate server success');
        
        if (data.translatedText && data.translatedText !== text) {
          return {
            translatedText: data.translatedText,
            confidence: 0.8,
            fromLanguage: fromLang,
            toLanguage: toLang,
            service: 'LibreTranslate'
          };
        }
      }
    } catch (error) {
      console.warn(`❌ LibreTranslate endpoint ${endpoint} failed:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Fallback translation when external APIs fail
 */
async function fallbackTranslate(text: string, fromLang: string, toLang: string): Promise<TranslationResponse> {
  console.log('🔄 Using fallback translation on server...');
  
  // Clean HTML from content for better translation
  const cleanText = stripHtmlTags(text);
  let translatedText = cleanText;
  
  if (fromLang === 'vi' && toLang === 'en') {
    const viToEnMap: Record<string, string> = {
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
      'Phát triển': 'Development',
      'phát triển': 'development',
      'Ứng dụng': 'Application',
      'ứng dụng': 'application',
      'Công nghệ': 'Technology',
      'công nghệ': 'technology',
      'website': 'website',
      'web': 'web',
      'React': 'React',
      'và': 'and',
      'với': 'with',
      'trong': 'in',
      'cho': 'for'
    };
    
    for (const [vi, en] of Object.entries(viToEnMap)) {
      translatedText = translatedText.replace(new RegExp(vi, 'gi'), en);
    }
    
    if (translatedText === cleanText) {
      translatedText = `[Server Fallback EN] ${cleanText}`;
    }
  } else if (fromLang === 'en' && toLang === 'vi') {
    const enToViMap: Record<string, string> = {
      'Title': 'Tiêu đề',
      'Content': 'Nội dung',
      'Guide': 'Hướng dẫn',
      'Technology': 'Công nghệ',
      'Development': 'Phát triển',
      'and': 'và',
      'with': 'với',
      'in': 'trong',
      'for': 'cho'
    };
    
    for (const [en, vi] of Object.entries(enToViMap)) {
      translatedText = translatedText.replace(new RegExp(en, 'gi'), vi);
    }
    
    if (translatedText === cleanText) {
      translatedText = `[Server Fallback VI] ${cleanText}`;
    }
  }
  
  return {
    translatedText,
    confidence: 0.5,
    fromLanguage: fromLang,
    toLanguage: toLang,
    service: 'Server Fallback'
  };
}
