# Purely Handmade

这是一个使用PHP作为后端的Web应用程序项目，采用前后端分离的结构。

## 项目结构

```
PurelyHandmade/
├── .htaccess             # Apache配置文件，URL重写规则
└── src/                  # 源代码目录
    ├── server/           # 后端代码
    │   ├── index.php     # 后端入口文件
    │   └── controllers/  # 控制器目录
    │       ├── AuthController.php        # 认证控制器
    │       ├── ProfileController.php     # 个人资料控制器
    │       ├── AdminController.php       # 管理工具控制器
    │       └── Database.php              # 数据库工具类
    └── client/           # 前端代码
        ├── html/         # HTML页面
        │   ├── index.html               # 网站首页
        │   ├── admin-tools.html         # 管理工具页面
        │   └── 404.html                 # 404错误页面
        ├── js/           # JavaScript代码
        │   ├── test-login.js            # 登录测试脚本
        │   ├── test-profile.js          # 用户资料测试脚本
        │   └── ...                      # 其他JS文件
        ├── css/          # CSS样式
        ├── img/          # 图片资源
        └── views/        # 视图模板
```

## 安装与配置

### 系统要求

- PHP 7.4+
- MySQL 5.7+
- Apache Web服务器（带mod_rewrite模块）

### 设置步骤

1. 克隆或下载本仓库到你的Web服务器目录

2. 创建MySQL数据库
```sql
CREATE DATABASE purely_handmade;
```

3. 配置数据库连接
   编辑 `src/server/controllers/Database.php` 文件，设置你的数据库连接参数：
```php
private $host = 'localhost';      // 数据库主机
private $db_name = 'purely_handmade'; // 数据库名称
private $username = 'root';       // 数据库用户名
private $password = '';           // 数据库密码
```

4. 设置Apache URL重写
   确保Apache的mod_rewrite模块已启用，并且在你的Apache配置中允许.htaccess覆盖：
```apache
<Directory "/path/to/PurelyHandmade">
    AllowOverride All
</Directory>
```

5. 设置文件权限
```bash
chmod -R 755 .
chmod -R 777 src/client/uploads  # 如果存在上传目录
```

### 访问应用程序

设置完成后，通过Web浏览器访问应用程序：

- 首页：http://你的域名/ 或 http://localhost/
- 管理工具：http://你的域名/admin-tools.html 或 http://localhost/admin-tools.html

## 开发

### 前后端分离的结构

本项目采用了前后端分离的结构，但仍然在同一个代码库中：

- **后端代码** (`src/server/`): 包含所有PHP处理逻辑，负责数据处理、业务逻辑和API响应
- **前端代码** (`src/client/`): 包含所有JavaScript、CSS、HTML和图片等前端资源，负责用户界面和交互

### 添加新的控制器

1. 在 `src/server/controllers/` 目录中创建一个新的PHP类文件
2. 在 `src/server/index.php` 中添加相应的路由规则

### 添加新的前端页面

1. 在 `src/client/html/` 目录中创建新的HTML文件
2. 如果需要，在 `src/server/index.php` 中的 `$html_pages` 数组中添加新的路径映射

### 测试

项目包含测试脚本，用于测试登录功能和用户资料页面：

- src/client/js/test-login.js：用于测试登录功能
- src/client/js/test-profile.js：用于测试用户资料功能

## 许可证

[MIT许可证](LICENSE) 