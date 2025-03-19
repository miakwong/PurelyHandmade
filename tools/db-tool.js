/**
 * Purely Handmade 数据库交互工具
 * 用于直接查询和操作数据库
 */
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  // 启用查询日志以便于调试
  log: ['query', 'error', 'warn']
});

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 格式化输出
function formatOutput(data) {
  return JSON.stringify(data, null, 2);
}

// 可用命令列表
const commands = {
  'help': '显示帮助信息',
  'exit': '退出程序',
  'users': '列出所有用户',
  'user <id>': '查看指定ID的用户',
  'products': '列出所有产品',
  'product <id>': '查看指定ID的产品',
  'categories': '列出所有类别',
  'category <id>': '查看指定ID的类别',
  'designers': '列出所有设计师',
  'designer <id>': '查看指定ID的设计师',
  'orders': '列出所有订单',
  'order <id>': '查看指定ID的订单',
  'reviews': '列出所有评论',
  'create user <email> <password>': '创建新用户',
  'update user <id> <field> <value>': '更新用户字段',
  'delete user <id>': '删除用户',
  'stats': '显示数据库统计信息'
};

// 显示帮助信息
function showHelp() {
  console.log('\n=== Purely Handmade 数据库交互工具 ===');
  console.log('可用命令:');
  for (const [cmd, desc] of Object.entries(commands)) {
    console.log(`  ${cmd.padEnd(30)} - ${desc}`);
  }
  console.log('\n输入命令或 "help" 查看帮助');
}

// 显示数据库统计信息
async function showStats() {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const designerCount = await prisma.designer.count();
    const orderCount = await prisma.order.count();
    const reviewCount = await prisma.review.count();
    
    console.log('\n=== 数据库统计信息 ===');
    console.log(`用户: ${userCount}`);
    console.log(`产品: ${productCount}`);
    console.log(`类别: ${categoryCount}`);
    console.log(`设计师: ${designerCount}`);
    console.log(`订单: ${orderCount}`);
    console.log(`评论: ${reviewCount}`);
  } catch (error) {
    console.error('获取统计信息出错:', error);
  }
}

// 处理用户命令
async function processCommand(input) {
  const args = input.trim().split(' ');
  const command = args[0].toLowerCase();
  
  try {
    switch (command) {
      case 'help':
        showHelp();
        break;
        
      case 'exit':
        console.log('再见!');
        await prisma.$disconnect();
        rl.close();
        process.exit(0);
        break;
        
      case 'users':
        const users = await prisma.user.findMany({
          select: { id: true, email: true, username: true, firstName: true, lastName: true, role: true, isAdmin: true }
        });
        console.log('\n=== 用户列表 ===');
        users.forEach(user => {
          console.log(`ID: ${user.id}, 邮箱: ${user.email}, 用户名: ${user.username || 'N/A'}, 姓名: ${user.firstName || ''} ${user.lastName || ''}, 管理员: ${user.isAdmin ? '是' : '否'}`);
        });
        break;
        
      case 'user':
        if (!args[1]) {
          console.log('错误: 请提供用户ID');
          break;
        }
        const user = await prisma.user.findUnique({
          where: { id: parseInt(args[1]) },
          include: { orders: true }
        });
        if (user) {
          // 不显示密码
          const { password, ...userWithoutPassword } = user;
          console.log('\n=== 用户详情 ===');
          console.log(formatOutput(userWithoutPassword));
        } else {
          console.log(`未找到ID为 ${args[1]} 的用户`);
        }
        break;
        
      case 'products':
        const products = await prisma.product.findMany({
          select: { id: true, name: true, price: true, stock: true, category: { select: { name: true } } }
        });
        console.log('\n=== 产品列表 ===');
        products.forEach(product => {
          console.log(`ID: ${product.id}, 名称: ${product.name}, 价格: ¥${product.price}, 库存: ${product.stock}, 类别: ${product.category?.name || 'N/A'}`);
        });
        break;
        
      case 'product':
        if (!args[1]) {
          console.log('错误: 请提供产品ID');
          break;
        }
        const product = await prisma.product.findUnique({
          where: { id: parseInt(args[1]) },
          include: { 
            category: true,
            designer: true,
            reviews: { include: { user: true } }
          }
        });
        if (product) {
          console.log('\n=== 产品详情 ===');
          console.log(formatOutput(product));
        } else {
          console.log(`未找到ID为 ${args[1]} 的产品`);
        }
        break;
        
      case 'categories':
        const categories = await prisma.category.findMany();
        console.log('\n=== 类别列表 ===');
        categories.forEach(category => {
          console.log(`ID: ${category.id}, 名称: ${category.name}, Slug: ${category.slug}`);
        });
        break;
        
      case 'category':
        if (!args[1]) {
          console.log('错误: 请提供类别ID');
          break;
        }
        const category = await prisma.category.findUnique({
          where: { id: parseInt(args[1]) },
          include: { products: true }
        });
        if (category) {
          console.log('\n=== 类别详情 ===');
          console.log(formatOutput(category));
        } else {
          console.log(`未找到ID为 ${args[1]} 的类别`);
        }
        break;
        
      case 'designers':
        const designers = await prisma.designer.findMany();
        console.log('\n=== 设计师列表 ===');
        designers.forEach(designer => {
          console.log(`ID: ${designer.id}, 名称: ${designer.name}, Slug: ${designer.slug}`);
        });
        break;
        
      case 'designer':
        if (!args[1]) {
          console.log('错误: 请提供设计师ID');
          break;
        }
        const designer = await prisma.designer.findUnique({
          where: { id: parseInt(args[1]) },
          include: { products: true }
        });
        if (designer) {
          console.log('\n=== 设计师详情 ===');
          console.log(formatOutput(designer));
        } else {
          console.log(`未找到ID为 ${args[1]} 的设计师`);
        }
        break;
        
      case 'orders':
        const orders = await prisma.order.findMany({
          include: {
            user: { select: { email: true, username: true } },
            _count: { select: { orderItems: true } }
          }
        });
        console.log('\n=== 订单列表 ===');
        orders.forEach(order => {
          console.log(`ID: ${order.id}, 用户: ${order.user.email}, 金额: ¥${order.totalAmount}, 状态: ${order.status}, 商品数: ${order._count.orderItems}`);
        });
        break;
        
      case 'order':
        if (!args[1]) {
          console.log('错误: 请提供订单ID');
          break;
        }
        const order = await prisma.order.findUnique({
          where: { id: parseInt(args[1]) },
          include: { 
            user: true,
            orderItems: { 
              include: { product: true } 
            }
          }
        });
        if (order) {
          console.log('\n=== 订单详情 ===');
          console.log(formatOutput(order));
        } else {
          console.log(`未找到ID为 ${args[1]} 的订单`);
        }
        break;
        
      case 'reviews':
        const reviews = await prisma.review.findMany({
          include: {
            user: { select: { email: true, username: true } },
            product: { select: { name: true } }
          }
        });
        console.log('\n=== 评论列表 ===');
        reviews.forEach(review => {
          console.log(`ID: ${review.id}, 用户: ${review.user.email}, 产品: ${review.product.name}, 评分: ${review.rating}, 状态: ${review.status}`);
        });
        break;
        
      case 'create':
        if (args[1] === 'user' && args[2] && args[3]) {
          const email = args[2];
          const password = args[3];
          
          // 在这里应该添加密码哈希处理，这里简化处理
          const newUser = await prisma.user.create({
            data: {
              email,
              password,
              username: email.split('@')[0],
              role: 'user',
              isAdmin: false,
              status: 'active'
            }
          });
          console.log(`用户创建成功，ID: ${newUser.id}`);
        } else {
          console.log('错误: 无效的创建命令，请使用 "create user <email> <password>"');
        }
        break;
        
      case 'update':
        if (args[1] === 'user' && args[2] && args[3] && args[4]) {
          const userId = parseInt(args[2]);
          const field = args[3];
          const value = args[4];
          
          // 构建更新数据
          const updateData = {};
          
          // 特殊处理布尔值和数字
          if (value === 'true') updateData[field] = true;
          else if (value === 'false') updateData[field] = false;
          else if (!isNaN(value) && field !== 'email' && field !== 'password') updateData[field] = parseInt(value);
          else updateData[field] = value;
          
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
          });
          console.log(`用户 ${userId} 已更新，字段: ${field}, 新值: ${value}`);
        } else {
          console.log('错误: 无效的更新命令，请使用 "update user <id> <field> <value>"');
        }
        break;
        
      case 'delete':
        if (args[1] === 'user' && args[2]) {
          const userId = parseInt(args[2]);
          
          // 在生产环境中应该添加确认
          console.log(`警告: 即将删除ID为 ${userId} 的用户及其所有相关数据!`);
          rl.question('确认删除? (y/N): ', async answer => {
            if (answer.toLowerCase() === 'y') {
              try {
                await prisma.user.delete({
                  where: { id: userId }
                });
                console.log(`用户 ${userId} 已删除`);
              } catch (error) {
                console.error(`删除失败: ${error.message}`);
              }
            } else {
              console.log('删除已取消');
            }
            promptUser();
          });
          return; // 防止下面的promptUser()被调用
        } else {
          console.log('错误: 无效的删除命令，请使用 "delete user <id>"');
        }
        break;
        
      case 'stats':
        await showStats();
        break;
        
      default:
        console.log(`未知命令: ${command}`);
        console.log('输入 "help" 查看可用命令');
    }
  } catch (error) {
    console.error('执行命令出错:', error);
  }
  
  promptUser();
}

// 提示用户输入命令
function promptUser() {
  rl.question('\n> ', async (input) => {
    await processCommand(input);
  });
}

// 启动工具
async function main() {
  console.log('=== Purely Handmade 数据库交互工具 ===');
  console.log('连接到数据库...');
  
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('成功连接到数据库!');
    
    // 显示数据库统计
    await showStats();
    
    console.log('\n输入命令或 "help" 查看帮助, "exit" 退出');
    promptUser();
  } catch (error) {
    console.error('连接数据库失败:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 处理程序终止
process.on('SIGINT', async () => {
  console.log('\n正在断开数据库连接...');
  await prisma.$disconnect();
  process.exit(0);
});

// 运行主程序
main(); 