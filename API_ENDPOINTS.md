
# PurelyHandmade API Endpoints Documentation

This document lists all available API endpoints for the PurelyHandmade project.

---

## Base URL

All API endpoints have a base URL prefix: `/api`

---

## Authentication APIs (`auth`)

| Endpoint             | Method | Description                  | Parameters                     | Access       |
|----------------------|--------|-----------------------------|--------------------------------|--------------|
| `/auth/register.php`  | POST   | User registration           | `username`, `email`, `password`, `image` (optional) | Public |
| `/auth/login.php`     | POST   | User login                  | `email`, `password`            | Public       |
| `/auth/profile.php`   | GET    | Get current user profile    | None                           | Requires Login (JWT) |
| `/auth/update.php`    | POST   | Update user profile         | `username`, `email`, `password`, `image` (optional) | Requires Login (JWT) |
| `/auth/check_email.php`   | POST   | Check if email exists      | `email`                        | Public       |
| `/auth/check_username.php`| POST   | Check if username exists   | `username`                     | Public       |

---

## Check Email (`check_email.php`)  
**URL:** `/auth/check_email.php`  
**Method:** `POST`  
**Purpose:** Check if a user-provided email address is already registered.  

#### Request Parameters (Request Body)  
```json
{
  "email": "example@example.com"
}
```

#### Response Format (JSON)
**Success (Email exists):**
```json
{
  "status": "success",
  "data": {
    "exists": true,
    "message": "This email is already registered."
  }
}
```

**Success (Email is available):**
```json
{
  "status": "success",
  "data": {
    "exists": false,
    "message": "Email is available."
  }
}
```

**Error (Invalid format or missing email):**
```json
{
  "status": "error",
  "message": "Invalid email format"
}
```
---

## Check Username (`check_username.php`)
**URL:** `/auth/check_username.php`  
**Method:** `POST`  
**Purpose:** Check if a username is already taken.  

#### Request Parameters (Request Body)
```json
{
  "username": "example_user"
}
```

#### Response Format (JSON)
**Success (Username exists):**
```json
{
  "status": "success",
  "data": {
    "exists": true,
    "message": "This username is already taken."
  }
}
```

**Success (Username is available):**
```json
{
  "status": "success",
  "data": {
    "exists": false,
    "message": "Username is available."
  }
}
```

**Error (Missing username):**
```json
{
  "status": "error",
  "message": "Missing username parameter"
}
```

---

# Error Responses & Product Details (Fixed Format)

---

## Error Responses
### Validation Error
```
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "name": "Product name is required.",
    "price": "Product price must be a number."
  }
}
```

### Authorization Error
```
{
  "status": "error",
  "message": "Unauthorized access."
}
```

### Server Error
```
{
  "status": "error",
  "message": "An error occurred while processing your request."
}
```

---

## Get Product Detail (`detail.php`)
**URL:** `/products/detail.php`  
**Method:** `GET`  
**Purpose:** Retrieve product details by ID or slug.  

### Request Parameters (Query String)
- By ID: `/products/detail.php?id=1`  
- By Slug: `/products/detail.php?slug=handmade-vase`  

### Success Response
```
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Handmade Vase",
    "description": "Beautifully crafted vase.",
    "price": 25.99,
    "category": "Home Decor",
    "image_url": "http://localhost:8000/uploads/handmade_vase.jpg"
  }
}
```

### Error Responses
#### Missing Parameters
```
{
  "status": "error",
  "message": "Product ID or slug is required."
}
```

#### Product Not Found
```
{
  "status": "error",
  "message": "Product not found."
}
```

#### Server Error
```
{
  "status": "error",
  "message": "An error occurred while processing your request."
}
```

---

# Order APIs (Fixed Format)

---

## Create Order (`POST /api/orders/create.php`)
- **Description:** Creates a new order for the authenticated user, with specified items, shipping, and payment information.
- **Request Headers:**  
  - `Authorization: Bearer <JWT Token>` (Required)

---

### Request Body (JSON Format)
```
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "Credit Card"
}
```

### Example Response (Success - 201 Created)
```
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 101,
    "userId": 1,
    "totalAmount": 120,
    "status": "pending",
    "items": [
      { "productId": 1, "quantity": 2, "price": 40, "name": "Handmade Necklace" },
      { "productId": 2, "quantity": 1, "price": 40, "name": "Wooden Sculpture" }
    ]
  }
}
```

### Example Response (Error - 400 Bad Request)
```
{
  "success": false,
  "message": "Order items array is required"
}
```

### Example Response (Error - 400 Bad Request - Order ID required)
```
{
  "success": false,
  "message": "Order ID is required"
}
```

### Error Responses
| Status Code | Message               | Reason                                            |
|-------------|-----------------------|--------------------------------------------------|
| 400         | Order ID is required   | Missing or invalid id parameter.                |
| 401         | Unauthorized           | JWT Token is invalid or not provided.           |
| 404         | Order not found        | The order does not exist or is not accessible.  |
| 500         | An error occurred      | Server-side error or database failure.          |

---

## Get Order Details (`GET /api/orders/detail.php`)
- **Description:** Retrieves details of a specific order by its ID for the authenticated user.
- **Request Headers:**  
  - `Authorization: Bearer <JWT Token>` (Required)

### Request Parameters (Query)
| Parameter | Type    | Required | Description                        |
|-----------|---------|----------|-----------------------------------|
| `id`      | integer  | Yes      | The ID of the order to be fetched.|
| `userId`  | integer  | Yes      | The ID of the user making the request.|

### Example Request (HTTP)
```
GET /api/orders/detail.php?id=101&userId=1
Authorization: Bearer <JWT Token>
```

### Example Response (Success - 200 OK)
```
{
  "success": true,
  "order": {
    "id": 101,
    "userId": 1,
    "orderDate": "2025-03-24T10:30:00",
    "status": "pending",
    "totalAmount": 120,
    "items": [
      { "productId": 1, "quantity": 2, "price": 40, "name": "Handmade Necklace" },
      { "productId": 2, "quantity": 1, "price": 40, "name": "Wooden Sculpture" }
    ]
  }
}
```

### Example Response (Error - 400 Bad Request)
```
{
  "success": false,
  "message": "Order ID is required"
}
```

---
