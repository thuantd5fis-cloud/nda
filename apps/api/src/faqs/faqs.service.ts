import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FAQsService {
  constructor(private prisma: PrismaService) {}

  async create(createFAQDto: CreateFAQDto, userId: string) {
    // Auto-generate search keywords from question and answer
    const autoKeywords = this.extractKeywords(createFAQDto.question, createFAQDto.answer);
    const allKeywords = [...new Set([
      ...(createFAQDto.searchKeywords || []),
      ...autoKeywords
    ])];

    const faq = await this.prisma.fAQ.create({
      data: {
        ...createFAQDto,
        searchKeywords: allKeywords,
        createdBy: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            feedback: true,
          },
        },
      },
    });

    return faq;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isPublished?: boolean;
    priority?: number;
    tags?: string;
  }) {
    const { page = 1, limit = 10, search, category, isPublished, priority, tags } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { searchKeywords: { hasSome: search.split(' ') } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    if (priority) {
      where.priority = priority;
    }

    if (tags) {
      where.tags = {
        hasSome: tags.split(','),
      };
    }

    const [faqs, total] = await Promise.all([
      this.prisma.fAQ.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              feedback: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    return {
      data: faqs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        feedback: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            feedback: true,
          },
        },
      },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    // Increment view count
    await this.prisma.fAQ.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return faq;
  }

  async update(id: string, updateFAQDto: UpdateFAQDto) {
    const existingFAQ = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!existingFAQ) {
      throw new NotFoundException('FAQ not found');
    }

    // Auto-generate search keywords if question or answer changed
    let searchKeywords = (updateFAQDto as any).searchKeywords;
    if ((updateFAQDto as any).question || (updateFAQDto as any).answer) {
      const autoKeywords = this.extractKeywords(
        (updateFAQDto as any).question || existingFAQ.question,
        (updateFAQDto as any).answer || existingFAQ.answer
      );
      searchKeywords = [...new Set([
        ...((updateFAQDto as any).searchKeywords || existingFAQ.searchKeywords),
        ...autoKeywords
      ])];
    }

    const faq = await this.prisma.fAQ.update({
      where: { id },
      data: {
        ...updateFAQDto,
        searchKeywords,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            feedback: true,
          },
        },
      },
    });

    return faq;
  }

  async remove(id: string) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.prisma.fAQ.delete({
      where: { id },
    });

    return { message: 'FAQ deleted successfully' };
  }

  async createFeedback(faqId: string, userId: string | null, createFeedbackDto: CreateFeedbackDto) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    const feedback = await this.prisma.fAQFeedback.create({
      data: {
        faqId,
        userId,
        ...createFeedbackDto,
      },
      include: {
        user: userId ? {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        } : false,
      },
    });

    // Update like count if feedback is helpful
    if (createFeedbackDto.type === 'HELPFUL') {
      await this.prisma.fAQ.update({
        where: { id: faqId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
    }

    return feedback;
  }

  async reorderFAQs(reorderData: { id: string; order: number }[]) {
    const updatePromises = reorderData.map(({ id, order }) =>
      this.prisma.fAQ.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);

    return { message: 'FAQs reordered successfully' };
  }

  async getStats() {
    const [totalFAQs, publishedFAQs, totalViews, totalFeedback] = await Promise.all([
      this.prisma.fAQ.count(),
      this.prisma.fAQ.count({ where: { isPublished: true } }),
      this.prisma.fAQ.aggregate({
        _sum: {
          viewCount: true,
        },
      }),
      this.prisma.fAQFeedback.count(),
    ]);

    return {
      totalFAQs,
      publishedFAQs,
      totalViews: totalViews._sum.viewCount || 0,
      totalFeedback,
    };
  }

  async searchFAQs(searchTerm: string, limit = 10) {
    const faqs = await this.prisma.fAQ.findMany({
      where: {
        isPublished: true,
        OR: [
          { question: { contains: searchTerm, mode: 'insensitive' } },
          { answer: { contains: searchTerm, mode: 'insensitive' } },
          { searchKeywords: { hasSome: searchTerm.split(' ') } },
          { tags: { hasSome: searchTerm.split(' ') } },
        ],
      },
      take: limit,
      orderBy: [
        { priority: 'asc' },
        { viewCount: 'desc' },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        tags: true,
        viewCount: true,
        likeCount: true,
      },
    });

    return faqs;
  }

  private extractKeywords(question: string, answer: string): string[] {
    const text = `${question} ${answer}`.toLowerCase();
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Remove duplicates and return top 10
    return [...new Set(words)].slice(0, 10);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'một', 'các', 'này', 'đó', 'là', 'có', 'được', 'để', 'trong', 'trên', 'với', 'của'
    ];
    return stopWords.includes(word);
  }
}
