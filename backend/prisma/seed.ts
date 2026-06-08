import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HiveNest database...');

  // ─── ADMIN USER ──────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@hivenest.com' },
    create: {
      email: 'admin@hivenest.com',
      name: 'HiveNest Admin',
      password: adminPass,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
    update: {},
  });

  // ─── CATEGORIES ──────────────────────────────────────────────
  const categories = [
    { name: 'Clothes', icon: 'shirt', sortOrder: 1 },
    { name: 'Footwear', icon: 'shoe', sortOrder: 2 },
    { name: 'Jewelry', icon: 'diamond', sortOrder: 3 },
    { name: 'Perfume', icon: 'perfume', sortOrder: 4 },
    { name: 'Cosmetics', icon: 'lipstick', sortOrder: 5 },
    { name: 'Glasses', icon: 'glasses', sortOrder: 6 },
    { name: 'Bags', icon: 'bag', sortOrder: 7 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const slug = slugify(cat.name, { lower: true, strict: true });
    const c = await prisma.category.upsert({
      where: { slug },
      create: { ...cat, slug, isActive: true },
      update: {},
    });
    categoryMap[cat.name] = c.id;
  }

  // ─── SUBCATEGORIES ───────────────────────────────────────────
  const subCategories = [
    { category: 'Clothes', name: 'Dress & Frock', sortOrder: 1 },
    { category: 'Clothes', name: 'Winter Wear', sortOrder: 2 },
    { category: 'Clothes', name: 'Shorts & Jeans', sortOrder: 3 },
    { category: 'Clothes', name: 'T-Shirts', sortOrder: 4 },
    { category: 'Clothes', name: 'Jacket', sortOrder: 5 },
    { category: 'Clothes', name: 'Hat & Caps', sortOrder: 6 },
    { category: 'Footwear', name: 'Sports Shoes', sortOrder: 1 },
    { category: 'Footwear', name: 'Formal Shoes', sortOrder: 2 },
    { category: 'Footwear', name: 'Casual Shoes', sortOrder: 3 },
    { category: 'Footwear', name: 'Party Wear', sortOrder: 4 },
    { category: 'Jewelry', name: 'Necklaces', sortOrder: 1 },
    { category: 'Jewelry', name: 'Rings', sortOrder: 2 },
    { category: 'Jewelry', name: 'Earrings', sortOrder: 3 },
    { category: 'Jewelry', name: 'Bracelets', sortOrder: 4 },
    { category: 'Glasses', name: 'Glasses & Lens', sortOrder: 1 },
    { category: 'Clothes', name: 'Watch', sortOrder: 7 },
  ];

  const subCategoryMap: Record<string, string> = {};
  for (const sub of subCategories) {
    const slug = slugify(sub.name, { lower: true, strict: true });
    const s = await prisma.subCategory.upsert({
      where: { slug },
      create: { name: sub.name, slug, categoryId: categoryMap[sub.category], isActive: true, sortOrder: sub.sortOrder },
      update: {},
    });
    subCategoryMap[sub.name] = s.id;
  }

  // ─── PRODUCTS ────────────────────────────────────────────────
  const products = [
    { name: "Men's Hoodies T-Shirt", category: 'Clothes', subCategory: 'T-Shirts', brand: 'HiveStyle', price: 7, comparePrice: 17, sku: 'HS-001', stock: 45, isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true, desc: "Premium quality men's hoodie t-shirt with comfortable fit. Perfect for casual wear.", img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80', rating: 4.5 },
    { name: "Girls T-Shirt", category: 'Clothes', subCategory: 'T-Shirts', brand: 'HiveFashion', price: 3, comparePrice: 5, sku: 'HS-002', stock: 60, isFeatured: true, isNewArrival: true, desc: "Stylish girls t-shirt available in multiple colors. Soft cotton fabric.", img: 'https://images.unsplash.com/photo-1503944515243-e7a4a4c1caec?w=400&q=80', rating: 4.5 },
    { name: "Woolen Hat for Men", category: 'Clothes', subCategory: 'Hat & Caps', brand: 'HiveStyle', price: 12, comparePrice: 15, sku: 'HS-003', stock: 30, isTrending: true, desc: "Warm woolen hat for men. Perfect for winter season.", img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80', rating: 5 },
    { name: 'Black Floral Wrap Midi Skirt', category: 'Clothes', subCategory: 'Dress & Frock', brand: 'HiveFashion', price: 25, comparePrice: 35, sku: 'HS-004', stock: 20, isFeatured: true, isNewArrival: true, desc: "Elegant black floral wrap midi skirt. Ideal for parties and casual outings.", img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80', rating: 5 },
    { name: 'Pure Garment Dyed Cotton Shirt', category: 'Clothes', subCategory: 'T-Shirts', brand: 'HiveStyle', price: 45, comparePrice: 56, sku: 'HS-005', stock: 25, isBestSeller: true, desc: "100% pure cotton garment dyed shirt. Comfortable and breathable fabric.", img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', rating: 3 },
    { name: "MEN Yarn Fleece Full-Zip Jacket", category: 'Clothes', subCategory: 'Jacket', brand: 'HiveStyle', price: 58, comparePrice: 65, sku: 'HS-006', stock: 15, isBestSeller: true, isFlashSale: true, flashSaleEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), desc: "Premium yarn fleece full-zip jacket. Super warm for winter.", img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80', rating: 3 },
    { name: "Mens Winter Leather Jacket", category: 'Clothes', subCategory: 'Jacket', brand: 'LeatherKing', price: 32, comparePrice: 45, sku: 'HS-007', stock: 10, isFeatured: true, isTrending: true, desc: "Genuine leather winter jacket for men. Durable and stylish.", img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', rating: 4 },
    { name: 'Better Basics French Terry Sweatshorts', category: 'Clothes', subCategory: 'Shorts & Jeans', brand: 'HiveStyle', price: 20, comparePrice: 30, sku: 'HS-008', stock: 35, isNewArrival: true, desc: "Comfortable french terry sweatshorts perfect for lounging or workouts.", img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80', rating: 3 },
    { name: 'Running & Trekking Shoes - White', category: 'Footwear', subCategory: 'Sports Shoes', brand: 'SportFlex', price: 49, comparePrice: 65, sku: 'FW-001', stock: 40, isFeatured: true, isBestSeller: true, desc: "High-performance running and trekking shoes with superior grip.", img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', rating: 4 },
    { name: 'Trekking & Running Shoes - Black', category: 'Footwear', subCategory: 'Sports Shoes', brand: 'SportFlex', price: 78, comparePrice: 95, sku: 'FW-002', stock: 28, isTrending: true, desc: "Black edition trekking shoes with advanced cushioning technology.", img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', rating: 3 },
    { name: 'Womens Party Wear Shoes', category: 'Footwear', subCategory: 'Party Wear', brand: 'GlamStep', price: 25, comparePrice: 30, sku: 'FW-003', stock: 22, isNewArrival: true, isFlashSale: true, flashSaleEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), desc: "Elegant party wear shoes for women. Perfect for special occasions.", img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', rating: 3 },
    { name: "Men's Leather Formal Shoes", category: 'Footwear', subCategory: 'Formal Shoes', brand: 'FormalKing', price: 50, comparePrice: 65, sku: 'FW-004', stock: 18, isBestSeller: true, desc: "Classic leather formal shoes for men. Professional and elegant.", img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80', rating: 4 },
    { name: "Casual Men's Brown Shoes", category: 'Footwear', subCategory: 'Casual Shoes', brand: 'CasualWalk', price: 99, comparePrice: 105, sku: 'FW-005', stock: 12, isFeatured: true, desc: "Stylish casual brown shoes for men. Comfortable for all-day wear.", img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80', rating: 5 },
    { name: 'Silver Deer Heart Necklace', category: 'Jewelry', subCategory: 'Necklaces', brand: 'LuxeGems', price: 84, comparePrice: 100, sku: 'JW-001', stock: 25, isFeatured: true, isTrending: true, desc: "Beautiful silver deer heart necklace. Perfect gift for loved ones.", img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', rating: 4 },
    { name: 'Platinum Zircon Classic Ring', category: 'Jewelry', subCategory: 'Rings', brand: 'LuxeGems', price: 62, comparePrice: 65, sku: 'JW-002', stock: 15, isNewArrival: true, desc: "Elegant platinum ring with premium zircon stones.", img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', rating: 4 },
    { name: 'Rose Gold Peacock Earrings', category: 'Jewelry', subCategory: 'Earrings', brand: 'LuxeGems', price: 20, comparePrice: 30, sku: 'JW-003', stock: 30, isBestSeller: true, isFlashSale: true, flashSaleEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), desc: "Exquisite rose gold peacock design earrings. Lightweight and stylish.", img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80', rating: 4 },
    { name: 'Titan 100ml Womens Perfume', category: 'Perfume', brand: 'TitanScents', price: 42, comparePrice: 55, sku: 'PF-001', stock: 50, isFeatured: true, isNewArrival: true, desc: "Luxurious 100ml women's perfume with long-lasting fragrance.", img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80', rating: 4 },
    { name: 'Pocket Watch Leather Pouch', category: 'Clothes', subCategory: 'Watch', brand: 'TimeMaster', price: 50, comparePrice: 70, sku: 'WT-001', stock: 20, isTrending: true, desc: "Classic pocket watch with premium leather pouch. Timeless elegance.", img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80', rating: 3 },
    { name: 'Smart Watch Vital Plus', category: 'Clothes', subCategory: 'Watch', brand: 'TechGear', price: 56, comparePrice: 78, sku: 'WT-002', stock: 35, isFeatured: true, isBestSeller: true, desc: "Smart watch with health monitoring features. Track your vitals in style.", img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', rating: 4 },
    { name: 'Shampoo & Conditioner Pack', category: 'Cosmetics', brand: 'BeautyPlus', price: 20, comparePrice: 30, sku: 'CS-001', stock: 100, isNewArrival: true, desc: "Premium shampoo and conditioner pack for healthy shiny hair.", img: 'https://images.unsplash.com/photo-1585232350883-2f4c566494ba?w=400&q=80', rating: 3 },
    { name: 'Luxury Gold Watch', category: 'Clothes', subCategory: 'Watch', brand: 'LuxeTime', price: 120, comparePrice: 150, sku: 'WT-003', stock: 8, isFeatured: true, isTrending: true, desc: "Luxury gold watch for the discerning gentleman. Swiss movement.", img: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&q=80', rating: 5 },
    { name: 'Girls Pink Embro Design Top', category: 'Clothes', subCategory: 'T-Shirts', brand: 'HiveFashion', price: 61, comparePrice: 80, sku: 'HS-009', stock: 18, isNewArrival: true, isTrending: true, desc: "Elegant embroidered pink top for girls. Perfect for parties.", img: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400&q=80', rating: 4 },
    { name: 'Sports Running Shoes Yellow', category: 'Footwear', subCategory: 'Sports Shoes', brand: 'SportFlex', price: 65, comparePrice: 80, sku: 'FW-006', stock: 24, isBestSeller: true, desc: "Vibrant yellow sports running shoes with excellent grip.", img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', rating: 4 },
    { name: 'Hooded Winter Jacket', category: 'Clothes', subCategory: 'Jacket', brand: 'WarmKing', price: 72, comparePrice: 90, sku: 'HS-010', stock: 15, isBestSeller: true, isTrending: true, desc: "Warm hooded winter jacket with waterproof exterior.", img: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=400&q=80', rating: 4 },
  ];

  for (const p of products) {
    const slug = slugify(p.name, { lower: true, strict: true });
    const prod = await prisma.product.upsert({
      where: { slug },
      create: {
        name: p.name,
        slug,
        description: p.desc,
        sku: p.sku,
        brand: p.brand,
        price: p.price,
        comparePrice: p.comparePrice,
        categoryId: categoryMap[p.category],
        subCategoryId: p.subCategory ? subCategoryMap[p.subCategory] : undefined,
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? false,
        isBestSeller: p.isBestSeller ?? false,
        isTrending: p.isTrending ?? false,
        isFlashSale: p.isFlashSale ?? false,
        flashSaleEnd: p.flashSaleEnd ?? null,
        avgRating: p.rating,
        isActive: true,
        images: { create: [{ url: p.img, isPrimary: true, sortOrder: 0 }] },
        inventory: { create: { stock: p.stock } },
      },
      update: {
        images: {
          deleteMany: {},
          create: [{ url: p.img, isPrimary: true, sortOrder: 0 }],
        },
      },
    });
    // Update product sold count for featured
    await prisma.product.update({ where: { id: prod.id }, data: { totalSold: Math.floor(Math.random() * 200) + 10 } });
  }

  // ─── BLOG CATEGORIES ─────────────────────────────────────────
  const blogCats = ['Fashion', 'Footwear', 'Jewelry', 'Fragrance', 'Beauty', 'Accessories', 'Lifestyle'];
  const blogCatMap: Record<string, string> = {};
  for (const name of blogCats) {
    const slug = slugify(name, { lower: true });
    const c = await prisma.blogCategory.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    blogCatMap[name] = c.id;
  }

  // ─── BLOG POSTS ──────────────────────────────────────────────
  const blogs = [
    { title: 'Top 10 Best Watches For Men in 2024', category: 'Accessories', excerpt: 'Discover the most stylish and functional watches for men this year.', content: '<h2>Introduction</h2><p>Watches have always been a statement of style and personality for men.</p>', tags: 'watches,men,fashion,accessories', image: 'https://picsum.photos/seed/blog-watches/800/400' },
    { title: 'Best Perfumes for Women - Complete Guide 2024', category: 'Fragrance', excerpt: 'Find your signature scent from our curated collection of premium perfumes.', content: '<h2>Finding Your Signature Scent</h2><p>Perfume is more than just a fragrance - it is an expression of personality.</p>', tags: 'perfume,fragrance,women,beauty', image: 'https://picsum.photos/seed/blog-perfume/800/400' },
    { title: 'Winter Fashion Guide - Stay Warm in Style', category: 'Fashion', excerpt: 'Your complete guide to winter fashion trends and must-have pieces.', content: '<h2>Winter 2024 Fashion Trends</h2><p>Winter fashion is all about layering intelligently while maintaining style.</p>', tags: 'winter,fashion,jacket,style', image: 'https://picsum.photos/seed/blog-winter/800/400' },
    { title: 'Jewelry Trends 2024 - What\'s Hot This Season', category: 'Jewelry', excerpt: 'Explore the latest jewelry trends and find pieces that complement your style.', content: '<h2>2024 Jewelry Trends</h2><p>This season, jewelry is all about making bold statements while maintaining elegance.</p>', tags: 'jewelry,trends,necklace,rings,earrings', image: 'https://picsum.photos/seed/blog-jewelry/800/400' },
    { title: 'Best T-Shirts Collection - Comfort Meets Style', category: 'Fashion', excerpt: 'Our handpicked collection of premium t-shirts for every style and occasion.', content: '<h2>The Perfect T-Shirt</h2><p>A great t-shirt is the foundation of any wardrobe.</p>', tags: 'tshirts,fashion,casual,style', image: 'https://picsum.photos/seed/blog-tshirt/800/400' },
    { title: 'Complete Footwear Guide - Find Your Perfect Shoes', category: 'Footwear', excerpt: 'Everything you need to know about choosing the right shoes for every occasion.', content: '<h2>Choosing the Right Footwear</h2><p>Your shoes say a lot about you.</p>', tags: 'shoes,footwear,running,formal,casual', image: 'https://picsum.photos/seed/blog-shoes/800/400' },
    { title: 'Skincare & Beauty Essentials for Glowing Skin', category: 'Beauty', excerpt: 'Build your perfect skincare routine with our expert recommended products.', content: '<h2>Building Your Skincare Routine</h2><p>Great skin starts with consistency.</p>', tags: 'beauty,skincare,cosmetics,routine', image: 'https://picsum.photos/seed/blog-beauty/800/400' },
  ];

  for (const b of blogs) {
    const slug = slugify(b.title, { lower: true, strict: true });
    await prisma.blog.upsert({
      where: { slug },
      create: {
        title: b.title,
        slug,
        excerpt: b.excerpt,
        content: b.content,
        categoryId: blogCatMap[b.category],
        tags: b.tags,
        image: b.image,
        isPublished: true,
      },
      update: { image: b.image },
    });
  }

  // ─── COUPONS ─────────────────────────────────────────────────
  const coupons = [
    { code: 'WELCOME10', description: '10% off for new customers', type: 'PERCENTAGE', value: 10, minOrder: 20, expiresAt: new Date('2025-12-31') },
    { code: 'SAVE20', description: '$20 off orders over $100', type: 'FIXED', value: 20, minOrder: 100, expiresAt: new Date('2025-12-31') },
    { code: 'FLASH50', description: '50% off flash sale items', type: 'PERCENTAGE', value: 50, minOrder: 30, maxDiscount: 25, expiresAt: new Date('2025-06-30') },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      create: { ...c, isActive: true },
      update: {},
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@hivenest.com | 🔑 Password: Admin@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
