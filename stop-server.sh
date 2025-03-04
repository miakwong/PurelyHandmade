#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}正在检查PHP服务器进程...${NC}"

# 找到PHP服务器进程
PHP_PIDS=$(pgrep -f "php -S localhost:8000")

if [ -z "$PHP_PIDS" ]; then
  echo -e "${RED}没有运行中的PHP服务器进程${NC}"
  exit 0
else
  # 计算进程数量
  COUNT=$(echo "$PHP_PIDS" | wc -l)
  COUNT=$(echo "$COUNT" | tr -d '[:space:]')
  
  echo -e "${BLUE}找到 $COUNT 个PHP服务器进程${NC}"
  
  # 停止所有进程
  for PID in $PHP_PIDS; do
    echo -e "${BLUE}停止进程 ID: $PID${NC}"
    kill $PID
  done
  
  # 等待进程停止
  sleep 1
  
  # 检查是否还有进程存在
  if pgrep -f "php -S localhost:8000" > /dev/null; then
    echo -e "${RED}某些进程仍在运行，尝试强制终止...${NC}"
    pkill -9 -f "php -S localhost:8000"
    sleep 1
  fi
  
  # 最终检查
  if pgrep -f "php -S localhost:8000" > /dev/null; then
    echo -e "${RED}无法停止所有PHP服务器进程${NC}"
    exit 1
  else
    echo -e "${GREEN}所有PHP服务器进程已停止${NC}"
  fi
fi 