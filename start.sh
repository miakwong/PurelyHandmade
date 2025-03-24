#!/bin/bash

# 项目启动脚本 - PurelyHandmade

# 确保在项目根目录下执行
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${GREEN}    PurelyHandmade 启动脚本${NC}"
echo -e "${BLUE}====================================${NC}"

# 设置默认端口
PORT=8000

# 检查是否指定了端口参数
if [ "$1" != "" ]; then
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        PORT=$1
        echo -e "${YELLOW}使用指定端口: $PORT${NC}"
    else
        echo -e "${RED}无效的端口号: $1. 使用默认端口 $PORT${NC}"
    fi
fi

# 检查端口占用情况
echo -e "${BLUE}检查端口 $PORT 是否被占用...${NC}"
if lsof -i :$PORT > /dev/null; then
    echo -e "${YELLOW}端口 $PORT 已被占用${NC}"
    
    # 尝试找出占用端口的进程
    PROCESS_PID=$(lsof -t -i :$PORT)
    PROCESS_NAME=$(ps -p $PROCESS_PID -o comm=)
    
    echo -e "${YELLOW}占用端口的进程: $PROCESS_NAME (PID: $PROCESS_PID)${NC}"
    
    # 如果是php进程，尝试停止它
    if [[ "$PROCESS_NAME" == *"php"* ]]; then
        echo -e "${YELLOW}尝试停止现有PHP服务...${NC}"
        kill $PROCESS_PID
        sleep 1
        
        # 再次检查端口
        if lsof -i :$PORT > /dev/null; then
            echo -e "${RED}无法停止现有服务，请尝试使用其他端口或手动终止进程${NC}"
            echo -e "${YELLOW}您可以使用: ${GREEN}./start.sh 8001${YELLOW} 尝试其他端口${NC}"
            echo -e "${YELLOW}或者使用: ${GREEN}kill $PROCESS_PID${YELLOW} 手动终止进程${NC}"
            exit 1
        else
            echo -e "${GREEN}现有服务已停止${NC}"
        fi
    else
        echo -e "${RED}端口被非PHP进程占用，请使用其他端口${NC}"
        echo -e "${YELLOW}您可以使用: ${GREEN}./start.sh 8001${YELLOW} 尝试其他端口${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}端口 $PORT 可用${NC}"
fi

# 检查MySQL服务是否运行
echo -e "${BLUE}检查MySQL服务...${NC}"
if ! nc -z localhost 3306 >/dev/null 2>&1; then
    echo -e "${RED}警告: MySQL服务似乎未运行。数据库功能可能无法正常工作${NC}"
    echo -e "${YELLOW}请确保MySQL服务已启动${NC}"
    echo -e "${BLUE}是否继续启动项目? (y/n)${NC}"
    read -r CONTINUE
    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
        echo -e "${RED}已取消启动${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}MySQL服务正在运行${NC}"
fi

# 启动服务器
echo -e "${BLUE}启动PHP开发服务器，端口: $PORT...${NC}"
php -S localhost:$PORT -t .

# 脚本结束提示
echo -e "${RED}服务器已停止${NC}" 