import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    try {
      // If no valid user ID provided, use the first available user
      if (userId === 'admin-user-id') {
        const firstUser = await this.prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          throw new BadRequestException('No users found in database. Please create a user first.');
        }
      }

      const { categoryIds, tagIds, ...postData } = createPostDto as any;

      // Check for duplicate slug
      if (createPostDto.slug) {
        const existingPost = await this.prisma.post.findUnique({
          where: { slug: createPostDto.slug },
        });

        if (existingPost) {
          throw new BadRequestException('Slug already exists');
        }
      }

    const post = await this.prisma.post.create({
      data: {
        ...postData,
        createdBy: userId,
        publishedAt: createPostDto.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Assign categories
    if (categoryIds && categoryIds.length > 0) {
      await Promise.all(
        categoryIds.map((categoryId: string) =>
          this.prisma.postCategory.create({
            data: {
              postId: post.id,
              categoryId,
            },
          })
        )
      );
    }

    // Assign tags
    if (tagIds && tagIds.length > 0) {
      await Promise.all(
        tagIds.map((tagId: string) =>
          this.prisma.postTag.create({
            data: {
              postId: post.id,
              tagId,
            },
          })
        )
      );
    }

    return this.findOne(post.id);
    } catch (error) {
      console.error('Create post error:', error);
      throw new BadRequestException('Failed to create post: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    featured?: boolean;
  }) {
    const { page = 1, limit = 10, search, status, categoryId, tagId, authorId, featured } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: search.split(' ') } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.postCategories = {
        some: {
          categoryId,
        },
      };
    }

    if (tagId) {
      where.postTags = {
        some: {
          tagId,
        },
      };
    }

    if (authorId) {
      where.createdBy = authorId;
    }

    if (typeof featured === 'boolean') {
      where.isFeatured = featured;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          updater: {
            select: {
              id: true,
              fullName: true,
            },
          },
          postCategories: {
            include: {
              category: true,
            },
          },
          postTags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              analyticsViews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNewsForLanding(query: {
    page: number;
    limit: number;
    categoryId?: string;
  }) {
    const { page, limit, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date(),
      },
    };

    // Filter by category if provided
    if (categoryId) {
      where.postCategories = {
        some: {
          categoryId,
        },
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
            },
          },
          postCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt,
        author: post.author,
        categories: post.postCategories.map(pc => pc.category),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
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
        updater: {
          select: {
            id: true,
            fullName: true,
          },
        },
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        analyticsViews: {
          orderBy: {
            date: 'desc',
          },
          take: 30,
        },
        _count: {
          select: {
            analyticsViews: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Track view
    await this.trackView(id);

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const { categoryIds, tagIds, ...postData } = updatePostDto as any;

    const existingPost = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    // Check for duplicate slug if slug is being updated
    if ((updatePostDto as any).slug && (updatePostDto as any).slug !== existingPost.slug) {
      const duplicatePost = await this.prisma.post.findUnique({
        where: { slug: (updatePostDto as any).slug },
      });

      if (duplicatePost) {
        throw new BadRequestException('Slug already exists');
      }
    }

    // Update post
    const updateData: any = {
      ...postData,
      updatedBy: userId,
    };

    // Set publishedAt if status is being changed to PUBLISHED
    if ((updatePostDto as any).status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _post = await this.prisma.post.update({
      where: { id },
      data: updateData,
    });

    // Update categories if provided
    if (categoryIds) {
      await this.prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      if (categoryIds.length > 0) {
        await Promise.all(
                  categoryIds.map((categoryId: string) =>
          this.prisma.postCategory.create({
            data: {
              postId: id,
              categoryId,
            },
          })
        )
        );
      }
    }

    // Update tags if provided
    if (tagIds) {
      await this.prisma.postTag.deleteMany({
        where: { postId: id },
      });

      if (tagIds.length > 0) {
        await Promise.all(
          tagIds.map((tagId: string) =>
            this.prisma.postTag.create({
              data: {
                postId: id,
                tagId,
              },
            })
          )
        );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Delete related records in a transaction to avoid foreign key constraint errors
    await this.prisma.$transaction(async (prisma) => {
      // Delete analytics views first
      await prisma.analyticsView.deleteMany({
        where: { 
          entity: 'post',
          entityId: id 
        },
      });

      // Delete asset usage records
      await prisma.assetUsage.deleteMany({
        where: { 
          entityType: 'post',
          entityId: id 
        },
      });

      // Delete post categories (many-to-many relationship)
      await prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      // Delete post tags (many-to-many relationship)
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Finally, delete the post
      await prisma.post.delete({
        where: { id },
      });
    });

    return { message: 'Post deleted successfully' };
  }

  async trackView(postId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingView = await this.prisma.analyticsView.findUnique({
      where: {
        entity_entityId_date: {
          entity: 'post',
          entityId: postId,
          date: today,
        },
      },
    });

    if (existingView) {
      await this.prisma.analyticsView.update({
        where: {
          entity_entityId_date: {
            entity: 'post',
            entityId: postId,
            date: today,
          },
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } else {
      await this.prisma.analyticsView.create({
        data: {
          entity: 'post',
          entityId: postId,
          date: today,
          views: 1,
        },
      });
    }
  }

  async getStats() {
    const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count({ where: { status: 'DRAFT' } }),
      this.prisma.analyticsView.aggregate({
        where: { entity: 'post' },
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.views || 0,
    };
  }

  async getAnalytics(postId: string, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const analytics = await this.prisma.analyticsView.findMany({
      where: {
        entity: 'post',
        entityId: postId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return analytics;
  }

  // Workflow methods
  async submitForReview(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only drafts can be submitted for review
    if (post.status !== 'DRAFT') {
      throw new BadRequestException('Only draft posts can be submitted for review');
    }

    // Check if user is the author or has permission
    if (post.createdBy !== userId) {
      // Allow editors/admins to submit any post for review
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      const isEditor = user?.userRoles.some(ur => 
        ['editor', 'admin', 'super_admin'].includes(ur.role.name)
      );

      if (!isEditor) {
        throw new BadRequestException('You can only submit your own posts for review');
      }
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'REVIEW',
        updatedBy: userId,
      },
    });

    return { message: 'Post submitted for review successfully', post: updatedPost };
  }

  async approvePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only posts in review can be approved
    if (post.status !== 'REVIEW') {
      throw new BadRequestException('Only posts in review can be approved');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedBy: userId,
      },
    });

    return { message: 'Post approved and published successfully', post: updatedPost };
  }

  async rejectPost(postId: string, userId: string, reason?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only posts in review can be rejected
    if (post.status !== 'REVIEW') {
      throw new BadRequestException('Only posts in review can be rejected');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'REJECTED',
        updatedBy: userId,
      },
    });

    // TODO: Add audit trail for rejection reason
    if (reason) {
      await this.prisma.auditTrail.create({
        data: {
          userId,
          entity: 'post',
          entityId: postId,
          action: 'REJECT',
          beforeJson: { status: 'REVIEW' },
          afterJson: { status: 'REJECTED', reason },
        },
      });
    }

    return { message: 'Post rejected successfully', post: updatedPost, reason };
  }

  async archivePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Published or rejected posts can be archived
    if (!['PUBLISHED', 'REJECTED'].includes(post.status)) {
      throw new BadRequestException('Only published or rejected posts can be archived');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'ARCHIVED',
        updatedBy: userId,
      },
    });

    return { message: 'Post archived successfully', post: updatedPost };
  }

  async publishPost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Drafts or posts in review can be directly published (bypass review)
    if (!['DRAFT', 'REVIEW'].includes(post.status)) {
      throw new BadRequestException('Only draft or review posts can be published');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedBy: userId,
      },
    });

    return { message: 'Post published successfully', post: updatedPost };
  }
}
