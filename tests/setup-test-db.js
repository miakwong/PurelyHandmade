/**
 * 测试数据库初始化脚本
 */
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://root:15879512@localhost:3306/purely_handmade_test';

async function setupTestDatabase() {
  console.log('开始设置测试数据库...');
  
  try {
    // 在MySQL中创建测试数据库
    execSync('mysql -u root -p15879512 -e "CREATE DATABASE IF NOT EXISTS purely_handmade_test;"');
    console.log('测试数据库创建成功');
    
    // 使用Prisma将数据模型推送到测试数据库
    execSync('npx prisma db push --schema ./prisma/schema.prisma --accept-data-loss');
    console.log('数据模型已应用到测试数据库');
    
    // 初始化Prisma客户端
    const prisma = new PrismaClient();
    
    // 清空测试数据库中的所有表
    console.log('清空测试数据库中的所有表...');
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.designer.deleteMany({});
    await prisma.user.deleteMany({});
    
    // 断开Prisma连接
    await prisma.$disconnect();
    
    console.log('测试数据库设置完成');
  } catch (error) {
    console.error('设置测试数据库时出错:', error);
    process.exit(1);
  }
}

setupTestDatabase(); 