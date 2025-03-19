/**
 * Prisma数据库访问层 
 * 用于与MySQL数据库交互的Prisma客户端实例
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 数据库服务对象，提供各种数据访问方法
const DatabaseService = {
  // 用户相关方法
  users: {
    // 获取所有用户
    getAll: async () => {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 通过ID获取用户
    getById: async (id) => {
      return await prisma.user.findUnique({
        where: { id: Number(id) }
      });
    },
    
    // 通过邮箱获取用户
    getByEmail: async (email) => {
      return await prisma.user.findUnique({
        where: { email }
      });
    },
    
    // 创建用户
    create: async (userData) => {
      return await prisma.user.create({
        data: userData
      });
    },
    
    // 更新用户
    update: async (id, userData) => {
      return await prisma.user.update({
        where: { id: Number(id) },
        data: userData
      });
    },
    
    // 删除用户
    delete: async (id) => {
      return await prisma.user.delete({
        where: { id: Number(id) }
      });
    }
  },
  
  // 产品相关方法
  products: {
    // 获取所有产品
    getAll: async () => {
      return await prisma.product.findMany({
        include: {
          category: true,
          designer: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 通过ID获取产品
    getById: async (id) => {
      return await prisma.product.findUnique({
        where: { id: Number(id) },
        include: {
          category: true,
          designer: true,
          reviews: {
            include: {
              user: true
            }
          }
        }
      });
    },
    
    // 获取特色产品
    getFeatured: async () => {
      return await prisma.product.findMany({
        where: { 
          featured: true,
          active: true
        },
        include: {
          category: true,
          designer: true
        }
      });
    },
    
    // 创建产品
    create: async (productData) => {
      return await prisma.product.create({
        data: productData
      });
    },
    
    // 更新产品
    update: async (id, productData) => {
      return await prisma.product.update({
        where: { id: Number(id) },
        data: productData
      });
    },
    
    // 删除产品
    delete: async (id) => {
      return await prisma.product.delete({
        where: { id: Number(id) }
      });
    }
  },
  
  // 类别相关方法
  categories: {
    // 获取所有类别
    getAll: async () => {
      return await prisma.category.findMany({
        include: {
          products: true
        }
      });
    },
    
    // 通过ID获取类别
    getById: async (id) => {
      return await prisma.category.findUnique({
        where: { id: Number(id) },
        include: {
          products: true
        }
      });
    },
    
    // 创建类别
    create: async (categoryData) => {
      return await prisma.category.create({
        data: categoryData
      });
    },
    
    // 更新类别
    update: async (id, categoryData) => {
      return await prisma.category.update({
        where: { id: Number(id) },
        data: categoryData
      });
    },
    
    // 删除类别
    delete: async (id) => {
      return await prisma.category.delete({
        where: { id: Number(id) }
      });
    }
  },
  
  // 设计师相关方法
  designers: {
    // 获取所有设计师
    getAll: async () => {
      return await prisma.designer.findMany({
        include: {
          products: true
        }
      });
    },
    
    // 通过ID获取设计师
    getById: async (id) => {
      return await prisma.designer.findUnique({
        where: { id: Number(id) },
        include: {
          products: true
        }
      });
    },
    
    // 创建设计师
    create: async (designerData) => {
      return await prisma.designer.create({
        data: designerData
      });
    },
    
    // 更新设计师
    update: async (id, designerData) => {
      return await prisma.designer.update({
        where: { id: Number(id) },
        data: designerData
      });
    },
    
    // 删除设计师
    delete: async (id) => {
      return await prisma.designer.delete({
        where: { id: Number(id) }
      });
    }
  },
  
  // 订单相关方法
  orders: {
    // 获取所有订单
    getAll: async () => {
      return await prisma.order.findMany({
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 通过ID获取订单
    getById: async (id) => {
      return await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
    },
    
    // 获取用户订单
    getByUserId: async (userId) => {
      return await prisma.order.findMany({
        where: { userId: Number(userId) },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 创建订单
    create: async (orderData) => {
      // 使用事务创建订单和订单项
      return await prisma.$transaction(async (tx) => {
        // 创建订单
        const order = await tx.order.create({
          data: {
            userId: orderData.userId,
            status: orderData.status || 'pending',
            totalAmount: orderData.totalAmount,
            shippingInfo: orderData.shippingInfo,
            paymentInfo: orderData.paymentInfo,
            notes: orderData.notes
          }
        });
        
        // 为每个订单项创建记录
        for (const item of orderData.items) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }
          });
          
          // 更新产品库存
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
        
        return order;
      });
    },
    
    // 更新订单状态
    updateStatus: async (id, status) => {
      return await prisma.order.update({
        where: { id: Number(id) },
        data: { status }
      });
    }
  },
  
  // 评论相关方法
  reviews: {
    // 获取所有评论
    getAll: async () => {
      return await prisma.review.findMany({
        include: {
          user: true,
          product: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 获取产品评论
    getByProductId: async (productId) => {
      return await prisma.review.findMany({
        where: { 
          productId: Number(productId),
          status: 'approved'
        },
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    
    // 创建评论
    create: async (reviewData) => {
      return await prisma.review.create({
        data: reviewData
      });
    },
    
    // 更新评论状态
    updateStatus: async (id, status) => {
      return await prisma.review.update({
        where: { id: Number(id) },
        data: { status }
      });
    },
    
    // 删除评论
    delete: async (id) => {
      return await prisma.review.delete({
        where: { id: Number(id) }
      });
    }
  }
};

module.exports = DatabaseService; 