# PurelyHandmade 数据库初始化工具

这个工具包用于初始化 PurelyHandmade 系统的数据库，包括创建表结构和填充初始数据。

## 文件说明

- `database_content.md` - 数据库内容文档，包含所有表结构和数据
- `init_database.php` - 核心数据库初始化脚本
- `init_db.php` - 用户友好的命令行界面
- `init_database.sql` - 完整的 SQL 脚本，可直接在数据库中执行

## 使用方法

### 前提条件

1. 确保已安装 PHP (7.4+) 和 MySQL/MariaDB
2. 确保项目根目录的 .env 文件中包含正确的数据库连接信息:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=你的用户名
   DB_PASSWORD=你的密码
   DB_NAME=purely_handmade
   DB_SOCKET=/opt/homebrew/var/mysql/mysql.sock (可选，根据系统调整)
   ```

### 初始化数据库

有三种方式运行初始化:

1. **交互模式** - 会提示确认后再执行:
   ```bash
   cd src/server/db
   php init_db.php
   ```

2. **强制模式** - 不提示确认直接执行:
   ```bash
   cd src/server/db
   php init_db.php --force
   ```

3. **SQL 脚本方式** - 直接在数据库中执行 SQL 文件:
   ```bash
   mysql -u 用户名 -p < src/server/db/init_database.sql
   ```

### 执行过程

1. 脚本会连接到数据库
2. 如果数据库不存在，会创建数据库
3. 删除所有已存在的表(如果有)
4. 创建所有必要的表结构
5. 填充初始数据

### 表结构

系统包含以下表:

- `User` - 用户信息
- `Category` - 产品类别
- `Designer` - 设计师信息
- `Product` - 产品信息
- `Order` - 订单信息
- `OrderItem` - 订单项目
- `Review` - 产品评论
- `Settings` - 系统设置
- `Cart` - 购物车主表
- `CartItem` - 购物车项目

### 初始数据

脚本会创建以下初始数据:

- 用户账户(包括管理员和普通用户)
- 产品类别
- 设计师信息
- 产品信息
- 示例订单
- 产品评论
- 系统设置

## 注意事项

- **警告**: 运行此脚本会清空所有现有数据！请在生产环境谨慎使用。
- 建议在运行前备份现有数据库
- 如遇到权限问题，请确保数据库用户有足够权限创建/修改数据库和表 