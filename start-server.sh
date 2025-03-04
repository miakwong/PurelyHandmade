#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止已运行的PHP服务器
echo -e "${BLUE}正在检查现有服务...${NC}"
if pgrep -f "php -S localhost:8000" > /dev/null; then
  echo -e "${BLUE}停止现有PHP服务器...${NC}"
  pkill -f "php -S localhost:8000"
  sleep 1
fi

# 清除旧日志
if [ -f "php_server.log" ]; then
  rm php_server.log
fi

# 启动服务器
echo -e "${BLUE}启动PHP服务器在 http://localhost:8000...${NC}"
php -S localhost:8000 -t . > php_server.log 2>&1 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 检查服务器是否正常运行
if ps -p $SERVER_PID > /dev/null; then
  echo -e "${GREEN}服务器启动成功!${NC}"
  echo -e "${GREEN}现在可以访问：${NC}"
  echo -e "${GREEN}➤ 首页: http://localhost:8000/${NC}"
  echo -e "${GREEN}➤ 管理工具: http://localhost:8000/src/client/html/admin-tools.html${NC}"
  echo ""
  echo -e "${BLUE}服务器日志保存在 php_server.log${NC}"
  echo -e "${BLUE}服务器进程ID: $SERVER_PID${NC}"
  echo -e "${BLUE}使用 'kill $SERVER_PID' 来停止服务器${NC}"
else
  echo -e "${RED}服务器启动失败，请检查日志文件 php_server.log${NC}"
  exit 1
fi 