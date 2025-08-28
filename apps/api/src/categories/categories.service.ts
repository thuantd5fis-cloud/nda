import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            postCategories: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        postCategories: {
          include: {
            post: true,
          },
        },
      },
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      // Check if slug already exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: createCategoryDto.slug },
      });

      if (existingCategory) {
        throw new BadRequestException('Category with this slug already exists');
      }

      // Validate parent category if provided
      if (createCategoryDto.parentId) {
        const parentCategory = await this.prisma.category.findUnique({
          where: { id: createCategoryDto.parentId },
        });

        if (!parentCategory) {
          throw new BadRequestException('Parent category not found');
        }
      }

      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug: createCategoryDto.slug,
          description: createCategoryDto.description,
          parentId: createCategoryDto.parentId || null,
          metaTitle: createCategoryDto.metaTitle,
          metaDescription: createCategoryDto.metaDescription,
          color: createCategoryDto.color,
          icon: createCategoryDto.icon,
          isActive: createCategoryDto.isActive ?? true,
          sortOrder: createCategoryDto.sortOrder ?? 0,
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              postCategories: true,
            },
          },
        },
      });

      console.log('✅ Category created successfully:', category);
      return category;
    } catch (error) {
      console.error('❌ Create category error:', error);
      throw error instanceof BadRequestException ? error : new BadRequestException('Failed to create category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      // Check if slug already exists (excluding current category)
      if (updateCategoryDto.slug && updateCategoryDto.slug !== existingCategory.slug) {
        const slugExists = await this.prisma.category.findUnique({
          where: { slug: updateCategoryDto.slug },
        });

        if (slugExists) {
          throw new BadRequestException('Category with this slug already exists');
        }
      }

      // Validate parent category if provided
      if (updateCategoryDto.parentId) {
        if (updateCategoryDto.parentId === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }

        const parentCategory = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parentCategory) {
          throw new BadRequestException('Parent category not found');
        }
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          parentId: updateCategoryDto.parentId || null,
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              postCategories: true,
            },
          },
        },
      });

      console.log('✅ Category updated successfully:', updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error('❌ Update category error:', error);
      throw error instanceof BadRequestException || error instanceof NotFoundException ? error : new BadRequestException('Failed to update category');
    }
  }

  async remove(id: string) {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              postCategories: true,
              children: true,
            },
          },
        },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      // Check if category has posts
      if (existingCategory._count.postCategories > 0) {
        throw new BadRequestException(`Cannot delete category with ${existingCategory._count.postCategories} associated posts`);
      }

      // Check if category has children
      if (existingCategory._count.children > 0) {
        throw new BadRequestException(`Cannot delete category with ${existingCategory._count.children} child categories`);
      }

      await this.prisma.category.delete({
        where: { id },
      });

      console.log('✅ Category deleted successfully:', id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('❌ Delete category error:', error);
      throw error instanceof BadRequestException || error instanceof NotFoundException ? error : new BadRequestException('Failed to delete category');
    }
  }

  async getCategoriesForPublic() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        sortOrder: true,
        _count: {
          select: {
            postCategories: {
              where: {
                post: {
                  status: 'PUBLISHED'
                }
              }
            },
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });

    // Transform data to include postCount
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder,
      postCount: category._count.postCategories,
    }));
  }
}
