# PurelyHandmade API端点文档

本文档列出了PurelyHandmade项目中所有可用的API端点。

## 基础URL

所有API端点都有一个基础URL前缀：`/api`

## 认证相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/auth/register` | POST | 用户注册 | `username`, `email`, `password`, `isAdmin` (可选) | 公开 |
| `/auth/login` | POST | 用户登录 | `email`, `password` | 公开 |
| `/auth/profile` | GET | 获取当前用户资料 | 无 | 需登录 |
| `/auth/profile?all=1` | GET | 获取所有用户资料 | 无 | 管理员 |

## 产品相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/products` | GET | 获取所有产品 | 可选：`page`, `limit`, `sort_by`, `sort_dir`, `category` | 公开 |
| `/products/detail` | GET | 获取产品详情 | `id` (必需) | 公开 |
| `/products/create` | POST | 创建新产品 | 产品数据 | 管理员 |
| `/products/update` | PUT | 更新产品 | `id` (必需), 更新的产品数据 | 管理员 |
| `/products` (带id参数) | DELETE | 删除产品 | `id` (必需) | 管理员 |

## 类别相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/categories` | GET | 获取所有类别 | 可选：`page`, `limit` | 公开 |
| `/categories/detail` | GET | 获取类别详情 | `id` (必需) | 公开 |
| `/categories/create` | POST | 创建新类别 | 类别数据 | 管理员 |
| `/categories/update` | PUT | 更新类别 | `id` (必需), 更新的类别数据 | 管理员 |
| `/categories` (带id参数) | DELETE | 删除类别 | `id` (必需) | 管理员 |

## 设计师相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/designers` | GET | 获取所有设计师 | 可选：`page`, `limit` | 公开 |
| `/designers/detail` | GET | 获取设计师详情 | `id` (必需) | 公开 |
| `/designers/create` | POST | 创建新设计师 | 设计师数据 | 管理员 |
| `/designers/update` | PUT | 更新设计师 | `id` (必需), 更新的设计师数据 | 管理员 |
| `/designers` (带id参数) | DELETE | 删除设计师 | `id` (必需) | 管理员 |

## 评论相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/reviews` | GET | 获取所有评论 | 可选：`productId`, `userId`, `status` | 公开 |
| `/reviews/create` | POST | 创建新评论 | 评论数据，包括`productId` | 需登录 |
| `/reviews/update` | PUT | 更新评论 | `id` (必需), 更新的评论数据 | 用户/管理员 |
| `/reviews` (带id参数) | DELETE | 删除评论 | `id` (必需) | 用户/管理员 |

## 订单相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/orders` | GET | 获取当前用户订单或所有订单 | 无 | 需登录/管理员 |
| `/orders/detail` | GET | 获取订单详情 | `id` (必需) | 订单所有者/管理员 |
| `/orders/create` | POST | 创建新订单 | 订单数据 | 需登录 |
| `/orders/update` | PUT | 更新订单状态 | `id` (必需), `status`, `action` (可选) | 订单所有者/管理员 |
| `/orders` (带id参数) | DELETE | 删除订单 | `id` (必需) | 管理员 |

## 管理员相关API

| 端点 | 方法 | 描述 | 参数 | 权限 |
|------|------|------|------|------|
| `/admin/users` | GET | 获取所有用户 | 可选：`status`, `role`, `page`, `limit` | 管理员 |
| `/admin/dashboard` | GET | 获取管理面板数据 | 无 | 管理员 |
| `/admin/reports` | GET | 获取报表数据 | 可选：`type`, `period`, `start`, `end` | 管理员 |

## 数据格式

### 成功响应格式

```json
{
  "success": true,
  "message": "操作成功消息",
  "data": {
    // 返回的数据
  }
}
```

### 错误响应格式

```json
{
  "success": false,
  "message": "错误消息"
}
```

### 授权头格式

所有需要认证的API都需要在请求头中添加授权令牌：

```
Authorization: Bearer <jwt_token>
```

## 通用参数

### 分页参数

- `page`: 页码，默认为1
- `limit`: 每页项目数，默认为20

### 排序参数

- `sort_by`: 排序字段，例如 `created_at`
- `sort_dir`: 排序方向，`asc` 升序 或 `desc` 降序

## 错误代码

- 400: 请求错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误 