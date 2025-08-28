import { PrismaClient, PostStatus } from '@prisma/client';

declare const process: any;
const prisma = new PrismaClient();

async function seedActivitiesCategories() {
  console.log('🏃 Adding activities categories...');

  const activityCategories = [
    {
      name: 'EVENTS',
      slug: 'events',
      metaTitle: 'Sự kiện',
      metaDescription: 'Danh sách các sự kiện, hội thảo, workshop và các hoạt động khác',
      locale: 'vi',
    },
    {
      name: 'GLOBAL_EXPERTS',
      slug: 'global-experts',
      metaTitle: 'Chuyên gia toàn cầu',
      metaDescription: 'Thông tin về các chuyên gia hàng đầu trên thế giới',
      locale: 'vi',
    },
    {
      name: 'TRAINING',
      slug: 'training',
      metaTitle: 'Đào tạo',
      metaDescription: 'Các chương trình đào tạo, khóa học và tài liệu học tập',
      locale: 'vi',
    },
    {
      name: 'POLICIES_AND_LEGAL_AFFAIRS',
      slug: 'policies-and-legal-affairs',
      metaTitle: 'Chính sách và Pháp lý',
      metaDescription: 'Các chính sách, quy định pháp luật và văn bản hướng dẫn',
      locale: 'vi',
    },
    {
      name: 'INTERNATIONAL_COOPERATION',
      slug: 'international-cooperation',
      metaTitle: 'Hợp tác quốc tế',
      metaDescription: 'Các hoạt động hợp tác quốc tế, dự án và quan hệ đối tác',
      locale: 'vi',
    },
  ];

  for (const categoryData of activityCategories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (!existingCategory) {
      const category = await prisma.category.create({
        data: categoryData,
      });
      console.log(`✅ Created category: ${category.name} (${category.slug})`);

      // Tạo một số posts mẫu cho category này
      const samplePosts = [
        {
          title: `Sample ${categoryData.name} Post 1`,
          slug: `sample-${categoryData.slug}-post-1`,
          excerpt: `This is a sample post for ${categoryData.name} category`,
          content: `<h1>Sample ${categoryData.name} Post</h1><p>This is sample content for ${categoryData.name} category.</p>`,
          status: PostStatus.PUBLISHED,
          allowComments: true,
          isFeatured: false,
          requireLogin: false,
          type: 'article',
          locale: 'vi',
          publishedAt: new Date(),
          metaTitle: `Sample ${categoryData.name} Post - Meta Title`,
          metaDescription: `Meta description for sample ${categoryData.name} post`,
          keywords: [categoryData.slug, 'sample', 'activity'],
        },
        {
          title: `Sample ${categoryData.name} Post 2`,
          slug: `sample-${categoryData.slug}-post-2`,
          excerpt: `This is another sample post for ${categoryData.name} category`,
          content: `<h1>Another Sample ${categoryData.name} Post</h1><p>This is another sample content for ${categoryData.name} category.</p>`,
          status: PostStatus.PUBLISHED,
          allowComments: true,
          isFeatured: true,
          requireLogin: false,
          type: 'article',
          locale: 'vi',
          publishedAt: new Date(),
          metaTitle: `Another Sample ${categoryData.name} Post - Meta Title`,
          metaDescription: `Meta description for another sample ${categoryData.name} post`,
          keywords: [categoryData.slug, 'sample', 'activity', 'featured'],
        },
      ];

      // Lấy user đầu tiên để làm author
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        for (const postData of samplePosts) {
          const existingPost = await prisma.post.findUnique({
            where: { slug: postData.slug },
          });

          if (!existingPost) {
            const post = await prisma.post.create({
              data: {
                ...postData,
                createdBy: firstUser.id,
              },
            });

            // Assign category to post
            await prisma.postCategory.create({
              data: {
                postId: post.id,
                categoryId: category.id,
              },
            });

            console.log(`  ✅ Created sample post: ${post.title}`);
          }
        }
      }
    } else {
      console.log(`ℹ️ Category already exists: ${existingCategory.name} (${existingCategory.slug})`);
    }
  }

  console.log('✅ Activities categories seeded successfully!');
}

seedActivitiesCategories()
  .catch((e) => {
    console.error('❌ Failed to seed activities categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
