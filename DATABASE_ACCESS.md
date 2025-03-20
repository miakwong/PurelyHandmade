# AWS RDS 数据库连接指南

本文档提供连接到项目AWS RDS MySQL数据库的详细说明。

## 数据库连接信息

```
主机: purely-handmade-db.c1kocokq2ycj.ca-central-1.rds.amazonaws.com
端口: 3306
用户名: admin
密码: 15879512
数据库名: purely_handmade
```

## 连接方法

### 1. 使用MySQL命令行

```bash
mysql -h purely-handmade-db.c1kocokq2ycj.ca-central-1.rds.amazonaws.com -u admin -p
# 在提示时输入密码
```

连接后，选择数据库：

```sql
USE purely_handmade;
```

### 2. 使用图形化数据库工具

推荐以下工具：

- **MySQL Workbench** (官方工具，跨平台)
- **TablePlus** (Mac/Windows/Linux)
- **Sequel Pro** (Mac)
- **HeidiSQL** (Windows)
- **DBeaver** (跨平台)

连接参数同上方数据库连接信息。

### 3. 在开发环境中连接

在项目根目录的`.env`文件中添加：

```
DATABASE_URL="mysql://admin:15879512@purely-handmade-db.c1kocokq2ycj.ca-central-1.rds.amazonaws.com:3306/purely_handmade"
```

## 常见问题

### 无法连接到数据库

如果无法连接到数据库，请检查：

1. **网络访问权限**：确认您的IP地址已添加到RDS安全组
2. **VPC设置**：确认RDS实例配置为可公开访问
3. **凭据错误**：检查用户名和密码是否正确

如果仍有问题，请联系系统管理员修改RDS安全组设置，允许您的IP访问3306端口。

### 连接命令示例

以下是使用不同工具连接的示例：

#### 使用MySQL Workbench
1. 点击"+"创建新连接
2. 连接名称：PurelyHandmade
3. 连接方法：Standard (TCP/IP)
4. 填写主机名、用户名、端口
5. 点击"测试连接"验证
6. 保存并连接

#### 使用Node.js应用测试连接
```javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'purely-handmade-db.c1kocokq2ycj.ca-central-1.rds.amazonaws.com',
      user: 'admin',
      password: '15879512',
      database: 'purely_handmade'
    });
    console.log('成功连接到数据库!');
    await connection.end();
  } catch (error) {
    console.error('连接失败:', error);
  }
}

testConnection();
```

## 安全注意事项

- 请勿在公共场合分享数据库凭据
- 不要将包含凭据的文件提交到公共代码仓库
- 考虑为不同环境使用不同的数据库用户
- 定期更改数据库密码提高安全性

## 部署信息

应用部署在AWS EC2上，公共IP地址：15.223.49.244
可通过 http://15.223.49.244 访问 