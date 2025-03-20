/**
 * 数据库种子脚本
 * 用于初始化数据库中的测试数据
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');
  
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@purelyhandmade.com' },
    update: {},
    create: {
      email: 'admin@purelyhandmade.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: 'admin',
      isAdmin: true,
      status: 'active'
    }
  });
  
  console.log('管理员用户创建成功:', admin.email);
  
  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@purelyhandmade.com' },
    update: {},
    create: {
      email: 'user@purelyhandmade.com',
      password: userPassword,
      firstName: 'Normal',
      lastName: 'User',
      username: 'user',
      role: 'user',
      isAdmin: false,
      status: 'active'
    }
  });
  
  console.log('普通用户创建成功:', user.email);
  
  // 创建类别
  const categories = [
    { name: '陶瓷', slug: 'pottery', description: '手工陶瓷和陶艺作品' },
    { name: '编织', slug: 'woven', description: '手工编织的产品和饰品' },
    { name: '木工', slug: 'woodwork', description: '手工木制品和家具' },
    { name: '首饰', slug: 'jewelry', description: '手工制作的首饰' }
  ];
  
  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        featured: Math.random() > 0.5
      }
    });
    console.log(`类别创建成功: ${result.name}`);
  }
  
  // 创建设计师
  const designers = [
    { name: '张艺', slug: 'zhang-yi', bio: '专注于传统陶瓷艺术的设计师' },
    { name: '李明', slug: 'li-ming', bio: '新锐木工艺术家' },
    { name: '王华', slug: 'wang-hua', bio: '多年编织工艺经验的工匠' }
  ];
  
  for (const designer of designers) {
    const result = await prisma.designer.upsert({
      where: { slug: designer.slug },
      update: {},
      create: {
        name: designer.name,
        slug: designer.slug,
        bio: designer.bio,
        featured: Math.random() > 0.5
      }
    });
    console.log(`设计师创建成功: ${result.name}`);
  }
  
  // 获取创建的类别和设计师
  const categoryPottery = await prisma.category.findUnique({ where: { slug: 'pottery' } });
  const categoryWoven = await prisma.category.findUnique({ where: { slug: 'woven' } });
  const categoryWoodwork = await prisma.category.findUnique({ where: { slug: 'woodwork' } });
  const categoryJewelry = await prisma.category.findUnique({ where: { slug: 'jewelry' } });
  
  const designerZhang = await prisma.designer.findUnique({ where: { slug: 'zhang-yi' } });
  const designerLi = await prisma.designer.findUnique({ where: { slug: 'li-ming' } });
  const designerWang = await prisma.designer.findUnique({ where: { slug: 'wang-hua' } });
  
  // 创建产品
  const products = [
    {
      name: '手工陶瓷花瓶',
      slug: 'handmade-ceramic-vase',
      sku: 'P001',
      price: 299.00,
      stock: 15,
      description: '精美手工陶瓷花瓶，采用传统工艺烧制而成，每件都独一无二。',
      categoryId: categoryPottery.id,
      designerId: designerZhang.id,
      featured: true,
      active: true
    },
    {
      name: '手工编织篮子',
      slug: 'handwoven-basket',
      sku: 'P002',
      price: 199.00,
      stock: 20,
      description: '由天然材料手工编织而成的实用篮子，可用于储物或装饰。',
      categoryId: categoryWoven.id,
      designerId: designerWang.id,
      featured: true,
      active: true
    },
    {
      name: '手工木制餐盘',
      slug: 'wooden-serving-plate',
      sku: 'P003',
      price: 249.00,
      stock: 10,
      description: '精心打磨的木制餐盘，采用优质硬木制作，自然纹理美观。',
      categoryId: categoryWoodwork.id,
      designerId: designerLi.id,
      featured: false,
      active: true
    },
    {
      name: '手工银饰项链',
      slug: 'handcrafted-silver-necklace',
      sku: 'P004',
      price: 399.00,
      stock: 8,
      description: '精致手工制作的纯银项链，设计简约而优雅。',
      categoryId: categoryJewelry.id,
      designerId: designerZhang.id,
      featured: true,
      active: true
    },
    {
      name: '手工陶瓷茶杯套装',
      slug: 'ceramic-tea-cup-set',
      sku: 'P005',
      price: 349.00,
      stock: 12,
      description: '四件套手工陶瓷茶杯，每个都有独特的釉色和纹理。',
      categoryId: categoryPottery.id,
      designerId: designerZhang.id,
      featured: false,
      active: true
    },
    {
      name: '手工木制首饰盒',
      slug: 'wooden-jewelry-box',
      sku: 'P006',
      price: 279.00,
      stock: 15,
      description: '精美木制首饰盒，内部设计合理，细节处理精致。',
      categoryId: categoryWoodwork.id,
      designerId: designerLi.id,
      featured: true,
      active: true
    }
  ];
  
  for (const product of products) {
    const result = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    });
    console.log(`产品创建成功: ${result.name}`);
  }
  
  // 创建评论
  const allProducts = await prisma.product.findMany();
  
  const reviews = [
    {
      userId: user.id,
      productId: allProducts[0].id,
      rating: 5,
      title: '非常满意的购买',
      content: '质量非常好，做工精细，完全符合我的期望。',
      status: 'approved'
    },
    {
      userId: user.id,
      productId: allProducts[1].id,
      rating: 4,
      title: '很不错的产品',
      content: '材质很好，做工也不错，但是有一点小瑕疵。',
      status: 'approved'
    },
    {
      userId: user.id,
      productId: allProducts[2].id,
      rating: 5,
      title: '超出预期',
      content: '非常喜欢这个产品，做工精美，设计独特，值得推荐！',
      status: 'approved'
    }
  ];
  
  for (const review of reviews) {
    const result = await prisma.review.create({
      data: review
    });
    console.log(`评论创建成功: ID=${result.id}`);
  }
  
  // 创建订单数据
  console.log('开始创建订单数据...');
  
  // 使用之前获取的产品列表，不需要重新查询
  // const allProducts = await prisma.product.findMany();
  
  // 创建订单
  const orderData = [
    {
      userId: user.id,
      orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
      status: 'delivered',
      totalAmount: 548.00,
      shippingInfo: {
        fullName: 'Normal User',
        streetAddress: '123 Main St',
        city: '北京',
        state: '北京',
        zipCode: '100000',
        country: '中国',
        phone: '13800138000'
      },
      paymentInfo: {
        method: 'creditCard',
        cardLast4: '1234',
        paid: true,
        paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      notes: '请小心包装，谢谢！',
      orderItems: {
        create: [
          {
            productId: allProducts[0].id,
            quantity: 1,
            price: allProducts[0].price
          },
          {
            productId: allProducts[1].id,
            quantity: 1,
            price: allProducts[1].price
          }
        ]
      }
    },
    {
      userId: user.id,
      orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
      status: 'shipped',
      totalAmount: 399.00,
      shippingInfo: {
        fullName: 'Normal User',
        streetAddress: '123 Main St',
        city: '北京',
        state: '北京',
        zipCode: '100000',
        country: '中国',
        phone: '13800138000'
      },
      paymentInfo: {
        method: 'alipay',
        paid: true,
        paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      orderItems: {
        create: [
          {
            productId: allProducts[3].id,
            quantity: 1,
            price: allProducts[3].price
          }
        ]
      }
    },
    {
      userId: user.id,
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
      status: 'processing',
      totalAmount: 628.00,
      shippingInfo: {
        fullName: 'Normal User',
        streetAddress: '123 Main St',
        city: '北京',
        state: '北京',
        zipCode: '100000',
        country: '中国',
        phone: '13800138000'
      },
      paymentInfo: {
        method: 'wechatPay',
        paid: true,
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      orderItems: {
        create: [
          {
            productId: allProducts[5].id,
            quantity: 1,
            price: allProducts[5].price
          },
          {
            productId: allProducts[4].id,
            quantity: 1,
            price: allProducts[4].price
          }
        ]
      }
    },
    {
      userId: user.id,
      orderDate: new Date(), // 今天
      status: 'pending',
      totalAmount: 249.00,
      shippingInfo: {
        fullName: 'Normal User',
        streetAddress: '123 Main St',
        city: '北京',
        state: '北京',
        zipCode: '100000',
        country: '中国',
        phone: '13800138000'
      },
      paymentInfo: {
        method: 'bankTransfer',
        paid: false
      },
      orderItems: {
        create: [
          {
            productId: allProducts[2].id,
            quantity: 1,
            price: allProducts[2].price
          }
        ]
      }
    },
    {
      userId: admin.id, // 管理员用户的订单
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
      status: 'shipped',
      totalAmount: 498.00,
      shippingInfo: {
        fullName: 'Admin User',
        streetAddress: '456 Admin St',
        city: '上海',
        state: '上海',
        zipCode: '200000',
        country: '中国',
        phone: '13900139000'
      },
      paymentInfo: {
        method: 'creditCard',
        cardLast4: '5678',
        paid: true,
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      orderItems: {
        create: [
          {
            productId: allProducts[1].id,
            quantity: 1,
            price: allProducts[1].price
          },
          {
            productId: allProducts[2].id,
            quantity: 1,
            price: allProducts[2].price
          }
        ]
      }
    }
  ];

  for (const order of orderData) {
    const result = await prisma.order.create({
      data: order,
      include: {
        orderItems: true
      }
    });
    console.log(`订单创建成功: ID=${result.id}, 状态=${result.status}, 金额=${result.totalAmount}`);
  }
  
  console.log('数据库初始化完成');
}

main()
  .catch((e) => {
    console.error('初始化数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 