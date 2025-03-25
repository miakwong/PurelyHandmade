
## **Backend Service Design**  

---

### **1. Overall Architecture**  
This backend service design is based on the MVC architecture pattern, using PHP as the backend language and MySQL as the database system. It implements a RESTful API service to provide data interaction interfaces for the frontend. The design will fully utilize the existing database structure without making any modifications.  

---

### **2. Database Structure**  
Based on the current database query results, the complete database table structure is as follows:  

---

#### **User Table**  
| Field     | Type         | Null | Key  | Default               | Description     |
|-----------|--------------|------|------|-----------------------|-----------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment  |
| email     | varchar(191)   | NO   | UNI  | NULL                  |                 |
| username  | varchar(191)   | YES  | UNI  | NULL                  |                 |
| password  | varchar(191)   | NO   |      | NULL                  |                 |
| firstName | varchar(191)   | YES  |      | NULL                  |                 |
| lastName  | varchar(191)   | YES  |      | NULL                  |                 |
| phone     | varchar(191)   | YES  |      | NULL                  |                 |
| address   | varchar(191)   | YES  |      | NULL                  |                 |
| birthday  | datetime(3)    | YES  |      | NULL                  |                 |
| gender    | varchar(191)   | YES  |      | NULL                  |                 |
| avatar    | varchar(191)   | YES  |      | NULL                  |                 |
| role      | varchar(191)   | NO   |      | user                  |                 |
| isAdmin   | tinyint(1)     | NO   |      | 0                     |                 |
| status    | varchar(191)   | NO   |      | active                |                 |
| bio       | text           | YES  |      | NULL                  |                 |
| canOrder  | tinyint(1)     | NO   |      | 1                     |                 |
| createdAt | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  |                 |
| updatedAt | datetime(3)    | NO   |      | NULL                  |                 |
| lastLogin | datetime(3)    | YES  |      | NULL                  |                 |

---

#### **Product Table**  
| Field     | Type         | Null | Key  | Default               | Description                      |
|-----------|--------------|------|------|-----------------------|---------------------------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment                  |
| name      | varchar(191)   | NO   |      | NULL                  |                                 |
| slug      | varchar(191)   | NO   | UNI  | NULL                  |                                 |
| sku       | varchar(191)   | NO   | UNI  | NULL                  |                                 |
| price     | double         | NO   |      | NULL                  |                                 |
| stock     | int            | NO   |      | 0                     |                                 |
| description | text         | YES  |      | NULL                  |                                 |
| image     | varchar(191)   | YES  |      | NULL                  |                                 |
| gallery   | json           | YES  |      | NULL                  |                                 |
| featured  | tinyint(1)     | NO   |      | 0                     |                                 |
| active    | tinyint(1)     | NO   |      | 1                     |                                 |
| createdAt | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  |                                 |
| updatedAt | datetime(3)    | NO   |      | NULL                  |                                 |
| categoryId| int            | YES  | MUL  | NULL                  | Foreign key to Category         |
| designerId| int            | YES  | MUL  | NULL                  | Foreign key to Designer         |

---

#### **Category Table**  
| Field     | Type         | Null | Key  | Default               | Description       |
|-----------|--------------|------|------|-----------------------|-------------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment    |
| name      | varchar(191)   | NO   |      | NULL                  |                   |
| slug      | varchar(191)   | NO   | UNI  | NULL                  |                   |
| description | text         | YES  |      | NULL                  |                   |
| image     | varchar(191)   | YES  |      | NULL                  |                   |
| featured  | tinyint(1)     | NO   |      | 0                     |                   |
| createdAt | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  |                   |
| updatedAt | datetime(3)    | NO   |      | NULL                  |                   |

---

#### **Designer Table**  
| Field     | Type         | Null | Key  | Default               | Description       |
|-----------|--------------|------|------|-----------------------|-------------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment    |
| name      | varchar(191)   | NO   |      | NULL                  |                   |
| slug      | varchar(191)   | NO   | UNI  | NULL                  |                   |
| bio       | text           | YES  |      | NULL                  |                   |
| image     | varchar(191)   | YES  |      | NULL                  |                   |
| featured  | tinyint(1)     | NO   |      | 0                     |                   |
| createdAt | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  |                   |
| updatedAt | datetime(3)    | NO   |      | NULL                  |                   |

---

#### **Review Table**  
| Field     | Type         | Null | Key  | Default               | Description                |
|-----------|--------------|------|------|-----------------------|----------------------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment             |
| userId    | int           | NO   | MUL  | NULL                  | Foreign key to User        |
| productId | int           | NO   | MUL  | NULL                  | Foreign key to Product     |
| rating    | int           | NO   |      | NULL                  |                            |
| title     | varchar(191)   | YES  |      | NULL                  |                            |
| content   | text           | NO   |      | NULL                  |                            |
| status    | varchar(191)   | NO   |      | pending               |                            |
| createdAt | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  |                            |
| updatedAt | datetime(3)    | NO   |      | NULL                  |                            |

---

#### **Order Table**  
| Field       | Type         | Null | Key  | Default               | Description                          |
|-------------|--------------|------|------|-----------------------|-------------------------------------|
| id          | int           | NO   | PRI  | NULL                  | auto_increment                      |
| userId      | int           | NO   | MUL  | NULL                  | Foreign key to User                |
| orderDate   | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  | Date and time when the order was placed |
| status      | varchar(191)   | NO   |      | pending               | Order status (e.g., pending, completed) |
| totalAmount | double         | NO   |      | NULL                  | Total amount of the order           |
| shippingInfo| json           | YES  |      | NULL                  | JSON object containing shipping details |
| paymentInfo | json           | YES  |      | NULL                  | JSON object containing payment details |
| notes       | text           | YES  |      | NULL                  | Additional notes related to the order |
| createdAt   | datetime(3)    | NO   |      | CURRENT_TIMESTAMP(3)  | Order creation timestamp           |
| updatedAt   | datetime(3)    | NO   |      | NULL                  | Last update timestamp              |

---

#### **OrderItem Table**  
| Field     | Type         | Null | Key  | Default               | Description                      |
|-----------|--------------|------|------|-----------------------|---------------------------------|
| id        | int           | NO   | PRI  | NULL                  | auto_increment                  |
| orderId   | int           | NO   | MUL  | NULL                  | Foreign key to Order            |
| productId | int           | NO   | MUL  | NULL                  | Foreign key to Product          |
| quantity  | int           | NO   |      | NULL                  | Quantity of the product ordered |
| price     | double         | NO   |      | NULL                  | Price per unit of the product   |

---

### **3. Directory Structure Design**  
```
src/
└── server/                    # Backend service directory
    ├── api/                   # API endpoints
    │   ├── auth/              # Authentication-related APIs
    │   │   ├── login.php      
    │   │   ├── logout.php     
    │   │   ├── register.php   
    │   │   └── profile.php    
    │   ├── products/          
    │   │   ├── index.php      
    │   │   ├── detail.php     
    │   │   ├── create.php     
    │   │   └── update.php     
    │   ├── categories/        
    │   ├── designers/         
    │   ├── reviews/           
    │   ├── orders/            
    │   └── admin/             
    ├── controllers/           
    ├── models/                
    ├── utils/                 
    ├── middleware/            
    ├── config/                
    ├── bootstrap.php          
    └── index.php              
```

---

### **4. API Design**  
I'll summarize the API design for the backend system. Let's start with **authentication APIs**.  

---

#### **Authentication APIs**  
1. **User Registration (POST /api/auth/register.php)**  
   - Request Body: `{username, email, password, firstName, lastName, phone, address}`  
   - Response: `{success: true, user: {id, email, username, ...}}`  

2. **User Login (POST /api/auth/login.php)**  
   - Request Body: `{email, password}`  
   - Response: `{success: true, token: "jwt_token", user: {id, email, username, ...}}`  

3. **Get User Profile (GET /api/auth/profile.php)**  
   - Header: `Authorization: Bearer {token}`  
   - Response: `{id, email, username, firstName, lastName, ...}`  

4. **Update User Profile (PUT /api/auth/profile.php)**  
   - Header: `Authorization: Bearer {token}`  
   - Request Body: `{firstName, lastName, phone, address, ...}`  
   - Response: `{success: true, user: {id, email, username, ...}}`  



### **4. API Design (Continued)**  

---

#### **Product APIs**  
1. **Get Product List (GET /api/products/index.php)**  
   - **Query Parameters:**  
     - `category` (optional) - Filter by category ID.  
     - `designer` (optional) - Filter by designer ID.  
     - `featured` (optional) - Show only featured products (`1` for true).  
     - `page` (optional) - Pagination page number (default: 1).  
     - `limit` (optional) - Number of items per page (default: 10).  
   - **Response:**  
     ```json
     {
       "products": [...],
       "total": 100,
       "page": 1,
       "pages": 10
     }
     ```

2. **Get Product Details (GET /api/products/detail.php)**  
   - **Query Parameters:**  
     - `id` (required) - Product ID.  
     - `slug` (optional) - Product slug (alternative to ID).  
   - **Response:**  
     ```json
     {
       "id": 1,
       "name": "Handmade Vase",
       "price": 25.99,
       "description": "Beautiful vase",
       "categoryId": 2,
       "designerId": 1,
       "image": "vase.jpg",
       "gallery": ["vase1.jpg", "vase2.jpg"]
     }
     ```

3. **Create Product (POST /api/products/create.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Request Body:**  
     ```json
     {
       "name": "New Product",
       "slug": "new-product",
       "price": 49.99,
       "description": "Product description",
       "categoryId": 2,
       "designerId": 1
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "product": { ... }
     }
     ```

4. **Update Product (PUT /api/products/update.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Request Body:**  
     ```json
     {
       "id": 1,
       "name": "Updated Product",
       "price": 59.99
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "product": { ... }
     }
     ```

---

#### **Category APIs**  
1. **Get Category List (GET /api/categories/index.php)**  
   - **Query Parameters:**  
     - `featured` (optional) - Show only featured categories (`1` for true).  
   - **Response:**  
     ```json
     {
       "categories": [...],
       "total": 10
     }
     ```

2. **Get Category Details (GET /api/categories/detail.php)**  
   - **Query Parameters:**  
     - `id` (required) - Category ID.  
     - `slug` (optional) - Category slug.  
   - **Response:**  
     ```json
     {
       "id": 2,
       "name": "Art",
       "slug": "art",
       "description": "Beautiful art pieces."
     }
     ```

---

#### **Designer APIs**  
1. **Get Designer List (GET /api/designers/index.php)**  
   - **Query Parameters:**  
     - `featured` (optional) - Show only featured designers (`1` for true).  
   - **Response:**  
     ```json
     {
       "designers": [...],
       "total": 10
     }
     ```

2. **Get Designer Details (GET /api/designers/detail.php)**  
   - **Query Parameters:**  
     - `id` (required) - Designer ID.  
     - `slug` (optional) - Designer slug.  
   - **Response:**  
     ```json
     {
       "id": 1,
       "name": "Designer A",
       "bio": "A famous designer",
       "image": "designer.jpg"
     }
     ```

---

#### **Review APIs**  
1. **Get Reviews (GET /api/reviews/index.php)**  
   - **Query Parameters:**  
     - `productId` (required) - ID of the product to fetch reviews for.  
     - `status` (optional) - Review status (`approved` / `pending`).  
   - **Response:**  
     ```json
     {
       "reviews": [...],
       "total": 30
     }
     ```

2. **Create Review (POST /api/reviews/create.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (User must be logged in)  
   - **Request Body:**  
     ```json
     {
       "productId": 1,
       "rating": 5,
       "title": "Great product!",
       "content": "Really loved it!"
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "review": { ... }
     }
     ```
---

### **4. API Design (Continued)**  

---

#### **Order APIs**  
1. **Get User Orders (GET /api/orders/index.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (User must be logged in)  
   - **Query Parameters:**  
     - `status` (optional) - Filter by order status (e.g., `pending`, `completed`).  
     - `page` (optional) - Pagination page number (default: 1).  
     - `limit` (optional) - Number of items per page (default: 10).  
   - **Response:**  
     ```json
     {
       "orders": [...],
       "total": 20,
       "page": 1,
       "pages": 2
     }
     ```

2. **Get Order Details (GET /api/orders/detail.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (User must be logged in or Admin)  
   - **Query Parameters:**  
     - `id` (required) - Order ID.  
   - **Response:**  
     ```json
     {
       "id": 1,
       "userId": 5,
       "status": "completed",
       "totalAmount": 150.00,
       "shippingInfo": { ... },
       "paymentInfo": { ... },
       "items": [ ... ]
     }
     ```

3. **Create Order (POST /api/orders/create.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (User must be logged in)  
   - **Request Body:**  
     ```json
     {
       "items": [
         {"productId": 1, "quantity": 2},
         {"productId": 2, "quantity": 1}
       ],
       "shippingInfo": {
         "address": "123 Example Street",
         "phone": "123-456-7890"
       },
       "paymentInfo": {
         "method": "credit_card",
         "cardNumber": "xxxx-xxxx-xxxx-1234"
       }
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "order": {
         "id": 1,
         "status": "pending",
         "totalAmount": 250.00
       }
     }
     ```

4. **Update Order Status (PUT /api/orders/update.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Request Body:**  
     ```json
     {
       "id": 1,
       "status": "completed",
       "notes": "Order successfully delivered."
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "order": {
         "id": 1,
         "status": "completed"
       }
     }
     ```

---

#### **Admin APIs**  
1. **Get User List (GET /api/admin/users.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Query Parameters:**  
     - `status` (optional) - Filter by user status (`active`, `banned`).  
     - `role` (optional) - Filter by user role (`user`, `admin`).  
     - `page` (optional) - Pagination page number.  
     - `limit` (optional) - Number of items per page.  
   - **Response:**  
     ```json
     {
       "users": [...],
       "total": 100,
       "page": 1,
       "pages": 5
     }
     ```

2. **Update User Status (PUT /api/admin/users.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Request Body:**  
     ```json
     {
       "id": 5,
       "status": "banned",
       "role": "user",
       "isAdmin": false,
       "canOrder": false
     }
     ```
   - **Response:**  
     ```json
     {
       "success": true,
       "user": {
         "id": 5,
         "status": "banned"
       }
     }
     ```

3. **Get Dashboard Data (GET /api/admin/dashboard.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Response:**  
     ```json
     {
       "users": {"total": 500, "active": 480},
       "products": {"total": 150, "featured": 10},
       "orders": {"total": 1200, "pending": 100, "completed": 1100},
       "revenue": {"total": 50000, "monthly": 5000}
     }
     ```

4. **Generate Reports (GET /api/admin/reports.php)**  
   - **Headers:**  
     - `Authorization: Bearer {token}` (Admin only)  
   - **Query Parameters:**  
     - `type` - Report type (`sales`, `users`, `products`).  
     - `period` - Time period for the report (`daily`, `monthly`, `yearly`).  
     - `start` - Start date (e.g., `2025-01-01`).  
     - `end` - End date (e.g., `2025-12-31`).  
   - **Response:**  
     ```json
     {
       "data": [...],
       "summary": { ... }
     }
     ```

---
