#!/bin/bash

# Project start script - PurelyHandmade

# Ensure the script is executed in the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Set color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${GREEN}    PurelyHandmade 启动脚本${NC}"
echo -e "${BLUE}====================================${NC}"

# Set default port
PORT=8000

# Check if a port parameter is specified
if [ "$1" != "" ]; then
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        PORT=$1
        echo -e "${YELLOW}使用指定端口: $PORT${NC}"
    else
        echo -e "${RED}无效的端口号: $1. 使用默认端口 $PORT${NC}"
    fi
fi

# Check port occupancy
echo -e "${BLUE}Checking if port $PORT is occupied...${NC}"
if lsof -i :$PORT > /dev/null; then
    echo -e "${YELLOW}Port $PORT is occupied${NC}"
    
    # Try to find the process occupying the port
    PROCESS_PID=$(lsof -t -i :$PORT)
    PROCESS_NAME=$(ps -p $PROCESS_PID -o comm=)
    
    echo -e "${YELLOW}Process occupying port $PORT: $PROCESS_NAME (PID: $PROCESS_PID)${NC}"
    
    # If it's a php process, try to stop it
    if [[ "$PROCESS_NAME" == *"php"* ]]; then
        echo -e "${YELLOW}Attempting to stop existing PHP service...${NC}"
        kill $PROCESS_PID
        sleep 1
        
        # Check the port again
        if lsof -i :$PORT > /dev/null; then
            echo -e "${RED}Unable to stop existing service, please try using another port or manually terminate the process${NC}"
            echo -e "${YELLOW}You can use: ${GREEN}./start.sh 8001${YELLOW} to try another port${NC}"
            echo -e "${YELLOW}or use: ${GREEN}kill $PROCESS_PID${YELLOW} to manually terminate the process${NC}"
            exit 1
        else
            echo -e "${GREEN}Existing service stopped${NC}"
        fi
    else
        echo -e "${RED}Port occupied by non-PHP process, please use another port${NC}"
        echo -e "${YELLOW}You can use: ${GREEN}./start.sh 8001${YELLOW} to try another port${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Port $PORT is available${NC}"
fi

# Check if MySQL service is running
echo -e "${BLUE}Checking MySQL service...${NC}"
if ! nc -z localhost 3306 >/dev/null 2>&1; then
    echo -e "${RED}Warning: MySQL service seems to be not running. Database functionality may not work properly${NC}"
    echo -e "${YELLOW}Please ensure MySQL service is started${NC}"
    echo -e "${BLUE}Continue to start the project? (y/n)${NC}"
    read -r CONTINUE
    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
        echo -e "${RED}Cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}MySQL service is running${NC}"
fi

# Start the server
echo -e "${BLUE}Start PHP development server, port: $PORT...${NC}"
php -S localhost:$PORT -t .

# Script end prompt
echo -e "${RED}Server stopped${NC}" 