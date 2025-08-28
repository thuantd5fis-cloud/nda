import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      return false;
    }

    // Check if user has active session
    const activeSession = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!activeSession) {
      throw new UnauthorizedException('Session expired. Please login again.');
    }

    // Update last access time
    await this.prisma.session.update({
      where: { id: activeSession.id },
      data: { lastAccessAt: new Date() },
    });

    // Check session timeout (30 minutes of inactivity)
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const timeSinceLastAccess = Date.now() - activeSession.lastAccessAt.getTime();

    if (timeSinceLastAccess > SESSION_TIMEOUT) {
      // Deactivate session
      await this.prisma.session.update({
        where: { id: activeSession.id },
        data: { isActive: false },
      });

      throw new UnauthorizedException('Session timeout. Please login again.');
    }

    return true;
  }
}
