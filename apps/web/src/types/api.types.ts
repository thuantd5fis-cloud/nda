// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Common Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  userRoles?: UserRole[];
}

// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified?: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  passwordChangedAt?: string;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRole[];
  _count?: {
    posts: number;
    sessions: number;
  };
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified?: boolean;
  mustChangePassword?: boolean;
  roleNames: string[];
  password?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified?: boolean;
  mustChangePassword?: boolean;
}

export interface UsersQueryParams extends PaginationParams {
  role?: string;
  status?: string;
  location?: string;
}

export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: User;
  categories?: Category[];
  tags?: Tag[];
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface PostsQueryParams extends PaginationParams {
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: string;
  featured?: boolean;
}

export interface PostAnalytics {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
}

export interface PostsStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface CreateTagRequest {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateTagRequest {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface TagsQueryParams extends PaginationParams {
  isActive?: boolean;
}

export interface TagsStats {
  totalTags: number;
  activeTags: number;
  usedTags: number;
}

// Asset Types
export interface Asset {
  id: string;
  name: string;
  originalName: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  mimeType: string;
  filename: string;
  path: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  size: number;
  tags?: string[];
  metadata?: Record<string, any>;
  usageCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  uploadedBy: User;
}

export interface CreateAssetRequest {
  name: string;
  originalName: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  mimeType: string;
  filename: string;
  path: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  size: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAssetRequest {
  name?: string;
  alt?: string;
  caption?: string;
  description?: string;
  tags?: string[];
}

export interface AssetsQueryParams extends PaginationParams {
  type?: string;
  tags?: string;
}

export interface AssetsStats {
  totalAssets: number;
  totalSize: number;
  assetsByType: Record<string, number>;
  mostUsedAssets: Asset[];
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  maxAttendees?: number;
  image?: string;
  price?: number;
  isPaid: boolean;
  isPublic: boolean;
  tags?: string[];
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  attendeesCount: number;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: User;
  registrations?: EventRegistration[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  registeredAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  maxAttendees?: number;
  image?: string;
  price?: number;
  isPaid?: boolean;
  isPublic?: boolean;
  tags?: string[];
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  requiresRegistration?: boolean;
  registrationDeadline?: string;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  maxAttendees?: number;
  image?: string;
  price?: number;
  isPaid?: boolean;
  isPublic?: boolean;
  tags?: string[];
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  requiresRegistration?: boolean;
  registrationDeadline?: string;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface EventRegistrationRequest {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
}

export interface EventsQueryParams extends PaginationParams {
  status?: string;
  tags?: string;
  location?: string;
  upcoming?: boolean;
}

export interface EventsStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
}

// Member Types
export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  company?: string;
  position?: string;
  experience?: number;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  location?: string;
  isExpert: boolean;
  isActive: boolean;
  joinDate?: string;
  certifications?: string[];
  articlesCount: number;
  mentoringCount: number;
  createdAt: string;
  updatedAt: string;
  mentoringHistory?: MentoringSession[];
}

export interface MentoringSession {
  id: string;
  mentorId: string;
  menteeName: string;
  menteeEmail?: string;
  topic: string;
  date: string;
  duration: number;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  feedback?: string;
  rating?: number;
  createdAt: string;
}

export interface CreateMemberRequest {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  company?: string;
  position?: string;
  experience?: number;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  location?: string;
  isExpert?: boolean;
  isActive?: boolean;
  joinDate?: string;
  certifications?: string[];
}

export interface UpdateMemberRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  company?: string;
  position?: string;
  experience?: number;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  location?: string;
  isExpert?: boolean;
  isActive?: boolean;
  joinDate?: string;
  certifications?: string[];
}

export interface CreateMentoringRequest {
  menteeName: string;
  menteeEmail?: string;
  topic: string;
  date: string;
  duration: number;
  notes?: string;
}

export interface MembersQueryParams extends PaginationParams {
  expertise?: string;
  isExpert?: boolean;
  isActive?: boolean;
  location?: string;
}

export interface MembersStats {
  totalMembers: number;
  activeMembers: number;
  experts: number;
  mentoringHours: number;
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  isPublished: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  searchKeywords?: string[];
  viewCount: number;
  likeCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  author: User;
  feedback?: FAQFeedback[];
}

export interface FAQFeedback {
  id: string;
  faqId: string;
  userId?: string;
  type: 'HELPFUL' | 'NOT_HELPFUL' | 'SUGGESTION';
  comment?: string;
  createdAt: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  isPublished?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  searchKeywords?: string[];
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  searchKeywords?: string[];
}

export interface CreateFAQFeedbackRequest {
  type: 'HELPFUL' | 'NOT_HELPFUL' | 'SUGGESTION';
  comment?: string;
}

export interface FAQsQueryParams extends PaginationParams {
  category?: string;
  priority?: string;
  tags?: string;
  isPublished?: boolean;
}

export interface FAQSearchParams {
  q: string;
  category?: string;
  limit?: number;
}

export interface FAQsStats {
  totalFAQs: number;
  publishedFAQs: number;
  categoriesCount: number;
  totalViews: number;
}
