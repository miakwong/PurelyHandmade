# PurelyHandmade API Endpoints Documentation

This document lists all available API endpoints in the PurelyHandmade project.

## Base URL

All API endpoints have a base URL prefix: `/api`

## Authentication APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/auth/register` | POST | User registration | `username`, `email`, `password`, `isAdmin` (optional) | Public |
| `/auth/login` | POST | User login | `email`, `password` | Public |
| `/auth/profile` | GET | Get current user profile | None | Requires login |
| `/auth/profile?all=1` | GET | Get all user profiles | None | Admin |

## Product APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/products` | GET | Get all products | Optional: `page`, `limit`, `sort_by`, `sort_dir`, `category` | Public |
| `/products/detail` | GET | Get product details | `id` (required) | Public |
| `/products/create` | POST | Create new product | Product data | Admin |
| `/products/update` | PUT | Update product | `id` (required), Updated product data | Admin |
| `/products` (with id) | DELETE | Delete product | `id` (required) | Admin |

## Category APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/categories` | GET | Get all categories | Optional: `page`, `limit` | Public |
| `/categories/detail` | GET | Get category details | `id` (required) | Public |
| `/categories/create` | POST | Create new category | Category data | Admin |
| `/categories/update` | PUT | Update category | `id` (required), Updated category data | Admin |
| `/categories` (with id) | DELETE | Delete category | `id` (required) | Admin |

## Designer APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/designers` | GET | Get all designers | Optional: `page`, `limit` | Public |
| `/designers/detail` | GET | Get designer details | `id` (required) | Public |
| `/designers/create` | POST | Create new designer | Designer data | Admin |
| `/designers/update` | PUT | Update designer | `id` (required), Updated designer data | Admin |
| `/designers` (with id) | DELETE | Delete designer | `id` (required) | Admin |

## Review APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/reviews` | GET | Get all reviews | Optional: `productId`, `userId`, `status` | Public |
| `/reviews/create` | POST | Create new review | Review data, including `productId` | Requires login |
| `/reviews/update` | PUT | Update review | `id` (required), Updated review data | User/Admin |
| `/reviews` (with id) | DELETE | Delete review | `id` (required) | User/Admin |

## Order APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/orders` | GET | Get current user orders or all orders | None | Requires login/Admin |
| `/orders/detail` | GET | Get order details | `id` (required) | Order owner/Admin |
| `/orders/create` | POST | Create new order | Order data | Requires login |
| `/orders/update` | PUT | Update order status | `id` (required), `status`, `action` (optional) | Order owner/Admin |
| `/orders` (with id) | DELETE | Delete order | `id` (required) | Admin |

## Admin APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/admin/users` | GET | Get all users | Optional: `status`, `role`, `page`, `limit` | Admin |
| `/admin/dashboard` | GET | Get dashboard data | None | Admin |
| `/admin/reports` | GET | Get report data | Optional: `type`, `period`, `start`, `end` | Admin |

## Data Formats

### Success Response Format

```json
{
  "success": true,
  "message": "Operation success message",
  "data": {
    // Returned data
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message"
}
```

### Authorization Header Format

All APIs requiring authentication need an authorization token in the request header:

```
Authorization: Bearer <jwt_token>
```

## Common Parameters

### Pagination Parameters

- `page`: Page number, defaults to 1
- `limit`: Items per page, defaults to 20

### Sorting Parameters

- `sort_by`: Sort field, e.g., `created_at`
- `sort_dir`: Sort direction, `asc` or `desc`

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Resource Not Found
- 500: Internal Server Error 