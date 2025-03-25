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

### 📌 Check Email (`check_email.php`)
**URL:** `/auth/check_email.php`  
**Method:** `POST`  
**Purpose:** Check if a user-provided email address is already registered.  

#### Request Parameters (Request Body)
```json
{
  "email": "example@example.com"
}
Response Format (JSON)
Success (Email exists):
{
  "status": "success",
  "data": {
    "exists": true,
    "message": "This email is already registered."
  }
}
Success (Email is available):
{
  "status": "success",
  "data": {
    "exists": false,
    "message": "Email is available."
  }
}
Error (Invalid format or missing email):
{
  "status": "error",
  "message": "Invalid email format"  
}
 Check Username (check_username.php)
URL: /auth/check_username.php
Method: POST
Purpose: Check if a username is already taken.

Request Parameters (Request Body)
{
  "username": "example_user"
}
Response Format (JSON)
Success (Username exists):
{
  "status": "success",
  "data": {
    "exists": true,
    "message": "This username is already taken."
  }
}
Success (Username is available):
{
  "status": "success",
  "data": {
    "exists": false,
    "message": "Username is available."
  }
}
Error (Missing username):
{
  "status": "error",
  "message": "Missing username parameter"
}
User Login (login.php)
URL: /auth/login.php
Method: POST
Purpose: Authenticate user and return a JWT token.

Request Parameters (Request Body)
{
  "email": "example@example.com",
  "password": "example_password"
}

Response Format (JSON)
Success:
{
  "status": "success",
  "token": "your_jwt_token_here",
  "user": {
    "id": 1,
    "username": "example_user",
    "email": "example@example.com"
  }
}
Error:
{
  "status": "error",
  "message": "Invalid email or password."
}
Get User Profile (profile.php)
URL: /auth/profile.php
Method: GET
Authorization: Bearer Token (JWT)

Response Format (JSON)
Success:
{
  "status": "success",
  "user": {
    "id": 1,
    "username": "example_user",
    "email": "example@example.com",
    "profile_image": "http://localhost:8000/uploads/example.jpg"
  }
}
 Error (Unauthorized):
 {
  "status": "error",
  "message": "Unauthorized."
}
 User Registration (register.php)
URL: /auth/register.php
Method: POST
Purpose: Register a new user.

Request Parameters (Request Body)
{
  "username": "example_user",
  "email": "example@example.com",
  "password": "example_password",
  "image": "base64_encoded_image_string"
}
Response Format (JSON)
Success:{
  "status": "success",
  "message": "User registered successfully."
}
Error (Email exists):
{
  "status": "error",
  "message": "Email already exists."
}
Update User Profile (update.php)
URL: /auth/update.php
Method: POST
Authorization: Bearer Token (JWT)
Purpose: Update user profile information.

Request Parameters (Request Body)
{
  "username": "new_username",
  "email": "new_email@example.com",
  "password": "new_password",
  "image": "base64_encoded_image_string"
}
Response Format (JSON)
Success:
{
  "status": "success",
  "message": "Profile updated successfully."
}
 Error:
 {
  "status": "error",
  "message": "Failed to update profile."
}
Common Response Format
 Success Response

{
  "success": true,
  "message": "Success message",
  "data": { }
}
 Error Response

{
  "success": false,
  "message": "Error message"
}
Authorization (JWT)
For protected APIs, you must include the following header:

Authorization: Bearer your_jwt_token_here

create.php contents：
 Create Product (`create.php`)
**URL:** `/products/create.php`  
**Method:** `POST`  
**Purpose:** Create a new product. (Only accessible by admin users)  

Authorization
- **Required:** Yes (Admin Only)
- **Authorization Header:** 

 Request Parameters (Request Body)
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "category_id": 1,
  "image": "base64_encoded_image_string"
}
Success Response (Status Code: 201)

{
  "status": "success",
  "message": "Product created successfully.",
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category_id": 1,
    "image_url": "http://localhost:8000/uploads/product_image.jpg"
  }
}
 Error Responses
Validation Error:

{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "name": "Product name is required.",
    "price": "Product price must be a number."
  }
}
Authorization Error:

{
  "status": "error",
  "message": "Unauthorized access."
}
Server Error:

{
  "status": "error",
  "message": "An error occurred while processing your request."
}
 detail.php （products API）
markdown
 Get Product Detail (`detail.php`)
**URL:** `/products/detail.php`  
**Method:** `GET`  
**Purpose:** Retrieve product details by ID or slug.  

 Request Parameters (Query String)
- By ID:  
/products/detail.php?id=1

diff
- By Slug:  
/products/detail.php?slug=handmade-vase

 Success Response
```json
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
Error Responses
Missing Parameters:

{
  "status": "error",
  "message": "Product ID or slug is required."
}
Product Not Found:

{
  "status": "error",
  "message": "Product not found."
}
Server Error:

{
  "status": "error",
  "message": "An error occurred while processing your request."
}

index.php 
markdown

 Get Product List (`index.php`)
**URL:** `/products/index.php`  
**Method:** `GET`  
**Purpose:** Retrieve a list of products, optionally filtered and paginated.  

---
 Request Parameters (Query String)
| Parameter  | Type     | Description                        | Required | Example                   |
|------------|----------|------------------------------------|----------|---------------------------|
| `category` | `string`  | Filter by category name or ID.    | No       | `category=2`              |
| `designer` | `string`  | Filter by designer name or ID.    | No       | `designer=3`              |
| `featured` | `boolean` | Filter featured products only.    | No       | `featured=true`           |
| `active`   | `boolean` | Filter active products only.      | No       | `active=true`             |
| `search`   | `string`  | Search term for product names.    | No       | `search=handmade`         |
| `page`     | `integer` | Page number for pagination.       | No       | `page=1`                  |
| `limit`    | `integer` | Number of products per page.      | No       | `limit=10`                |

---
Success Response

{
  "status": "success",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Handmade Vase",
        "description": "Beautifully crafted vase.",
        "price": 25.99,
        "category": "Home Decor",
        "designer": "Artisan John",
        "image_url": "http://localhost:8000/uploads/handmade_vase.jpg"
      },
      {
        "id": 2,
        "name": "Wooden Sculpture",
        "description": "Intricately carved wooden sculpture.",
        "price": 45.00,
        "category": "Art",
        "designer": "WoodMaster",
        "image_url": "http://localhost:8000/uploads/wooden_sculpture.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20
    }
  }
}
 Error Responses
No Products Found:
{
  "status": "error",
  "message": "No products found."
}
Server Error:

{
  "status": "error",
  "message": "An error occurred while processing your request."
}

update.php 

 Update Product (`update.php`)
**URL:** `/products/update.php`  
**Method:** `PUT`  
**Purpose:** Update an existing product. (Only accessible by admin users)  


Authorization
- **Required:** Yes (Admin Only)
- **Authorization Header:** 
Authorization: Bearer your_jwt_token_here


 Request Parameters (Request Body)

{
  "id": 1,
  "name": "Updated Product Name",
  "description": "Updated Product Description",
  "price": 49.99,
  "category_id": 1,
  "image": "base64_encoded_image_string"
}
 Success Response

{
  "status": "success",
  "message": "Product updated successfully.",
  "data": {
    "id": 1,
    "name": "Updated Product Name",
    "description": "Updated Product Description",
    "price": 49.99,
    "category_id": 1,
    "image_url": "http://localhost:8000/uploads/updated_product_image.jpg"
  }
}
Error Responses
Missing Product ID:

{
  "status": "error",
  "message": "Product ID is required."
}
Validation Error:

{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "name": "Product name cannot be empty.",
    "price": "Product price must be a valid number."
  }
}
Authorization Error:

{
  "status": "error",
  "message": "Unauthorized access."
}
Server Error:

{
  "status": "error",
  "message": "An error occurred while processing your request."
}
Order APIs

### Create Order - `POST /api/orders/create.php`
- **Description:** Creates a new order for the authenticated user, with specified items, shipping, and payment information.
- **Request Headers:**  
  - `Authorization: Bearer <JWT Token>`  (Required)

---
Request Body (JSON Format)
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "Credit Card"
}

 Example Request
http
复制
编辑
POST /api/orders/create.php
Authorization: Bearer <JWT Token>
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "Credit Card"
}
 Example Response (Success - 201 Created)

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
 Example Response (Error - 400 Bad Request)

{
  "success": false,
  "message": "Order items array is required"
}