'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@cms/ui';
import { SimpleEditor } from './simple-editor';
import { TranslateIcon, LanguageIcon, LoadingIcon, CheckIcon } from '@/components/icons';
import { useTranslation } from '@/lib/translation';
import { useConfirm } from '@/hooks/use-confirm';
import { TranslationTest } from './translation-test';

export interface MultilingualContent {
  vi: {
    title: string;
    excerpt: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
  en: {
    title: string;
    excerpt: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
}

interface MultilingualEditorProps {
  content: MultilingualContent;
  onChange: (content: MultilingualContent) => void;
  className?: string;
}

export const MultilingualEditor: React.FC<MultilingualEditorProps> = ({
  content,
  onChange,
  className = ''
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'vi' | 'en'>('vi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState<string | null>(null);
  const { translateContent, supportedLanguages } = useTranslation();
  const { toast } = useConfirm();

  const updateContent = (
    language: 'vi' | 'en',
    field: keyof MultilingualContent['vi'],
    value: string
  ) => {
    onChange({
      ...content,
      [language]: {
        ...content[language],
        [field]: value
      }
    });
  };

  const generateSlug = (title: string, language: 'vi' | 'en'): string => {
    let slug = title.toLowerCase().trim();

    if (language === 'vi') {
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
  };

  const handleAutoTranslate = async (fromLang: 'vi' | 'en', toLang: 'vi' | 'en') => {
    setIsTranslating(true);
    setTranslationSuccess(null);

    try {
      const sourceContent = content[fromLang];
      
      if (!sourceContent.title.trim()) {
        throw new Error('Vui lòng nhập tiêu đề trước khi dịch');
      }

      const translated = await translateContent(
        {
          title: sourceContent.title,
          excerpt: sourceContent.excerpt,
          content: sourceContent.content,
          metaTitle: sourceContent.metaTitle,
          metaDescription: sourceContent.metaDescription
        },
        fromLang,
        toLang
      );

      onChange({
        ...content,
        [toLang]: {
          title: translated.title,
          excerpt: translated.excerpt || '',
          content: translated.content,
          metaTitle: translated.metaTitle,
          metaDescription: translated.metaDescription,
          slug: translated.slug
        }
      });

      setTranslationSuccess(`Đã dịch thành công sang ${toLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'}!`);
      
      // Auto switch to translated language
      setActiveLanguage(toLang);
      
      // Clear success message after 3 seconds
      setTimeout(() => setTranslationSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Có lỗi xảy ra khi dịch: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (content[activeLanguage].title) {
      const newSlug = generateSlug(content[activeLanguage].title, activeLanguage);
      if (newSlug !== content[activeLanguage].slug) {
        updateContent(activeLanguage, 'slug', newSlug);
      }
    }
  }, [content[activeLanguage].title, activeLanguage]);

  const currentContent = content[activeLanguage];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Translation Test Component - for debugging */}
      {/* <TranslationTest /> */}
      
      {/* Language Switcher & Translation Controls */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <LanguageIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Ngôn ngữ:</span>
          </div>
          
          {/* Language Tabs */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code as 'vi' | 'en')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeLanguage === lang.code
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Buttons */}
        <div className="flex items-center space-x-3">
          {translationSuccess && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckIcon className="w-4 h-4 mr-1" />
              {translationSuccess}
            </div>
          )}
          
          {activeLanguage === 'vi' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoTranslate('vi', 'en')}
              disabled={isTranslating || !currentContent.title.trim()}
              className="flex items-center"
            >
              {isTranslating ? (
                <LoadingIcon className="w-4 h-4 mr-2" />
              ) : (
                <TranslateIcon className="w-4 h-4 mr-2" />
              )}
              Dịch sang tiếng Anh
            </Button>
          )}
          
          {activeLanguage === 'en' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoTranslate('en', 'vi')}
              disabled={isTranslating || !currentContent.title.trim()}
              className="flex items-center"
            >
              {isTranslating ? (
                <LoadingIcon className="w-4 h-4 mr-2" />
              ) : (
                <TranslateIcon className="w-4 h-4 mr-2" />
              )}
              Dịch sang tiếng Việt
            </Button>
          )}
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề ({activeLanguage === 'vi' ? 'Tiếng Việt' : 'English'}) *
          </label>
          <Input
            value={currentContent.title}
            onChange={(e) => updateContent(activeLanguage, 'title', e.target.value)}
            placeholder={
              activeLanguage === 'vi' 
                ? 'Nhập tiêu đề bài viết bằng tiếng Việt...'
                : 'Enter post title in English...'
            }
            className="text-lg"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đường dẫn (Slug) - {activeLanguage.toUpperCase()}
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              /{activeLanguage}/posts/
            </span>
            <Input
              value={currentContent.slug || ''}
              onChange={(e) => updateContent(activeLanguage, 'slug', e.target.value)}
              placeholder={
                activeLanguage === 'vi' 
                  ? 'duong-dan-bai-viet'
                  : 'post-url-slug'
              }
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tóm tắt ({activeLanguage === 'vi' ? 'Tiếng Việt' : 'English'})
          </label>
          <textarea
            value={currentContent.excerpt}
            onChange={(e) => updateContent(activeLanguage, 'excerpt', e.target.value)}
            placeholder={
              activeLanguage === 'vi'
                ? 'Viết tóm tắt ngắn gọn về bài viết bằng tiếng Việt...'
                : 'Write a brief summary of the post in English...'
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung ({activeLanguage === 'vi' ? 'Tiếng Việt' : 'English'}) *
          </label>
          <SimpleEditor
            content={currentContent.content}
            onChange={(content) => updateContent(activeLanguage, 'content', content)}
            placeholder={
              activeLanguage === 'vi'
                ? 'Bắt đầu viết nội dung bằng tiếng Việt...'
                : 'Start writing content in English...'
            }
          />
        </div>

        {/* SEO Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title - {activeLanguage.toUpperCase()}
            </label>
            <Input
              value={currentContent.metaTitle || ''}
              onChange={(e) => updateContent(activeLanguage, 'metaTitle', e.target.value)}
              placeholder={currentContent.title || (activeLanguage === 'vi' ? 'Tiêu đề SEO' : 'SEO Title')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(currentContent.metaTitle || currentContent.title || '').length}/60 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description - {activeLanguage.toUpperCase()}
            </label>
            <textarea
              value={currentContent.metaDescription || ''}
              onChange={(e) => updateContent(activeLanguage, 'metaDescription', e.target.value)}
              placeholder={currentContent.excerpt || (activeLanguage === 'vi' ? 'Mô tả SEO' : 'SEO Description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(currentContent.metaDescription || currentContent.excerpt || '').length}/160 ký tự
            </p>
          </div>
        </div>

        {/* Preview for other language */}
        {activeLanguage === 'vi' && content.en.title && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              🇺🇸 English Preview
            </h4>
            <div className="text-sm text-gray-600">
              <p><strong>Title:</strong> {content.en.title}</p>
              {content.en.excerpt && <p><strong>Excerpt:</strong> {content.en.excerpt}</p>}
            </div>
          </div>
        )}

        {activeLanguage === 'en' && content.vi.title && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              🇻🇳 Vietnamese Preview
            </h4>
            <div className="text-sm text-gray-600">
              <p><strong>Tiêu đề:</strong> {content.vi.title}</p>
              {content.vi.excerpt && <p><strong>Tóm tắt:</strong> {content.vi.excerpt}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
