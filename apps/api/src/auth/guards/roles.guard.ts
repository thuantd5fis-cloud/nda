import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.id) {
      throw new ForbiddenException('User ID not found in token');
    }

    // Check if user has required permissions
    const hasPermission = await this.checkUserPermissions(user.id, requiredPermissions);
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async checkUserPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    if (!userId) {
      return false;
    }

    try {
      // Get user's roles and permissions
      const userWithRoles = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userWithRoles) {
        return false;
      }

      // Collect all permissions from all roles
      const userPermissions = new Set<string>();
      
      for (const userRole of userWithRoles.userRoles) {
        for (const rolePermission of userRole.role.rolePermissions) {
          const permissionKey = `${rolePermission.permission.resource}:${rolePermission.permission.action}`;
          userPermissions.add(permissionKey);
        }
      }

      // Debug logging (remove in production)
      // console.log(`User ${userId} permissions:`, Array.from(userPermissions));
      // console.log(`Required permissions:`, requiredPermissions);

      // Check if user has all required permissions
      return requiredPermissions.every(permission => userPermissions.has(permission));
    } catch (error) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking user permissions:', error);
      }
      return false;
    }
  }
}
