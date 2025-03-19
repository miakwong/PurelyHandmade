#!/bin/bash

# 启动服务器脚本
echo "启动Purely Handmade服务器..."

# 加载环境变量
if [ -f .env ]; then
  echo "已检测到.env文件，加载环境配置..."
  export $(grep -v '^#' .env | xargs)
  echo "端口: $SERVER_PORT"
  echo "环境: $NODE_ENV"
else
  echo "警告: 未检测到.env文件，将使用默认配置"
fi

# 启动服务器
echo "正在启动服务器..."
node src/server/server.js 