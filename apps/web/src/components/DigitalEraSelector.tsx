'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@cms/ui';

interface DigitalEraQuote {
  id: string;
  text: string;
  author: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DigitalEraSelectorProps {
  title?: string;
  value: DigitalEraQuote[];
  onChange: (quotes: DigitalEraQuote[]) => void;
}

export default function DigitalEraSelector({
  title = 'Quản lý Trích dẫn Kỷ nguyên số',
  value,
  onChange
}: DigitalEraSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState<DigitalEraQuote | null>(null);
  const [formData, setFormData] = useState({ text: '', author: '' });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAdd = () => {
    const newQuote: DigitalEraQuote = {
      id: `temp-${Date.now()}`, // Temporary ID
      text: '',
      author: '',
      order: value.length + 1,
      isActive: true,
    };
    onChange([...value, newQuote]);
  };

  const handleEdit = (quote: DigitalEraQuote) => {
    setEditingQuote(quote);
    setFormData({ text: quote.text, author: quote.author });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.text.trim() || !formData.author.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung và tác giả');
      return;
    }

    if (editingQuote) {
      const updatedQuotes = value.map(quote =>
        quote.id === editingQuote.id
          ? { ...quote, text: formData.text, author: formData.author }
          : quote
      );
      onChange(updatedQuotes);
    }

    setShowDialog(false);
    setEditingQuote(null);
    setFormData({ text: '', author: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa trích dẫn này?')) return;
    const updatedQuotes = value.filter(quote => quote.id !== id);
    onChange(updatedQuotes);
  };

  const handleToggleActive = (quote: DigitalEraQuote) => {
    const updatedQuotes = value.map(q =>
      q.id === quote.id ? { ...q, isActive: !q.isActive } : q
    );
    onChange(updatedQuotes);
  };

  const openCreateDialog = () => {
    setEditingQuote(null);
    setFormData({ text: '', author: '' });
    setShowDialog(true);
  };

  const handleCreate = () => {
    if (!formData.text.trim() || !formData.author.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung và tác giả');
      return;
    }

    const newQuote: DigitalEraQuote = {
      id: `temp-${Date.now()}`, // Temporary ID
      text: formData.text,
      author: formData.author,
      order: value.length + 1,
      isActive: true,
    };

    onChange([...value, newQuote]);
    setShowDialog(false);
    setFormData({ text: '', author: '' });
  };

  if (!isMounted) return null;

  const dialogContent = showDialog ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingQuote ? 'Chỉnh sửa trích dẫn' : 'Thêm trích dẫn mới'}
          </h2>
          <button
            onClick={() => setShowDialog(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung trích dẫn <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Nhập nội dung trích dẫn về kỷ nguyên số..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tác giả <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Tên tác giả hoặc nguồn trích dẫn"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            </div>

            {/* Preview */}
            {formData.text && formData.author && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                <h6 className="text-xs font-medium text-gray-500 mb-2">Preview:</h6>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg">
                  <blockquote className="text-sm text-gray-800 italic mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    "{formData.text}"
                  </blockquote>
                  <cite className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    — {formData.author}
                  </cite>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={editingQuote ? handleSave : handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingQuote ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {title}
        </h4>
        <Button
          onClick={openCreateDialog}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
        >
          ➕ Thêm trích dẫn
        </Button>
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {value.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💭</div>
            <p style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Chưa có trích dẫn nào. Hãy thêm trích dẫn đầu tiên!
            </p>
          </div>
        ) : (
          value.map((quote) => (
            <div key={quote.id} className="border border-gray-200 rounded-lg p-4 relative">
              <div className="pr-32">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg mb-3">
                  <blockquote className="text-sm text-gray-800 italic mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    "{quote.text}"
                  </blockquote>
                  <cite className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    — {quote.author}
                  </cite>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  <span>Thứ tự: {quote.order}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full ${quote.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {quote.isActive ? 'Kích hoạt' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={() => handleToggleActive(quote)}
                  className={`px-2 py-1 text-sm ${quote.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  title={quote.isActive ? 'Ẩn trích dẫn' : 'Hiện trích dẫn'}
                >
                  {quote.isActive ? '👁️' : '👁️‍🗨️'}
                </Button>
                <Button
                  onClick={() => handleEdit(quote)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
                  title="Chỉnh sửa"
                >
                  ✏️
                </Button>
                <Button
                  onClick={() => handleDelete(quote.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm"
                  title="Xóa"
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))
        )}
      </div>



      {/* Dialog */}
      {showDialog && createPortal(dialogContent, document.body)}
    </div>
  );
}