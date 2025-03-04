#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "开始测试静态资源文件..."
echo ""

# 测试函数
test_asset() {
    local url="http://localhost:8000$1"
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" == "200" ]; then
        echo -e "${GREEN}✓${NC} $1 - HTTP $status"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - HTTP $status"
        return 1
    fi
}

# 测试主要JavaScript文件
echo "测试JavaScript文件:"
test_asset "/src/client/js/init-data.js"
test_asset "/src/client/js/no-alerts.js"
test_asset "/src/client/js/test-login.js"
test_asset "/src/client/js/test-profile.js"
test_asset "/src/client/js/product.js"
test_asset "/src/client/js/product_detail.js"
test_asset "/src/client/js/admin.js"
test_asset "/src/client/js/navbar-handler.js"

# 测试CSS文件
echo -e "\n测试CSS文件:"
test_asset "/src/client/css/style.css"
test_asset "/src/client/css/index.css"
test_asset "/src/client/css/navbar.css"
test_asset "/src/client/css/global.css"

echo ""
echo "静态资源测试完成！" 