import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

type JsonValue = Record<string, any> | null | undefined;

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  private getMinioPublicBaseUrl(): string {
    const envUrl = process.env.MINIO_PUBLIC_URL;
    if (envUrl && envUrl.trim().length > 0) return envUrl;
    const host = process.env.MINIO_ENDPOINT || 'http://localhost';
    const port = process.env.MINIO_PORT || '9000';
    // If host already includes protocol, use directly
    if (host.startsWith('http://') || host.startsWith('https://')) {
      return `${host}:${port}`;
    }
    return `http://${host}:${port}`;
  }

  private toPublicUrl(filePath?: string | null): string | null {
    if (!filePath) return null;
    // filePath is stored like "/uploads/<folder>/<filename>"
    const base = this.getMinioPublicBaseUrl();
    return `${base}${filePath}`;
  }

  private isUuidLike(value?: string | null): boolean {
    if (!value) return false;
    return /[0-9a-fA-F-]{36}/.test(value);
  }

  private async resolveFileUrlById(id?: string | null): Promise<string | null> {
    if (!id || !this.isUuidLike(id)) return null;
    try {
      const file = await this.prisma.filesUpload.findUnique({ where: { id } });
      return this.toPublicUrl(file?.filePath || null);
    } catch (_) {
      // In case legacy/non-uuid IDs are present, just return null
      return null;
    }
  }

  private pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>;
    for (const k of keys) out[k] = obj[k];
    return out;
  }

  async getHomepageData() {
    // 1) Load settings JSON
    const settings = await this.prisma.settings.findUnique({ where: { category: 'homePage' } });
    const data = (settings?.data as JsonValue) || {};

    // Fallback object shapes
    const heroBanners = Array.isArray((data as any)?.heroBanners) ? (data as any).heroBanners : [];
    const statsNumbers = (data as any)?.statsNumbers || {};
    const globe = (data as any)?.globe || {};
    const boardMembers = Array.isArray((data as any)?.boardMembers) ? (data as any).boardMembers : [];
    const partners = Array.isArray((data as any)?.partners) ? (data as any).partners : [];
    const digitalProducts = (data as any)?.digitalProducts || {};
    const eventIds: string[] = Array.isArray((data as any)?.events) ? (data as any).events : [];
    const newsIds: string[] = Array.isArray((data as any)?.news) ? (data as any).news : [];

    // 2) Resolve media URLs in parallel
    const bannerMediaUrls = await Promise.all(
      heroBanners.map((b: any) => this.resolveFileUrlById(b?.media))
    );

    const memberImageUrls = await Promise.all(
      boardMembers.map((m: any) => this.resolveFileUrlById(m?.image))
    );

    const partnerLogoUrls = await Promise.all(
      partners.map((p: any) => this.resolveFileUrlById(p?.logo))
    );

    const digitalProductImageUrl = await this.resolveFileUrlById(digitalProducts?.image);

    // 3) Fetch posts and events
    const [posts, events] = await Promise.all([
      newsIds.length > 0
        ? this.prisma.post.findMany({ where: { id: { in: newsIds } } })
        : Promise.resolve([]),
      eventIds.length > 0
        ? this.prisma.event.findMany({ where: { id: { in: eventIds } } })
        : Promise.resolve([]),
    ]);

    // 4) Fetch digital era quotes (active only)
    const digitalEraQuotes = await this.prisma.digitalEra.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // 5) Map response shape
    const response = {
      heroBanners: heroBanners.map((b: any, idx: number) => ({
        id: b?.id ?? String(idx + 1),
        type: b?.type ?? 'image',
        title: b?.title ?? '',
        subtitle: b?.subtitle ?? '',
        textStyle: b?.textStyle ?? {},
        mediaUrl: bannerMediaUrls[idx] || null,
        backgroundColor: b?.backgroundColor ?? null,
        gradientOverlay: b?.gradientOverlay ?? null,
        link: b?.link ?? null,
        isActive: b?.isActive ?? true,
        order: b?.order ?? idx + 1,
      })),
      statsNumbers,
      globe,
      digitalEraQuotes: digitalEraQuotes.map(q => this.pick(q, ['id', 'text', 'author', 'order', 'isActive'])),
      boardMembers: boardMembers.map((m: any, idx: number) => ({
        name: m?.name ?? '',
        title: m?.title ?? '',
        imageUrl: memberImageUrls[idx] || null,
      })),
      partners: partners.map((p: any, idx: number) => ({
        name: p?.name ?? '',
        logoUrl: partnerLogoUrls[idx] || null,
      })),
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
        status: e.status,
        imageUrl: e.image ? this.toPublicUrl(e.image) : null,
      })),
      posts: posts.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featuredImageUrl: p.featuredImage ? this.toPublicUrl(p.featuredImage) : null,
        publishedAt: p.publishedAt,
      })),
      digitalProducts: {
        title: digitalProducts?.title ?? '',
        imageUrl: digitalProductImageUrl,
      },
      updatedAt: settings?.updatedAt ?? new Date(),
    };

    return response;
  }


}


