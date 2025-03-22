# 数据库操作目录

本目录包含与数据库初始化和连接相关的文件。

## 文件说明

### init_database.sql
数据库初始化SQL脚本，用于创建所有必要的表结构和初始数据。包含：
- 用户表（users）
- 产品表（products）
- 类别表（categories）
- 设计师表（designers）
- 订单表（orders）
- 订单项表（order_items）
- 评论表（reviews）
等核心数据表的创建和初始数据插入。

### init_db.php
数据库初始化PHP脚本，用于执行SQL初始化脚本并验证数据是否正确插入。
执行方式：
```
php src/server/db/init_db.php
```

### check_db_connection.php
数据库连接测试脚本，用于验证数据库连接是否正常，并显示所有表及记录数。
执行方式：
```
php src/server/db/check_db_connection.php
```

### db_example.php
基本数据库操作示例脚本，展示如何使用Database类执行基本查询操作。
执行方式：
```
php src/server/db/db_example.php
```

### advanced_db_example.php
高级数据库操作示例脚本，展示如何使用事务进行多表操作和执行复杂查询。
执行方式：
```
php src/server/db/advanced_db_example.php
```

### check_table_structure.php
数据库表结构查看脚本，用于显示指定表的详细结构和字段信息。
执行方式：
```
php src/server/db/check_table_structure.php [表名]
```
如果不指定表名，默认显示orders表的结构。

## 使用说明

1. 首次使用时，请确保在 `src/server/config.php` 中配置了正确的数据库连接信息
2. 运行 `init_db.php` 创建数据库和初始数据
3. 如需验证数据库连接，可运行 `check_db_connection.php`
4. 查看数据库示例脚本了解如何使用Database类进行数据库操作

## 数据库设计

数据库采用MySQL，使用InnoDB引擎，支持事务处理和外键约束。主要表之间的关系如下：

- 用户（users）可以创建多个订单（orders）
- 订单（orders）包含多个订单项（order_items）
- 订单项（order_items）关联到产品（products）
- 产品（products）属于特定类别（categories）和设计师（designers）
- 用户（users）可以对产品（products）发表评论（reviews）

## 开发注意事项

- 所有数据库操作应通过 `src/server/controllers/Database.php` 类进行，避免直接使用PDO
- 所有查询应使用参数化查询，避免SQL注入风险
- 对于涉及多表操作的逻辑，应使用事务确保数据一致性 