'use client';

import React, { useState } from 'react';
import { Button } from '@cms/ui';
import { TranslateIcon, LoadingIcon } from '@/components/icons';
import { TranslationService } from '@/lib/translation';

export const TranslationTest: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<string>('');

  const testTranslation = async () => {
    setIsTranslating(true);
    setResult('');
    
    try {
      // Test complete post content
        const testContent = {
    title: 'Hướng dẫn phát triển ứng dụng web với React và TypeScript',
    excerpt: 'Tóm tắt bài viết về công nghệ phát triển web hiện đại và các framework tốt nhất',
    content: '<p>Nội dung chi tiết về cách <strong>xây dựng ứng dụng web</strong> với React, TypeScript, và các công nghệ hiện đại khác.</p><p>Bài viết sẽ hướng dẫn từng bước để tạo ra một <em>ứng dụng web hoàn chỉnh</em>.</p><ul><li>Cài đặt môi trường phát triển</li><li>Tạo component React</li><li>Quản lý state và props</li></ul>'
  };
      
      console.log('🧪 Testing post content translation:', testContent);
      
      const translated = await TranslationService.translatePostContent(
        testContent,
        'vi',
        'en'
      );
      
      setResult(`=== ORIGINAL (Vietnamese) ===
Title: ${testContent.title}
Excerpt: ${testContent.excerpt}
Content: ${testContent.content}

=== TRANSLATED (English) ===
Title: ${translated.title}
Excerpt: ${translated.excerpt}
Content: ${translated.content}
Slug: ${translated.slug}
Confidence: ${translated.confidence}

=== TRANSLATION INFO ===
• Service: ${(translated as any).service || 'Unknown'}
• Confidence: ${translated.confidence > 0.8 ? 'High (Real API)' : 'Medium (Fallback)'}
• API Used: ${translated.confidence > 0.8 ? 'Google/LibreTranslate' : 'Fallback Mock'}
• Via: Next.js API Route (CORS bypass)
• Check console for detailed logs`);
      
    } catch (error) {
      console.error('Test translation error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
      <h3 className="font-medium text-gray-900 mb-3">🧪 Translation Test</h3>
      
      <Button
        onClick={testTranslation}
        disabled={isTranslating}
        className="mb-3"
        variant="outline"
      >
        {isTranslating ? (
          <>
            <LoadingIcon className="w-4 h-4 mr-2" />
            Testing...
          </>
        ) : (
          <>
            <TranslateIcon className="w-4 h-4 mr-2" />
            Test Full Post Translation (VI → EN)
          </>
        )}
      </Button>
      
      {result && (
        <div className="bg-white p-3 rounded border text-sm">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};
