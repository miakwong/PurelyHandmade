# PurelyHandmade API Endpoints Documentation

This document lists all available API endpoints in the PurelyHandmade project.

## Base URL

All API endpoints have a base URL prefix: `/~xzy2020c/PurelyHandmade/api`

## Authentication APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/register` | POST | User registration | `username`, `email`, `password`, `isAdmin` (optional) | Public |
| `/login` | POST | User login | `identifier`, `password` | Public |
| `/check_username` | POST | Check username availability | `username` | Public |
| `/check_email` | POST | Check email availability | `email` | Public |
| `/profile` | GET | Get current user profile | None | Requires login |
| `/profile/update` | POST | Update user profile | Profile data | Requires login |
| `/auth/validate` | GET | Validate authentication token | None | Requires login |
| `/auth/profile?all=1` | GET | Get all user profiles | None | Admin |
| `/user/profile` | GET | Get detailed user profile | None | Requires login |

## Product APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/products` | GET | Get all products | Optional: `page`, `limit`, `sort_by`, `sort_dir`, `category` | Public |
| `/products/detail` | GET | Get product details | `id` (required) | Public |
| `/products` | POST | Create new product | Product data | Admin |
| `/products/:id` | PUT | Update product | Product data | Admin |
| `/products/:id` | DELETE | Delete product | None | Admin |
| `/products/featured` | GET | Get featured products | None | Public |
| `/products/on-sale` | GET | Get products on sale | None | Public |
| `/products/new-arrivals` | GET | Get new products | `days` (optional) | Public |

## Category APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/categories` | GET | Get all categories | Optional: `page`, `limit` | Public |
| `/categories/detail` | GET | Get category details | `id` (required) | Public |
| `/categories` | POST | Create new category | Category data | Admin |
| `/categories/:id` | PUT | Update category | Category data | Admin |
| `/categories/:id` | DELETE | Delete category | None | Admin |

## Designer APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/designers` | GET | Get all designers | Optional: `page`, `limit` | Public |
| `/designers/detail` | GET | Get designer details | `id` (required) | Public |
| `/designers` | POST | Create new designer | Designer data | Admin |
| `/designers/:id` | PUT | Update designer | Updated designer data | Admin |
| `/designers/:id` | DELETE | Delete designer | None | Admin |
| `/designers/featured` | GET | Get featured designers | None | Public |

## Review APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/reviews` | GET | Get all reviews | Optional: `productId`, `userId`, `status` | Public |
| `/reviews/create` | POST | Create new review | Review data, including `productId` | Requires login |
| `/reviews/:id` | PUT | Update review | Updated review data | User/Admin |
| `/reviews/:id` | DELETE | Delete review | None | User/Admin |

## Order APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/orders` | GET | Get current user orders | None | Requires login |
| `/orders?all=1` | GET | Get all orders | None | Admin |
| `/orders/:id` | GET | Get order details | None | Order owner/Admin |
| `/orders` | POST | Create new order | Order data | Requires login |
| `/orders/:id/status` | PUT | Update order status | `status` | Admin |
| `/orders/:id` | DELETE | Delete order | None | Admin |

## Cart APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/cart` | GET | Get cart contents | None | Requires login |
| `/cart/add` | POST | Add item to cart | `product_id`, `quantity` | Requires login |
| `/cart/update` | PUT | Update cart item | `item_id`, `quantity` | Requires login |
| `/cart/remove` | DELETE | Remove item from cart | `item_id` | Requires login |

## Admin APIs

| Endpoint | Method | Description | Parameters | Permission |
|----------|---------|-------------|------------|------------|
| `/users?all=1` | GET | Get all users | Optional: `status`, `role`, `page`, `limit` | Admin |
| `/admin/users/detail` | GET | Get user details | `id` | Admin |
| `/admin/statistics` | GET | Get dashboard statistics | None | Admin |

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