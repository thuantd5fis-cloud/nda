import { PrismaClient, UserStatus, PostStatus, AssetType, EventStatus, FeedbackType, MentoringStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

declare const process: any;
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data in correct order
  await prisma.fAQFeedback.deleteMany();
  await prisma.assetUsage.deleteMany();
  await prisma.mentoringSession.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.analyticsView.deleteMany(); // Add this line
  await prisma.auditTrail.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.postTranslation.deleteMany(); // Add this line
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.member.deleteMany();
  await prisma.event.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.create({ data: { resource: 'posts', action: 'create' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'read' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'update' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'delete' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'submit-review' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'approve' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'reject' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'publish' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'archive' } }),
    prisma.permission.create({ data: { resource: 'posts', action: 'moderate' } }),
    prisma.permission.create({ data: { resource: 'users', action: 'create' } }),
    prisma.permission.create({ data: { resource: 'users', action: 'read' } }),
    prisma.permission.create({ data: { resource: 'users', action: 'update' } }),
    prisma.permission.create({ data: { resource: 'users', action: 'delete' } }),
    prisma.permission.create({ data: { resource: 'categories', action: 'create' } }),
    prisma.permission.create({ data: { resource: 'categories', action: 'read' } }),
    prisma.permission.create({ data: { resource: 'categories', action: 'update' } }),
    prisma.permission.create({ data: { resource: 'categories', action: 'delete' } }),
    prisma.permission.create({ data: { resource: 'assets', action: 'create' } }),
    prisma.permission.create({ data: { resource: 'assets', action: 'read' } }),
    prisma.permission.create({ data: { resource: 'assets', action: 'update' } }),
    prisma.permission.create({ data: { resource: 'assets', action: 'delete' } }),
  ]);

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'super_admin',
      description: 'Full system access',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Admin access',
    },
  });

  const editorRole = await prisma.role.create({
    data: {
      name: 'editor',
      description: 'Content editor',
    },
  });

  const authorRole = await prisma.role.create({
    data: {
      name: 'author',
      description: 'Content author',
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: 'moderator',
      description: 'Content moderator',
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: 'viewer',
      description: 'Read-only access',
    },
  });

  // Assign permissions to roles
  // Super admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets most permissions
  const adminPermissions = permissions.filter(p => 
    !['users'].includes(p.resource) || p.action !== 'delete'
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator permissions - can create, approve, reject, archive posts
  const moderatorPermissions = permissions.filter(p => 
    (p.resource === 'posts' && ['create', 'read', 'update', 'submit-review', 'approve', 'reject', 'publish', 'archive', 'moderate'].includes(p.action)) ||
    (p.resource === 'categories' && ['read'].includes(p.action)) ||
    (p.resource === 'assets' && ['create', 'read', 'update'].includes(p.action))
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Editor permissions - can create and submit content for review
  const editorPermissions = permissions.filter(p => 
    (p.resource === 'posts' && ['create', 'read', 'update', 'submit-review'].includes(p.action)) ||
    (p.resource === 'categories' && ['read'].includes(p.action)) ||
    (p.resource === 'assets' && ['create', 'read', 'update'].includes(p.action))
  );
  for (const permission of editorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: editorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Author permissions - can create and submit content for review
  const authorPermissions = permissions.filter(p => 
    (p.resource === 'posts' && ['create', 'read', 'update', 'submit-review'].includes(p.action)) ||
    (p.resource === 'categories' && ['read'].includes(p.action)) ||
    (p.resource === 'assets' && ['create', 'read', 'update'].includes(p.action))
  );
  for (const permission of authorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: authorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer permissions - read only
  const viewerPermissions = permissions.filter(p => 
    ['read'].includes(p.action)
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create users
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      phone: '0901234567',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loginCount: 0,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin2@example.com',
      passwordHash: await bcrypt.hash('Admin@456', 12),
      fullName: 'Admin User',
      phone: '0909876543',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loginCount: 0,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      passwordHash: await bcrypt.hash('Editor@123', 12),
      fullName: 'Editor User',
      phone: '0912345678',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loginCount: 0,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  const author = await prisma.user.create({
    data: {
      email: 'author@example.com',
      passwordHash: await bcrypt.hash('Author@123', 12),
      fullName: 'Author User',
      phone: '0913456789',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loginCount: 0,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@example.com',
      passwordHash: await bcrypt.hash('Moderator@123', 12),
      fullName: 'Moderator User',
      phone: '0914567890',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loginCount: 0,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  // Assign roles to users
  await prisma.userRole.create({
    data: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  await prisma.userRole.create({
    data: { userId: admin.id, roleId: adminRole.id },
  });

  await prisma.userRole.create({
    data: { userId: editor.id, roleId: editorRole.id },
  });

  await prisma.userRole.create({
    data: { userId: author.id, roleId: authorRole.id },
  });

  await prisma.userRole.create({
    data: { userId: moderator.id, roleId: moderatorRole.id },
  });

  // Create categories
  const categories: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const category = await prisma.category.create({
      data: {
        name: `Category ${i}`,
        slug: `category-${i}`,
        metaTitle: `Category ${i} Meta Title`,
        metaDescription: `Meta description for category ${i}`,
        locale: 'vi',
      },
    });
    categories.push(category);
  }

  // Create child categories
  await prisma.category.create({
    data: {
      name: 'Sub Category 1',
      slug: 'sub-category-1',
      parentId: categories[0].id,
      metaTitle: 'Sub Category 1 Meta Title',
      metaDescription: 'Meta description for sub category 1',
      locale: 'vi',
    },
  });

  // Create tags
  const tags: any[] = [];
  const tagColors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'indigo', 'gray'];
  for (let i = 1; i <= 10; i++) {
    const tag = await prisma.tag.create({
      data: {
        name: `Tag ${i}`,
        slug: `tag-${i}`,
        description: `Description for tag ${i}`,
        color: tagColors[i % tagColors.length],
        isActive: true,
      },
    });
    tags.push(tag);
  }

  // Create assets
  const assets: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `sample-image-${i}`,
        originalName: `sample-image-${i}.jpg`,
        type: AssetType.IMAGE,
        mimeType: 'image/jpeg',
        filename: `image-${i}.jpg`,
        path: `/uploads/image-${i}.jpg`,
        url: `/uploads/image-${i}.jpg`,
        thumbnailUrl: `/uploads/thumbnails/image-${i}-thumb.jpg`,
        size: 1024 * (i * 100),
        width: 800,
        height: 600,
        alt: `Sample image ${i} alt text`,
        caption: `Sample image ${i} caption`,
        description: `Description for sample image ${i}`,
        tags: [`image`, `sample`, `tag${i}`],
        metadata: {
          format: 'JPEG',
          colorSpace: 'sRGB',
          dpi: 72
        },
        optimized: true,
        usageCount: i <= 3 ? 2 : 0,
        downloadCount: i * 5,
        createdBy: superAdmin.id,
      },
    });
    assets.push(asset);
  }

  // Create posts
  for (let i = 1; i <= 10; i++) {
    const post = await prisma.post.create({
      data: {
        title: `Sample Post ${i}`,
        slug: `sample-post-${i}`,
        excerpt: `This is excerpt for post ${i}`,
        content: `<h1>Sample Post ${i}</h1><p>This is the content of sample post ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`,
        status: i <= 5 ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        allowComments: true,
        isFeatured: i <= 2,
        requireLogin: false,
        type: 'article',
        locale: 'vi',
        publishedAt: i <= 5 ? new Date() : null,
        createdBy: superAdmin.id,
        metaTitle: `Sample Post ${i} - Meta Title`,
        metaDescription: `Meta description for sample post ${i}`,
        keywords: [`post${i}`, `sample`, `content`],
      },
    });

    // Assign categories and tags
    await prisma.postCategory.create({
      data: {
        postId: post.id,
        categoryId: categories[i % categories.length].id,
      },
    });

    await prisma.postTag.create({
      data: {
        postId: post.id,
        tagId: tags[i % tags.length].id,
      },
    });
  }

  // Create members
  const expertiseAreas = ['JavaScript', 'React', 'Node.js', 'Python', 'AI', 'DevOps', 'UI/UX', 'Mobile'];
  for (let i = 1; i <= 5; i++) {
    const member = await prisma.member.create({
      data: {
        crmId: `CRM-${1000 + i}`,
        fullName: `Member Expert ${i}`,
        email: `member${i}@example.com`,
        phone: `090${1000000 + i}`,
        avatar: `/images/members/member-${i}.jpg`,
        title: `Senior ${i <= 2 ? 'Developer' : 'Consultant'}`,
        bio: `Experienced professional with ${3 + i} years in tech industry. Specializes in modern web development and mentoring.`,
        expertise: expertiseAreas.slice(0, 2 + (i % 3)),
        company: `Tech Company ${i}`,
        position: `Senior ${i <= 2 ? 'Developer' : 'Consultant'}`,
        experience: 3 + i,
        website: `https://member${i}.dev`,
        linkedin: `https://linkedin.com/in/member${i}`,
        github: `https://github.com/member${i}`,
        location: i <= 2 ? 'Hà Nội' : i <= 4 ? 'TP.HCM' : 'Đà Nẵng',
        isExpert: i <= 3,
        isActive: true,
        joinDate: new Date(2023, i, 15),
        certifications: i <= 2 ? [`AWS Certified`, `React Expert`] : [`Professional Cert`],
        articlesCount: i * 3,
        mentoringCount: i <= 3 ? i * 2 : 0,
      },
    });
  }

  // Create events
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const event = await prisma.event.create({
      data: {
        title: `Workshop: Modern Web Development ${i}`,
        description: `Learn modern web development techniques and best practices in workshop ${i}. This comprehensive workshop covers the latest technologies and frameworks.`,
        startDate: new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000), // i weeks from now
        endDate: new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        location: i === 1 ? 'Hà Nội' : i === 2 ? 'TP.HCM' : 'Đà Nẵng',
        venue: `Tech Hub ${i}, Building A${i}`,
        maxAttendees: 50 + (i * 10),
        image: `/images/events/workshop-${i}.jpg`,
        price: i === 1 ? 0 : (i * 200000),
        isPaid: i > 1,
        isPublic: true,
        tags: ['Workshop', 'Programming', 'Tech'],
        organizer: 'Tech Community VN',
        contactEmail: `event${i}@techcommunity.vn`,
        contactPhone: `090${1000000 + i}`,
        website: `https://workshop${i}.techcommunity.vn`,
        requiresRegistration: true,
        registrationDeadline: new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000), // 1 day before
        status: EventStatus.UPCOMING,
        attendeesCount: i * 5,
        createdBy: superAdmin.id,
      },
    });
  }

  // Create FAQs
  const faqCategories = ['Tài khoản & Đăng nhập', 'Bài viết & Nội dung', 'Thanh toán & Phí', 'Sự kiện & Workshop', 'Hỗ trợ kỹ thuật'];
  for (let i = 1; i <= 5; i++) {
    const faq = await prisma.fAQ.create({
      data: {
        question: `Câu hỏi thường gặp số ${i}?`,
        answer: `Đây là câu trả lời chi tiết cho câu hỏi thường gặp số ${i}. Câu trả lời này cung cấp thông tin đầy đủ và hữu ích cho người dùng.`,
        category: faqCategories[i - 1],
        tags: ['Phổ biến', i <= 2 ? 'Mới bắt đầu' : 'Nâng cao'],
        isPublished: true,
        priority: i <= 2 ? 2 : 3,
        searchKeywords: [`keyword${i}`, `search${i}`, 'hỗ trợ'],
        viewCount: i * 100,
        likeCount: i * 10,
        order: i,
        createdBy: superAdmin.id,
      },
    });
  }

  // Create default system settings
  const defaultSettings = [
    {
      category: 'general',
      data: {
        siteName: 'CMS Admin',
        siteDescription: 'Hệ thống quản lý nội dung hiện đại',
        siteUrl: 'https://cms-admin.example.com',
        adminEmail: 'admin@example.com',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      }
    },
    {
      category: 'security',
      data: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        twoFactorRequired: false,
      }
    },
    {
      category: 'email',
      data: {
        provider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        fromEmail: 'noreply@example.com',
        fromName: 'CMS Admin',
        enableEmailNotifications: true,
      }
    },
    {
      category: 'homePage',
      data: {
        heroBanners: [
          {
            id: "1",
            type: "video",
            title: "Chào mừng đến với tương lai số",
            subtitle: "Khám phá những công nghệ tiên tiến nhất",
            textStyle: {
              color: "#ffffff",
              fontSize: "48px",
              animation: "fadeInUp",
              position: "center"
            },
            media: "550e8400-e29b-41d4-a716-446655440000",
            gradientOverlay: "linear-gradient(45deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))",
            link: {
              url: "/about",
              text: "Tìm hiểu thêm",
              openInNewTab: false
            },
            isActive: true,
            order: 1
          }
        ],
        statsNumbers: {
          members: 1500,
          projects: 500,
          partners: 5000,
          events: 1000
        },
        globe: {
          location: "Paris",
          coordinates: { lat: 48.8566, lng: 2.3522 },
          zoomLevel: 2
        },

        boardMembers: [
          { name: "Lê Minh Tuấn", title: "Chủ tịch", image: "a1b2c3d4-e5f6-4789-8a0b-c1d2e3f4g5h6" },
          { name: "Nguyễn Anh Tuấn", title: "Phó chủ tịch", image: "b2c3d4e5-f6g7-489a-9b0c-d1e2f3g4h5i6" }
        ],
        partners: [
          { name: "Mobifone", logo: "c3d4e5f6-g7h8-490b-a1c2-d3e4f5g6h7i8" },
          { name: "FPT", logo: "d4e5f6g7-h8i9-4a0c-b1d2-e3f4g5h6i7j8" }
        ],
        events: [], // Will be populated with actual event IDs when events are created
        news: [], // Will be populated with actual post IDs when posts are created
        digitalProducts: {
          image: "g7h8i9j0-k1l2-4d3f-e4g5-h6i7j8k9l0m1",
          title: "Hệ thống Thu thập dữ liệu quốc gia"
        }
      }
    },
    {
      category: 'header',
      data: {
        logo: "https://cdn.ndax.vn/logo-nda.svg",
        menu: [
          { label: "Trang chủ", url: "/", children: [] },
          { 
            label: "Giới thiệu", 
            url: "/gioi-thieu",
            children: [
              { label: "Về chúng tôi", url: "/gioi-thieu/ve-chung-toi" },
              { label: "Lịch sử", url: "/gioi-thieu/lich-su" },
              { label: "Tầm nhìn", url: "/gioi-thieu/tam-nhin" }
            ]
          },
          { 
            label: "Hoạt động", 
            url: "/hoat-dong",
            children: [
              { label: "Sự kiện", url: "/hoat-dong/su-kien" },
              { label: "Dự án", url: "/hoat-dong/du-an" },
              { label: "Hội thảo", url: "/hoat-dong/hoi-thao" }
            ]
          },
          { label: "Tin tức", url: "/tin-tuc", children: [] },
          { 
            label: "Tư liệu", 
            url: "/tu-lieu",
            children: [
              { label: "Báo cáo", url: "/tu-lieu/bao-cao" },
              { label: "Nghiên cứu", url: "/tu-lieu/nghien-cuu" },
              { label: "Tài liệu", url: "/tu-lieu/tai-lieu" }
            ]
          },
          { label: "Hội viên", url: "/hoi-vien", children: [] },
          { label: "FAQ", url: "/faq", children: [] },
          { label: "Liên hệ", url: "/lien-he", children: [] }
        ],
        languages: [
          { code: "vi-VN", label: "Tiếng Việt", flag: "🇻🇳" },
          { code: "en-US", label: "English", flag: "🇺🇸" }
        ]
      }
    },
    {
      category: 'footer',
      data: {
        logo: "https://cdn.ndax.vn/logo-nda-badge.svg",
        address: "Cung Thanh Niên, 37 Trần Bình Trọng, Hai Bà Trưng, Hà Nội",
        phone: "+84 28 1234 5678",
        email: "info@nda.org.vn",
        social: [
          { 
            name: "facebook", 
            icon: "https://cdn.ndax.vn/icons/facebook.svg", 
            url: "https://facebook.com/nda" 
          },
          { 
            name: "telegram", 
            icon: "https://cdn.ndax.vn/icons/telegram.svg", 
            url: "https://t.me/nda" 
          },
          { 
            name: "linkedin", 
            icon: "https://cdn.ndax.vn/icons/linkedin.svg", 
            url: "https://linkedin.com/company/nda" 
          }
        ],
        legal: "Hiệp hội Dữ liệu Quốc gia"
      }
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { category: setting.category },
      update: { data: setting.data },
      create: setting,
    });
  }

  // Seed Digital Era Quotes
  console.log('📝 Seeding digital era quotes...');
  
  const digitalEraQuotes = [
    {
      text: "Chuyển đổi số không chỉ là công nghệ, đó là thay đổi tư duy, quy trình và cách chúng ta tạo ra giá trị cho cộng đồng.",
      author: "Nguyễn Minh An",
      order: 1,
      isActive: true
    },
    {
      text: "Trong kỷ nguyên số, dữ liệu chính là tài sản quý giá nhất, nhưng cách chúng ta sử dụng nó quyết định giá trị thực sự.",
      author: "Chủ tịch Hiệp hội Số",
      order: 2,
      isActive: true
    },
    {
      text: "Đổi mới sáng tạo trong thời đại số không phải là lựa chọn mà là yêu cầu bắt buộc để tồn tại và phát triển.",
      author: "Viện Nghiên cứu Tương lai",
      order: 3,
      isActive: true
    },
    {
      text: "Công nghệ số đang định hình lại cách chúng ta sống, làm việc và kết nối với nhau trong xã hội hiện đại.",
      author: "Trung tâm Chuyển đổi Số",
      order: 4,
      isActive: true
    }
  ];

  // Check if digital era quotes already exist
  const existingQuotes = await prisma.digitalEra.count();
  
  if (existingQuotes === 0) {
    await prisma.digitalEra.createMany({
      data: digitalEraQuotes,
      skipDuplicates: true
    });
    console.log(`✅ Created ${digitalEraQuotes.length} digital era quotes`);
  } else {
    console.log(`ℹ️ Digital era quotes already exist (${existingQuotes} records)`);
  }

  console.log('✅ Seed completed!');
  console.log('🔑 Login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
