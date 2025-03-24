# 数据库初始化工具

这个目录包含 PurelyHandmade 系统的数据库初始化工具。详细的使用说明请参考 [DB_README.md](./DB_README.md) 文件。

## 目录内容

- `init_database.php` - 数据库初始化核心脚本
- `init_db.php` - 用户友好的命令行界面
- `database_content.md` - 完整的数据库内容文档
- `.env.example` - 环境变量示例文件
- `DB_README.md` - 详细使用文档

## 快速使用指南

1. 确保根目录有正确配置的 `.env` 文件
2. 运行初始化脚本:

```bash
cd src/server/db
php init_db.php
```

初始化脚本会创建并填充数据库表，包括用户、产品、类别、设计师、订单和评论等必要数据。

## 注意事项

- 此工具会清空现有数据库内容，请谨慎使用
- 在生产环境使用前先进行备份
- 默认提供测试账户:
  - 管理员: admin@purelyhandmade.com
  - 普通用户: user@purelyhandmade.com 