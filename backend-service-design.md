# Backend service design    

## 1. 总体架构

本后端服务设计基于MVC架构模式，使用PHP作为后端语言，MySQL作为数据库系统，实现一个RESTful API服务，为前端提供数据交互接口。设计将充分利用现有的数据库结构，不做任何修改。

## 2. 数据库结构

根据现有数据库查询结果，以下是完整的数据库表结构：

### User表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| email | varchar(191) | NO | UNI | NULL | |
| username | varchar(191) | YES | UNI | NULL | |
| password | varchar(191) | NO | | NULL | |
| firstName | varchar(191) | YES | | NULL | |
| lastName | varchar(191) | YES | | NULL | |
| phone | varchar(191) | YES | | NULL | |
| address | varchar(191) | YES | | NULL | |
| birthday | datetime(3) | YES | | NULL | |
| gender | varchar(191) | YES | | NULL | |
| avatar | varchar(191) | YES | | NULL | |
| role | varchar(191) | NO | | user | |
| isAdmin | tinyint(1) | NO | | 0 | |
| status | varchar(191) | NO | | active | |
| bio | text | YES | | NULL | |
| canOrder | tinyint(1) | NO | | 1 | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |
| lastLogin | datetime(3) | YES | | NULL | |

### Product表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(191) | NO | | NULL | |
| slug | varchar(191) | NO | UNI | NULL | |
| sku | varchar(191) | NO | UNI | NULL | |
| price | double | NO | | NULL | |
| stock | int | NO | | 0 | |
| description | text | YES | | NULL | |
| image | varchar(191) | YES | | NULL | |
| gallery | json | YES | | NULL | |
| featured | tinyint(1) | NO | | 0 | |
| active | tinyint(1) | NO | | 1 | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |
| categoryId | int | YES | MUL | NULL | 外键关联Category |
| designerId | int | YES | MUL | NULL | 外键关联Designer |

### Category表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(191) | NO | | NULL | |
| slug | varchar(191) | NO | UNI | NULL | |
| description | text | YES | | NULL | |
| image | varchar(191) | YES | | NULL | |
| featured | tinyint(1) | NO | | 0 | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |

### Designer表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| name | varchar(191) | NO | | NULL | |
| slug | varchar(191) | NO | UNI | NULL | |
| bio | text | YES | | NULL | |
| image | varchar(191) | YES | | NULL | |
| featured | tinyint(1) | NO | | 0 | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |

### Review表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| userId | int | NO | MUL | NULL | 外键关联User |
| productId | int | NO | MUL | NULL | 外键关联Product |
| rating | int | NO | | NULL | |
| title | varchar(191) | YES | | NULL | |
| content | text | NO | | NULL | |
| status | varchar(191) | NO | | pending | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |

### Order表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| userId | int | NO | MUL | NULL | 外键关联User |
| orderDate | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| status | varchar(191) | NO | | pending | |
| totalAmount | double | NO | | NULL | |
| shippingInfo | json | YES | | NULL | |
| paymentInfo | json | YES | | NULL | |
| notes | text | YES | | NULL | |
| createdAt | datetime(3) | NO | | CURRENT_TIMESTAMP(3) | |
| updatedAt | datetime(3) | NO | | NULL | |

### OrderItem表
| 字段名 | 类型 | 是否为空 | 键 | 默认值 | 备注 |
|-------|------|---------|-----|-------|------|
| id | int | NO | PRI | NULL | auto_increment |
| orderId | int | NO | MUL | NULL | 外键关联Order |
| productId | int | NO | MUL | NULL | 外键关联Product |
| quantity | int | NO | | NULL | |
| price | double | NO | | NULL | |

## 3. 目录结构设计

```
src/
└── server/                    # 后端服务目录
    ├── api/                   # API端点
    │   ├── auth/              # 认证相关API
    │   │   ├── login.php      # 用户登录
    │   │   ├── logout.php     # 用户登出
    │   │   ├── register.php   # 用户注册
    │   │   └── profile.php    # 用户资料
    │   ├── products/          # 产品相关API
    │   │   ├── index.php      # 获取产品列表
    │   │   ├── detail.php     # 获取单个产品详情
    │   │   ├── create.php     # 创建产品
    │   │   └── update.php     # 更新产品
    │   ├── categories/        # 分类相关API
    │   │   ├── index.php      # 获取分类列表
    │   │   ├── detail.php     # 获取单个分类
    │   │   ├── create.php     # 创建分类
    │   │   └── update.php     # 更新分类
    │   ├── designers/         # 设计师相关API
    │   │   ├── index.php      # 获取设计师列表
    │   │   ├── detail.php     # 获取单个设计师
    │   │   ├── create.php     # 创建设计师
    │   │   └── update.php     # 更新设计师
    │   ├── reviews/           # 评论相关API
    │   │   ├── index.php      # 获取评论列表
    │   │   ├── create.php     # 创建评论
    │   │   └── update.php     # 更新评论状态
    │   ├── orders/            # 订单相关API
    │   │   ├── index.php      # 获取订单列表
    │   │   ├── detail.php     # 获取订单详情
    │   │   ├── create.php     # 创建订单
    │   │   └── update.php     # 更新订单状态
    │   └── admin/             # 管理员API
    │       ├── users.php      # 用户管理
    │       ├── dashboard.php  # 管理面板数据
    │       └── reports.php    # 报表生成
    ├── controllers/           # 业务逻辑控制器
    │   ├── AuthController.php    # 认证控制器
    │   ├── ProductController.php # 产品控制器
    │   ├── CategoryController.php # 分类控制器
    │   ├── DesignerController.php # 设计师控制器
    │   ├── ReviewController.php   # 评论控制器
    │   ├── OrderController.php    # 订单控制器
    │   └── AdminController.php    # 管理员控制器
    ├── models/                # 数据模型
    │   ├── User.php           # 用户模型
    │   ├── Product.php        # 产品模型
    │   ├── Category.php       # 分类模型
    │   ├── Designer.php       # 设计师模型
    │   ├── Review.php         # 评论模型
    │   ├── Order.php          # 订单模型
    │   └── OrderItem.php      # 订单项模型
    ├── utils/                 # 工具类
    │   ├── Database.php       # 数据库连接类
    │   ├── Request.php        # 请求处理
    │   ├── Response.php       # 响应格式化
    │   ├── Session.php        # 会话管理
    │   ├── Auth.php           # 认证工具
    │   ├── Validator.php      # 数据验证
    │   └── Logger.php         # 日志记录
    ├── middleware/            # 中间件
    │   ├── AuthMiddleware.php # 认证中间件
    │   ├── AdminMiddleware.php # 管理员中间件
    │   └── CorsMiddleware.php # CORS中间件
    ├── config/                # 配置文件
    │   ├── database.php       # 数据库配置
    │   └── app.php            # 应用配置
    ├── bootstrap.php          # 应用引导文件
    └── index.php              # API入口点
```

## 4. API设计

### 认证API

1. **用户注册 POST /api/auth/register.php**
   - 请求体: `{username, email, password, firstName, lastName, phone, address}`
   - 响应: `{success: true, user: {id, email, username, ...}}`

2. **用户登录 POST /api/auth/login.php**
   - 请求体: `{email, password}`
   - 响应: `{success: true, token: "jwt_token", user: {id, email, username, ...}}`

3. **用户资料 GET /api/auth/profile.php**
   - 头部: `Authorization: Bearer {token}`
   - 响应: `{id, email, username, firstName, lastName, ...}`

4. **更新资料 PUT /api/auth/profile.php**
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{firstName, lastName, phone, address, ...}`
   - 响应: `{success: true, user: {id, email, username, ...}}`

### 产品API

1. **获取产品列表 GET /api/products/index.php**
   - 参数: `?category=id&designer=id&featured=1&page=1&limit=10`
   - 响应: `{products: [...], total: 100, page: 1, pages: 10}`

2. **获取产品详情 GET /api/products/detail.php**
   - 参数: `?id=123` 或 `?slug=product-slug`
   - 响应: `{id, name, slug, price, stock, description, ...}`

3. **创建产品 POST /api/products/create.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{name, slug, sku, price, stock, description, image, categoryId, designerId, ...}`
   - 响应: `{success: true, product: {id, name, slug, ...}}`

4. **更新产品 PUT /api/products/update.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, name, slug, price, stock, description, ...}`
   - 响应: `{success: true, product: {id, name, slug, ...}}`

### 分类API

1. **获取分类列表 GET /api/categories/index.php**
   - 参数: `?featured=1`
   - 响应: `{categories: [...], total: 10}`

2. **获取分类详情 GET /api/categories/detail.php**
   - 参数: `?id=5` 或 `?slug=category-slug`
   - 响应: `{id, name, slug, description, image, ...}`

3. **创建分类 POST /api/categories/create.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{name, slug, description, image, featured}`
   - 响应: `{success: true, category: {id, name, slug, ...}}`

4. **更新分类 PUT /api/categories/update.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, name, slug, description, ...}`
   - 响应: `{success: true, category: {id, name, slug, ...}}`

### 设计师API

1. **获取设计师列表 GET /api/designers/index.php**
   - 参数: `?featured=1`
   - 响应: `{designers: [...], total: 10}`

2. **获取设计师详情 GET /api/designers/detail.php**
   - 参数: `?id=5` 或 `?slug=designer-slug`
   - 响应: `{id, name, slug, bio, image, ...}`

3. **创建设计师 POST /api/designers/create.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{name, slug, bio, image, featured}`
   - 响应: `{success: true, designer: {id, name, slug, ...}}`

4. **更新设计师 PUT /api/designers/update.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, name, slug, bio, ...}`
   - 响应: `{success: true, designer: {id, name, slug, ...}}`

### 评论API

1. **获取评论 GET /api/reviews/index.php**
   - 参数: `?product=id&status=approved&page=1&limit=10`
   - 响应: `{reviews: [...], total: 50, page: 1, pages: 5}`

2. **创建评论 POST /api/reviews/create.php**
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{productId, rating, title, content}`
   - 响应: `{success: true, review: {id, rating, content, ...}}`

3. **更新评论状态 PUT /api/reviews/update.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, status}`
   - 响应: `{success: true, review: {id, status, ...}}`

### 订单API

1. **获取用户订单列表 GET /api/orders/index.php**
   - 头部: `Authorization: Bearer {token}`
   - 参数: `?status=pending&page=1&limit=10`
   - 响应: `{orders: [...], total: 20, page: 1, pages: 2}`

2. **获取订单详情 GET /api/orders/detail.php**
   - 头部: `Authorization: Bearer {token}`
   - 参数: `?id=123`
   - 响应: `{id, userId, status, totalAmount, items: [...], ...}`

3. **创建订单 POST /api/orders/create.php**
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{items: [{productId, quantity}], shippingInfo: {...}, paymentInfo: {...}}`
   - 响应: `{success: true, order: {id, totalAmount, ...}}`

4. **更新订单状态 PUT /api/orders/update.php** (管理员)
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, status, notes}`
   - 响应: `{success: true, order: {id, status, ...}}`

### 管理员API

1. **获取用户列表 GET /api/admin/users.php**
   - 头部: `Authorization: Bearer {token}`
   - 参数: `?status=active&role=user&page=1&limit=20`
   - 响应: `{users: [...], total: 100, page: 1, pages: 5}`

2. **更新用户状态 PUT /api/admin/users.php**
   - 头部: `Authorization: Bearer {token}`
   - 请求体: `{id, status, role, isAdmin, canOrder}`
   - 响应: `{success: true, user: {id, status, ...}}`

3. **获取仪表盘数据 GET /api/admin/dashboard.php**
   - 头部: `Authorization: Bearer {token}`
   - 响应: `{users: {total, active}, products: {total, featured}, orders: {total, pending, completed}, revenue: {total, monthly}}`

4. **获取报表数据 GET /api/admin/reports.php**
   - 头部: `Authorization: Bearer {token}`
   - 参数: `?type=sales&period=monthly&start=2025-01-01&end=2025-12-31`
   - 响应: `{data: [...], summary: {...}}`

## 5. 控制器设计

### AuthController

```php
class AuthController {
    public function register($data) {
        // 验证输入
        // 检查邮箱是否已存在
        // 创建用户记录
        // 返回用户数据（不含密码）
    }
    
    public function login($email, $password) {
        // 验证凭据
        // 生成JWT令牌
        // 更新lastLogin
        // 返回令牌和用户数据
    }
    
    public function getProfile($userId) {
        // 获取用户资料
    }
    
    public function updateProfile($userId, $data) {
        // 更新用户资料
    }
    
    public function changePassword($userId, $currentPassword, $newPassword) {
        // 更改密码
    }
}
```

### ProductController

```php
class ProductController {
    public function getProducts($filters = [], $page = 1, $limit = 10) {
        // 获取产品列表，支持分页和筛选
    }
    
    public function getProductById($id) {
        // 通过ID获取产品
    }
    
    public function getProductBySlug($slug) {
        // 通过Slug获取产品
    }
    
    public function createProduct($data) {
        // 创建产品
    }
    
    public function updateProduct($id, $data) {
        // 更新产品
    }
    
    public function deleteProduct($id) {
        // 删除产品（设置为非活动）
    }
}
```

### CategoryController, DesignerController, ReviewController, OrderController

这些控制器将实现类似的CRUD操作，针对各自的数据模型。

### AdminController

```php
class AdminController {
    public function getUsers($filters = [], $page = 1, $limit = 20) {
        // 获取用户列表
    }
    
    public function updateUser($id, $data) {
        // 更新用户状态、角色等
    }
    
    public function getDashboardData() {
        // 获取仪表盘统计数据
    }
    
    public function getReportData($type, $period, $startDate, $endDate) {
        // 生成报表数据
    }
}
```

## 6. 数据模型

所有模型将实现基本的CRUD操作，并与数据库表一一对应。以下是User模型示例：

```php
class User {
    private $db;
    private $table = 'User';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findById($id) {
        // 通过ID查找用户
    }
    
    public function findByEmail($email) {
        // 通过邮箱查找用户
    }
    
    public function findByUsername($username) {
        // 通过用户名查找用户
    }
    
    public function create($data) {
        // 创建用户
    }
    
    public function update($id, $data) {
        // 更新用户
    }
    
    public function updateLoginTime($id) {
        // 更新最后登录时间
    }
    
    // 其他方法
}
```

其他模型（Product, Category, Designer, Review, Order, OrderItem）将遵循相同的模式，根据各自的表结构实现相应的方法。

## 7. 中间件

中间件用于拦截和处理HTTP请求，主要包括：

1. **AuthMiddleware** - 验证用户是否已登录
2. **AdminMiddleware** - 验证用户是否为管理员
3. **CorsMiddleware** - 处理跨域资源共享

## 8. 工具类

1. **Database** - 数据库连接和操作
```php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    
    public function __construct() {
        $this->host = $_ENV['DB_HOST'];
        $this->db_name = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASSWORD'];
    }
    
    public function connect() {
        // 连接数据库
    }
    
    // 其他方法
}
```

2. **Request** - 请求处理
```php
class Request {
    public function getJson() {
        // 获取JSON请求体
    }
    
    public function getQueryParams() {
        // 获取URL查询参数
    }
    
    public function getHeaders() {
        // 获取请求头
    }
}
```

3. **Response** - 响应格式化
```php
class Response {
    public function json($data, $statusCode = 200) {
        // 返回JSON响应
    }
    
    public function error($message, $statusCode = 400) {
        // 返回错误响应
    }
}
```

4. **Auth** - 认证工具
```php
class Auth {
    public function generateToken($userId) {
        // 生成JWT令牌
    }
    
    public function validateToken($token) {
        // 验证JWT令牌
    }
    
    public function getUserIdFromToken($token) {
        // 从令牌获取用户ID
    }
}
```

5. **Validator** - 数据验证
```php
class Validator {
    public function validateEmail($email) {
        // 验证邮箱格式
    }
    
    public function validatePassword($password) {
        // 验证密码强度
    }
    
    // 其他验证方法
}
```

## 9. 安全措施

1. **密码安全**
   - 使用PHP的`password_hash()`函数采用bcrypt算法加密密码
   - 密码不可逆加密存储
   - 密码强度验证

2. **用户认证**
   - 实现JWT (JSON Web Token)认证
   - 令牌过期策略
   - 安全HTTP头部设置

3. **数据验证与防注入**
   - 所有用户输入通过Validator类验证
   - 使用PDO预处理语句防止SQL注入
   - 充分过滤输入和转义输出

4. **跨站脚本防护(XSS)**
   - 实现`htmlspecialchars()`输出过滤
   - 设置`Content-Security-Policy`头

5. **跨站请求伪造(CSRF)防护**
   - 对非GET请求实施CSRF令牌验证
   - 验证`Origin`和`Referer`头

6. **错误处理**
   - 自定义错误处理器，生产环境隐藏敏感错误信息
   - 错误日志记录

## 10. 实施计划

1. **阶段一: 基础架构设置 (1周)**
   - 设置项目目录结构
   - 创建数据库连接类
   - 实现基本路由系统
   - 设置错误处理和日志

2. **阶段二: 认证功能 (1周)**
   - 实现用户注册
   - 实现用户登录/登出
   - 实现JWT认证
   - 实现用户资料管理

3. **阶段三: 产品功能 (1周)**
   - 实现产品CRUD
   - 实现分类CRUD
   - 实现设计师CRUD

4. **阶段四: 评论与订单功能 (1周)**
   - 实现评论CRUD
   - 实现订单CRUD
   - 实现购物车功能

5. **阶段五: 管理员功能 (1周)**
   - 实现用户管理
   - 实现仪表盘数据
   - 实现报表生成

6. **阶段六: 测试与完善 (1周)**
   - 单元测试
   - 集成测试
   - 安全审查
   - 性能优化

7. **阶段七: 部署 (2-3天)**
   - 配置生产环境
   - 部署到生产服务器

## 11. 数据库连接配置

根据.env文件的配置，设置数据库连接：

```php
// src/server/utils/Database.php
<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $socket;
    private $conn;
    
    public function __construct() {
        $this->host = $_ENV['DB_HOST'];
        $this->db_name = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASSWORD'];
        $this->port = $_ENV['DB_PORT'] ?? 3306;
        $this->socket = $_ENV['DB_SOCKET'] ?? null;
    }
    
    public function connect() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            
            if ($this->socket) {
                $dsn .= ";unix_socket={$this->socket}";
            } else {
                $dsn .= ";port={$this->port}";
            }
            
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $e) {
            throw new Exception("Connection error: " . $e->getMessage());
        }
        
        return $this->conn;
    }
}
```

## 12. 总结

本设计完全基于现有数据库结构，不做任何修改，实现了一个完整的后端服务，包括用户认证、产品管理、订单处理和管理员功能。设计采用MVC架构模式，使用PHP作为后端语言，MySQL作为数据库系统，实现RESTful API接口规范。

实现这一方案需要遵循以下关键原则：
1. 严格遵守数据库结构，不做修改
2. 采用现代PHP开发实践，确保安全可靠
3. 实现完整的认证和授权机制
4. 提供良好的API文档和错误处理
5. 采用渐进式实施计划，从基础功能开始构建 