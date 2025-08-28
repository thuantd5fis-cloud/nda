import {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  AuthUser,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
  UsersStats,
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostsQueryParams,
  PostAnalytics,
  PostsStats,
  Category,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
  TagsQueryParams,
  TagsStats,
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  AssetsQueryParams,
  AssetsStats,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventRegistrationRequest,
  EventsQueryParams,
  EventsStats,
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  CreateMentoringRequest,
  MembersQueryParams,
  MembersStats,
  FAQ,
  CreateFAQRequest,
  UpdateFAQRequest,
  CreateFAQFeedbackRequest,
  FAQsQueryParams,
  FAQSearchParams,
  FAQsStats,
} from '../types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onUnauthorized?: () => void;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    );
    return new URLSearchParams(cleanParams).toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('Unauthorized access - clearing token and redirecting to login');
          this.setToken(null);
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ==========================================
  // AUTH ENDPOINTS
  // ==========================================
  async login(email: string, password: string) {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request<AuthUser>('/auth/me');
  }

  async logout() {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  // ==========================================
  // USERS ENDPOINTS
  // ==========================================
  async getUsers(params?: UsersQueryParams) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<User>>(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserRequest) {
    return this.request<{ user: User; temporaryPassword: string; message: string }>('/users/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: string) {
    return this.request<{ message: string; tempPassword: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  async getUsersStats() {
    return this.request<UsersStats>('/users/stats');
  }

  // ==========================================
  // POSTS ENDPOINTS
  // ==========================================
  async getPosts(params?: PaginationParams & {
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    status?: string;
    featured?: boolean;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPost(id: string) {
    return this.request<any>(`/posts/${id}`);
  }

  async createPost(data: any) {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: any) {
    return this.request<any>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow methods
  async submitPostForReview(id: string) {
    return this.request<{ message: string; post: any }>(`/posts/${id}/submit-review`, {
      method: 'POST',
    });
  }

  async approvePost(id: string) {
    return this.request<{ message: string; post: any }>(`/posts/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectPost(id: string, reason?: string) {
    return this.request<{ message: string; post: any; reason?: string }>(`/posts/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async archivePost(id: string) {
    return this.request<{ message: string; post: any }>(`/posts/${id}/archive`, {
      method: 'POST',
    });
  }

  async publishPost(id: string) {
    return this.request<{ message: string; post: any }>(`/posts/${id}/publish`, {
      method: 'POST',
    });
  }

  async getPostAnalytics(id: string) {
    return this.request<{
      viewCount: number;
      likeCount: number;
      shareCount: number;
      commentCount: number;
    }>(`/posts/${id}/analytics`);
  }

  async getPostsStats() {
    return this.request<{
      totalPosts: number;
      publishedPosts: number;
      draftPosts: number;
      featuredPosts: number;
    }>('/posts/stats');
  }

  // ==========================================
  // CATEGORIES ENDPOINTS
  // ==========================================
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async getCategory(id: string) {
    return this.request<any>(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<any>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // TAGS ENDPOINTS
  // ==========================================
  async getTags(params?: PaginationParams & {
    isActive?: boolean;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/tags${queryString ? `?${queryString}` : ''}`);
  }

  async getTag(id: string) {
    return this.request<any>(`/tags/${id}`);
  }

  async createTag(data: any) {
    return this.request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: any) {
    return this.request<any>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string) {
    return this.request<{ message: string }>(`/tags/${id}`, {
      method: 'DELETE',
    });
  }

  async getTagsStats() {
    return this.request<{
      totalTags: number;
      activeTags: number;
      usedTags: number;
    }>('/tags/stats');
  }

  // ==========================================
  // ASSETS ENDPOINTS
  // ==========================================
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/assets/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized for upload
      if (response.status === 401) {
        console.warn('Unauthorized access during upload - clearing token and redirecting to login');
        this.setToken(null);
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new Error('Session expired. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed! status: ${response.status}`);
    }

    return await response.json();
  }

  async getAssets(params?: PaginationParams & {
    type?: string;
    tags?: string;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/assets${queryString ? `?${queryString}` : ''}`);
  }

  async getAsset(id: string) {
    return this.request<any>(`/assets/${id}`);
  }

  async createAsset(data: any) {
    return this.request<any>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: any) {
    return this.request<any>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.request<{ message: string }>(`/assets/${id}`, {
      method: 'DELETE',
    });
  }

  async trackAssetUsage(id: string, entityType: string, entityId: string) {
    return this.request<{ message: string }>(`/assets/${id}/track-usage`, {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId }),
    });
  }

  async removeAssetUsage(id: string, entityType: string, entityId: string) {
    return this.request<{ message: string }>(`/assets/${id}/usage`, {
      method: 'DELETE',
      body: JSON.stringify({ entityType, entityId }),
    });
  }

  async downloadAsset(id: string) {
    return this.request<{ message: string }>(`/assets/${id}/download`, {
      method: 'POST',
    });
  }

  async getAssetsStats() {
    return this.request<{
      totalAssets: number;
      totalSize: number;
      assetsByType: Record<string, number>;
      mostUsedAssets: any[];
    }>('/assets/stats');
  }

  // Upload file to files-upload storage (same as FileSelector)
  async uploadFileToStorage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/files-upload/upload`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('Unauthorized access - clearing token and redirecting to login');
          this.setToken(null);
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Get files from files-upload storage
  async getFilesFromStorage(params?: { fileType?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.fileType) queryParams.append('type', params.fileType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.baseURL}/files-upload${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('Unauthorized access - clearing token and redirecting to login');
          this.setToken(null);
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get files failed:', error);
      throw error;
    }
  }

  // ==========================================
  // EVENTS ENDPOINTS
  // ==========================================
  async getEvents(params?: PaginationParams & {
    status?: string;
    tags?: string;
    location?: string;
    upcoming?: boolean;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getEvent(id: string) {
    return this.request<any>(`/events/${id}`);
  }

  async createEvent(data: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: any) {
    return this.request<any>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async registerForEvent(id: string, data: any) {
    return this.request<any>(`/events/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unregisterFromEvent(id: string) {
    return this.request<{ message: string }>(`/events/${id}/register`, {
      method: 'DELETE',
    });
  }

  async getEventRegistrations(id: string) {
    return this.request<any[]>(`/events/${id}/registrations`);
  }

  async updateEventRegistrationPayment(registrationId: string, paymentData: any) {
    return this.request<any>(`/events/registrations/${registrationId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  }

  async getEventsStats() {
    return this.request<{
      totalEvents: number;
      upcomingEvents: number;
      completedEvents: number;
      totalRegistrations: number;
    }>('/events/stats');
  }

  // ==========================================
  // MEMBERS ENDPOINTS
  // ==========================================
  async getMembers(params?: PaginationParams & {
    expertise?: string;
    isExpert?: boolean;
    isActive?: boolean;
    location?: string;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/members${queryString ? `?${queryString}` : ''}`);
  }

  async getMember(id: string) {
    return this.request<any>(`/members/${id}`);
  }

  async createMember(data: any) {
    return this.request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: any) {
    return this.request<any>(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string) {
    return this.request<{ message: string }>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  async createMentoringSession(id: string, data: any) {
    return this.request<any>(`/members/${id}/mentoring`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMemberMentoringHistory(id: string) {
    return this.request<any[]>(`/members/${id}/mentoring`);
  }

  async updateMentoringSessionStatus(sessionId: string, status: string) {
    return this.request<any>(`/members/mentoring/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async syncMemberWithCRM(id: string) {
    return this.request<{ message: string }>(`/members/${id}/sync-crm`, {
      method: 'POST',
    });
  }

  async getMembersStats() {
    return this.request<{
      totalMembers: number;
      activeMembers: number;
      experts: number;
      mentoringHours: number;
    }>('/members/stats');
  }

  // ==========================================
  // FAQS ENDPOINTS
  // ==========================================
  async getFAQs(params?: PaginationParams & {
    category?: string;
    priority?: string;
    tags?: string;
    isPublished?: boolean;
  }) {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.request<PaginatedResponse<any>>(`/faqs${queryString ? `?${queryString}` : ''}`);
  }

  async searchFAQs(params: {
    q: string;
    category?: string;
    limit?: number;
  }) {
    const queryString = this.buildQueryString(params);
    return this.request<any[]>(`/faqs/search?${queryString}`);
  }

  async getFAQ(id: string) {
    return this.request<any>(`/faqs/${id}`);
  }

  async createFAQ(data: any) {
    return this.request<any>('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFAQ(id: string, data: any) {
    return this.request<any>(`/faqs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFAQ(id: string) {
    return this.request<{ message: string }>(`/faqs/${id}`, {
      method: 'DELETE',
    });
  }

  async createFAQFeedback(id: string, data: any) {
    return this.request<any>(`/faqs/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reorderFAQs(faqIds: string[]) {
    return this.request<{ message: string }>('/faqs/reorder', {
      method: 'POST',
      body: JSON.stringify({ faqIds }),
    });
  }

  async getFAQsStats() {
    return this.request<{
      totalFAQs: number;
      publishedFAQs: number;
      categoriesCount: number;
      totalViews: number;
    }>('/faqs/stats');
  }

  // ==========================================
  // SETTINGS ENDPOINTS
  // ==========================================
  async getAllSettings() {
    return await this.request('/settings');
  }

  async getSettingsByCategory(category: string) {
    return await this.request(`/settings/${category}`);
  }

  async updateSettings(category: string, settings: Record<string, any>) {
    return await this.request('/settings/bulk', {
      method: 'POST',
      body: JSON.stringify({ category, settings }),
    });
  }

  async updateSingleSetting(category: string, key: string, value: any) {
    return await this.request('/settings/single', {
      method: 'POST',
      body: JSON.stringify({ category, key, value }),
    });
  }

  async deleteSetting(category: string, key: string) {
    return await this.request(`/settings/${category}/${key}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;