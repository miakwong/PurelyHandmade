/**
 * Express服务器
 * 处理API请求并提供Purely Handmade的后端服务
 */
// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api');

// 从环境变量获取配置
const PORT = process.env.SERVER_PORT || 9876;
const API_PREFIX = process.env.API_PREFIX || '/api';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// 创建Express应用
const app = express();

// 打印启动信息
console.log(`环境: ${NODE_ENV}`);
console.log(`端口: ${PORT}`);
console.log(`API前缀: ${API_PREFIX}`);

// 中间件
app.use(cors({
  origin: CORS_ORIGIN
})); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 添加MIME类型
app.use((req, res, next) => {
  const url = req.url;
  if (url.endsWith('.css')) {
    res.type('text/css');
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// 专门处理CSS文件的路由 - 确保正确的MIME类型
app.get('*.css', (req, res, next) => {
  res.set('Content-Type', 'text/css');
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../../'), {
  setHeaders: (res, filePath) => {
    // 为CSS文件设置正确的MIME类型
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// API路由
app.use(API_PREFIX, apiRoutes);

// 所有其他路由重定向到前端
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/client/html/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    data: '服务器内部错误'
  });
});

// 只有在直接运行时才启动服务器
if (require.main === module) {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API可通过 http://localhost:${PORT}${API_PREFIX} 访问`);
  });
}

// 导出app对象
module.exports = app; 