#!/bin/bash

echo "========================================"
echo "    PurelyHandmade 服务器启动脚本       "
echo "========================================"

# 检查PHP是否安装
if ! command -v php &> /dev/null; then
    echo "错误: PHP未安装，请先安装PHP"
    exit 1
fi

# 检查MySQL是否运行
if ! command -v mysqladmin &> /dev/null; then
    echo "警告: 未找到mysqladmin命令，无法检查MySQL状态"
else
    if ! mysqladmin ping -h localhost --silent; then
        echo "错误: MySQL服务器未运行，请先启动MySQL"
        exit 1
    fi
    echo "MySQL服务器正在运行"
fi

# 确保数据库目录存在
mkdir -p src/server/database
mkdir -p src/server/logs

# 询问是否初始化数据库
read -p "是否初始化数据库? (y/n): " init_db
if [[ $init_db == "y" || $init_db == "Y" ]]; then
    echo "初始化数据库..."
    php src/server/database/init_db.php
    
    if [ $? -eq 0 ]; then
        echo "数据库初始化成功!"
    else
        echo "数据库初始化失败!"
        exit 1
    fi
fi

# 启动PHP内置服务器
echo "启动PHP开发服务器..."
echo "访问地址: http://localhost:8080"
echo "按Ctrl+C停止服务器"
echo "========================================"

php -S localhost:8080

# 如果需要Apache，取消注释以下内容
# 确保有权限写入Apache配置
# if [ -d /etc/apache2/sites-available ]; then
#     echo "配置Apache..."
#     sudo cp apache-config.conf /etc/apache2/sites-available/purelyhandmade.conf
#     sudo a2ensite purelyhandmade
#     sudo service apache2 restart
#     echo "Apache配置完成!"
# fi 