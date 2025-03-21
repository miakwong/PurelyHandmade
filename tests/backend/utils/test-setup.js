/**
 * 测试设置文件
 * 确保测试环境配置正确
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.DEBUG = 'true';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRY = '24h';

// 将真实的db模块替换为我们的模拟db模块
jest.mock('../../../src/server/db', () => require('./mock-db'));

// 其他测试设置可以在此处添加 