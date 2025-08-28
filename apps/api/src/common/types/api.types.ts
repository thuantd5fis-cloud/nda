// Temporary types to handle Prisma client generation issues

export interface UserSelectFields {
  id: boolean;
  email: boolean;
  fullName: boolean;
  phone?: boolean;
  avatar?: boolean;
  bio?: boolean;
  position?: boolean;
  organization?: boolean;
  website?: boolean;
  linkedin?: boolean;
  twitter?: boolean;
  github?: boolean;
  location?: boolean;
  status: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: boolean;
  loginCount?: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface UserUpdateData {
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  position?: string;
  organization?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  location?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date;
  loginCount?: number;
}

export interface UserWhereInput {
  id?: string;
  email?: string;
  fullName?: { contains?: string; mode?: 'insensitive' };
  organization?: { contains?: string; mode?: 'insensitive' };
  location?: { contains?: string; mode?: 'insensitive' };
  status?: string;
  emailVerified?: boolean;
  userRoles?: {
    some?: {
      role?: {
        name?: string;
      };
    };
  };
  OR?: Array<{
    fullName?: { contains?: string; mode?: 'insensitive' };
    email?: { contains?: string; mode?: 'insensitive' };
    organization?: { contains?: string; mode?: 'insensitive' };
  }>;
}
