'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@cms/ui';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
  };
}

interface PostSelectorProps {
  selectedPostIds: string[];
  onPostsSelect: (postIds: string[]) => void;
  title?: string;
  maxSelection?: number;
}

export default function PostSelector({
  selectedPostIds,
  onPostsSelect,
  title = 'Chọn Tin Tức',
  maxSelection = 10
}: PostSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch posts from API
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Posts API Response:', data);
        
        // Handle different response formats
        if (data && Array.isArray(data.data)) {
          // Handle paginated response format: { data: [...] }
          setPosts(data.data);
        } else if (Array.isArray(data)) {
          // Handle direct array response
          setPosts(data);
        } else {
          console.warn('Posts API returned unexpected format:', data);
          setPosts([]);
        }
      } else {
        console.error('Posts API Error:', response.status, response.statusText);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts based on search
  useEffect(() => {
    // Ensure posts is always an array
    const postsArray = Array.isArray(posts) ? posts : [];
    let filtered = postsArray;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        (post && post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post && post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

  // Fetch selected posts details
  useEffect(() => {
    const fetchSelectedPosts = async () => {
      if (selectedPostIds.length === 0) {
        setSelectedPosts([]);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const promises = selectedPostIds.map(id =>
          fetch(`http://localhost:3001/posts/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : null)
        );
        
        const results = await Promise.all(promises);
        const validPosts = results.filter(post => post !== null);
        setSelectedPosts(validPosts);
      } catch (error) {
        console.error('Error fetching selected posts:', error);
      }
    };

    fetchSelectedPosts();
  }, [selectedPostIds]);

  // Fetch posts when dialog opens
  useEffect(() => {
    if (showDialog) {
      fetchPosts();
    }
  }, [showDialog]);

  const handleTogglePost = (post: Post) => {
    const isSelected = selectedPostIds.includes(post.id);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedPostIds.filter(id => id !== post.id);
    } else {
      if (selectedPostIds.length >= maxSelection) {
        alert(`Chỉ có thể chọn tối đa ${maxSelection} tin tức`);
        return;
      }
      newSelectedIds = [...selectedPostIds, post.id];
    }

    onPostsSelect(newSelectedIds);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'Đã xuất bản';
      case 'DRAFT': return 'Bản nháp';
      case 'ARCHIVED': return 'Đã lưu trữ';
      default: return status;
    }
  };

  if (!isMounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => setShowDialog(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {selectedPostIds.length} / {maxSelection} đã chọn
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">⏳ Đang tải danh sách tin tức...</div>
            </div>
          ) : !Array.isArray(filteredPosts) || filteredPosts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📰</div>
                <div>
                  {searchTerm 
                    ? 'Không tìm thấy tin tức phù hợp' 
                    : 'Chưa có tin tức nào. Hãy tạo tin tức đầu tiên!'
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredPosts) && filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                    selectedPostIds.includes(post.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTogglePost(post)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Slug: {post.slug}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {getStatusText(post.status)}
                          </span>
                          {selectedPostIds.includes(post.id) && (
                            <div className="text-blue-600 text-lg">✓</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        {post.author && (
                          <div className="flex items-center gap-1">
                            <span>✍️</span>
                            <span>{post.author.fullName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xong
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Selected Posts Display */}
      {selectedPosts.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tin tức đã chọn:</label>
          <div className="space-y-2">
            {selectedPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500">
                    📅 {formatDate(post.createdAt)} • Slug: {post.slug}
                  </div>
                  {post.excerpt && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    const newIds = selectedPostIds.filter(id => id !== post.id);
                    onPostsSelect(newIds);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                >
                  ❌ Bỏ chọn
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select Button */}
      <Button
        onClick={() => setShowDialog(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        📰 Chọn tin tức ({selectedPostIds.length}/{maxSelection})
      </Button>

      {/* Dialog */}
      {showDialog && createPortal(dialogContent, document.body)}
    </div>
  );
}
