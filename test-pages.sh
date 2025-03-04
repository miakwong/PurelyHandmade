#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "开始测试所有页面..."
echo ""

# 测试函数
test_page() {
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

# 主页和管理工具页
test_page "/src/client/html/index.html"
test_page "/src/client/html/admin-tools.html"
test_page "/src/client/html/404.html"

# Views 根目录下的页面
test_page "/src/client/views/about.html"
test_page "/src/client/views/new-arrivals.html"
test_page "/src/client/views/on-sale.html"
test_page "/src/client/views/our-story.html"

# Auth 页面
test_page "/src/client/views/auth/login.html"
test_page "/src/client/views/auth/register.html"
test_page "/src/client/views/auth/profile.html"

# 产品页面
test_page "/src/client/views/product/product-list.html"
test_page "/src/client/views/product/product_detail.html"
test_page "/src/client/views/product/category-list.html"
test_page "/src/client/views/product/category-page.html"

# 结账页面
test_page "/src/client/views/checkout/cart.html"
test_page "/src/client/views/checkout/checkout.html"
test_page "/src/client/views/checkout/order_confirm.html"

# 设计师页面
test_page "/src/client/views/designer/designer-page.html"
test_page "/src/client/views/designer/designers.html"

# 管理员页面
test_page "/src/client/views/admin/comment.html"
test_page "/src/client/views/admin/order_management.html"

echo ""
echo "页面测试完成！" 