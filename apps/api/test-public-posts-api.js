const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🚀 Testing Public Posts API...\n');

  try {
    // Test 1: Get all published posts with pagination
    console.log('📰 1. Getting all published posts (page 1, limit 5):');
    const allPosts = await fetch(`${API_BASE_URL}/public/posts?page=1&limit=5`);
    const allPostsData = await allPosts.json();
    console.log(`✅ Found ${allPostsData.pagination.total} total posts`);
    console.log(`📄 Page ${allPostsData.pagination.page}/${allPostsData.pagination.totalPages}`);
    console.log(`📝 Showing ${allPostsData.data.length} posts:\n`);
    
    allPostsData.data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
      console.log(`      📅 Published: ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}`);
      console.log(`      👤 Author: ${post.author.fullName}`);
      console.log(`      🏷️  Categories: ${post.categories.map(c => c.name).join(', ') || 'None'}`);
      console.log('');
    });

    // Test 2: Get featured posts
    console.log('⭐ 2. Getting featured posts (limit 3):');
    const featuredPosts = await fetch(`${API_BASE_URL}/public/posts/featured?limit=3`);
    const featuredData = await featuredPosts.json();
    console.log(`✅ Found ${featuredData.data.length} featured posts:\n`);
    
    featuredData.data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} ⭐`);
    });

    // Test 3: Get latest posts
    console.log('\n🆕 3. Getting latest posts (limit 3):');
    const latestPosts = await fetch(`${API_BASE_URL}/public/posts/latest?limit=3`);
    const latestData = await latestPosts.json();
    console.log(`✅ Found ${latestData.data.length} latest posts:\n`);
    
    latestData.data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
      console.log(`      📅 ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}`);
    });

    // Test 4: Get categories
    console.log('\n📂 4. Getting all categories with post counts:');
    const categories = await fetch(`${API_BASE_URL}/public/posts/categories`);
    const categoriesData = await categories.json();
    console.log(`✅ Found ${categoriesData.data.length} categories:\n`);
    
    categoriesData.data.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (${category.postCount} posts)`);
      console.log(`      🔗 Slug: ${category.slug}`);
    });

    // Test 5: Search posts
    console.log('\n🔍 5. Searching posts with keyword "post":');
    const searchPosts = await fetch(`${API_BASE_URL}/public/posts?search=post&limit=3`);
    const searchData = await searchPosts.json();
    console.log(`✅ Found ${searchData.data.length} posts matching "post":\n`);
    
    searchData.data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testAPI();
