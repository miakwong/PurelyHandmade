# Purely Handmade

A handcrafted products discussion and showcasing platform built with PHP, MySQL, HTML5, CSS3, and JavaScript.

## Project Objectives

### Website User Objectives:
- Browse site without registering
- Search for items/posts by keyword without registering
- Register at the site by providing name, email and image
- Login by providing user ID and password
- Create and comment on projects when logged in
- View and edit personal profile

### Website Administrator Objectives:
- Search for users by name, email or post
- Enable/disable users
- Edit/remove post items or complete posts

## Project Timeline and Deliverables

### 1. Proposal (February 7, 2025) - 5%
- Initial project proposal

### 2. Client-side Experience (March 1, 2025) - 30%
- Develop pages with client-side validation
- Develop styles for pages
- Create examples of each page type in the proposed site
- Create GitHub repository and add instructor and TAs
- Submit link to GitHub repository

### 3. Core Functionality (March 23, 2025) - 30%
- Client-side security implementation
- Server-side security implementation
- Discussion thread storage in database
- Asynchronous updates
- Complete database functionality
- Core functional components operational
- Preliminary summary document indicating implemented functionality
- Deployment to cosc360.ok.ubc.ca
- Submit link to repository and PDF document describing implementation

### 4. Full Site (April 10, 2025) - 35%
- Complete styling as per design
- Full deployment on server
- Client-side validation and security
- Complete server-side implementation
- User account information stored in database
- Items and associated details stored in database
- Chats/threads maintained in database
- Asynchronous updates for comments/posts/products
- Complete database functionality
- All core functional components operational
- Final summary document (2-3 pages) indicating implemented functionality and features
- User walkthrough document (2-3 pages) for site testing
- Technical implementation description (2-3 pages) from a developer's perspective
- 10% of this milestone is reserved for deployment, version control, and testing

## Functional Requirements

### Minimum Requirements:
- Hand-styled layout with contextual menus (changing when users log in)
- 2-3 column responsive layout following design principles
- Form validation with JavaScript
- Server-side scripting with PHP
- Data storage in MySQL
- Appropriate security for data
- State maintenance (user login sessions)
- Responsive design for different display sizes
- AJAX for asynchronous updates (real-time thread updates)
- User images and profiles stored in database
- Simple discussion topics grouping and display
- Navigation breadcrumb strategy
- Error handling for bad navigation

### Additional Features:
- Search and analysis for topics/items
- Hot threads/items tracking
- Visual display of site usage statistics
- Activity tracking by date
- Usage tracking with visualization tools
- Collapsible items/threads without page reloading
- Alerts on page changes
- Admin reports with filtering
- Styling flourishes
- Mobile responsive layout
- Comment history tracking for users
- Accessibility features

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap JS, jQuery
- **Backend:** PHP
- **Database:** MySQL

## Project Structure

```
PurelyHandmade/              # Root project directory
├── DATABASE_ACCESS.md       # Database access documentation
├── README.md                # Project README
├── src/                     # Source code directory
│   ├── client/              # Frontend assets and views
│   │   ├── css/             # CSS stylesheets
│   │   │   ├── global.css   # Global styles
│   │   │   ├── profile.css  # User profile styles
│   │   │   ├── navbar.css   # Navbar styles
│   │   │   ├── ...          # Other stylesheets
│   │   ├── html/            # Static HTML pages (to be converted to PHP)
│   │   │   ├── index.html   # Homepage
│   │   │   ├── register.html # User registration page (to be converted to PHP)
│   │   │   ├── ...          # Other static pages
│   │   ├── js/              # Frontend JavaScript files
│   │   │   ├── navbar-handler.js # Navbar logic
│   │   │   ├── profile_script.js # Profile-related scripts
│   │   │   ├── ...          # Other JavaScript files
│   │   ├── views/           # Frontend views (to be connected with backend)
│   │   │   ├── auth/        # Authentication-related pages
│   │   │   │   ├── login.php   # User login page
│   │   │   │   ├── register.php # User registration page
│   │   │   │   ├── profile.php  # User profile page
│   │   │   ├── admin/       # Admin dashboard and management pages
│   │   │   │   ├── dashboard.php # Admin dashboard
│   │   │   │   ├── users.php     # User management
│   │   │   │   ├── ...           # Other admin-related pages
│   │   │   ├── checkout/     # Checkout and order pages
│   │   │   │   ├── cart.php  # Shopping cart page
│   │   │   │   ├── checkout.php # Checkout page
│   │   │   ├── product/      # Product-related pages
│   │   │   │   ├── product-list.php  # List of products
│   │   │   │   ├── product-detail.php # Product details page
│   │   │   ├── ...          # Other views
│   ├── server/              # Backend server directory
│   │   ├── api/             # API endpoints for frontend interactions
│   │   │   ├── auth/        # Authentication-related API endpoints
│   │   │   │   ├── register.php   # User registration API
│   │   │   │   ├── login.php      # User login API
│   │   │   │   ├── profile.php    # User profile API
│   │   │   ├── products/     # Product-related API endpoints
│   │   │   │   ├── get_products.php # Fetch all products
│   │   │   │   ├── get_product.php  # Fetch single product
│   │   │   ├── orders/       # Order management API
│   │   │   │   ├── create_order.php # Create an order
│   │   │   │   ├── get_orders.php   # Retrieve user orders
│   │   │   ├── admin/        # Admin-related API endpoints
│   │   │   │   ├── dashboard.php    # Admin dashboard API
│   │   │   │   ├── users.php        # Fetch users
│   │   │   ├── utils/        # Helper utilities for API
│   │   │   │   ├── sanitize.php     # Sanitize user inputs
│   │   │   │   ├── response.php     # JSON response helper
│   │   │   ├── ...          # Other API endpoints
│   │   ├── controllers/      # Business logic controllers
│   │   │   ├── AuthController.php  # Handles authentication
│   │   │   ├── UserController.php  # User management
│   │   │   ├── ProductController.php # Product management
│   │   │   ├── ...          # Other controllers
│   │   ├── db/              # Database-related files
│   │   │   ├── db_example.php      # Database connection example
│   │   │   ├── init_db.php         # Initialize database
│   │   │   ├── schema.sql          # Database schema
│   │   │   ├── ...          # Other database-related scripts
│   │   ├── utils/           # Backend utilities and helpers
│   │   │   ├── logger.php        # Logging system
│   │   │   ├── jwt.php           # JWT token handling
│   │   │   ├── session.php       # Session management
│   │   │   ├── ...          # Other utilities
│   │   ├── index.php        # Main API entry point
│   │   ├── api.php          # API router
│   │   ├── server.php       # Server entry file
│   ├── tests/               # Automated tests
│   │   ├── backend/         # Backend tests
│   │   │   ├── auth.test.php      # Authentication tests
│   │   │   ├── db.test.php        # Database tests
│   │   │   ├── ...          # Other backend tests
│   │   ├── frontend/        # Frontend tests
│   │   │   ├── api-service.test.js  # API service tests
│   │   │   ├── profile.test.js      # Profile page tests
│   │   │   ├── ...          # Other frontend tests
│   ├── tools/               # Developer tools
│   │   ├── db-tool.js       # Database management tool
│   │   ├── ...          # Other tools
│   ├── start-server.sh      # Script to start the server
├── package.json             # Node.js dependencies (if applicable)
├── package-lock.json        # Dependency lock file
└── jest.config.js           # Jest configuration for testing

## Installation and Configuration

### System Requirements

- PHP 7.4+
- MySQL 5.7+
- Apache Web server (with mod_rewrite module)

### Setup Steps

1. Clone or download this repository to your web server directory

2. Create MySQL database
```sql
CREATE DATABASE purely_handmade;
```

3. Configure database connection
   Edit `src/server/controllers/Database.php` file, set your database connection parameters:
```php
private $host = 'localhost';      // Database host
private $db_name = 'purely_handmade'; // Database name
private $username = 'root';       // Database username
private $password = '';           // Database password
```

4. Configure Apache URL rewriting
   Ensure Apache's mod_rewrite module is enabled and allow .htaccess overrides in your Apache configuration:
```apache
<Directory "/path/to/PurelyHandmade">
    AllowOverride All
</Directory>
```

5. Set file permissions
```bash
chmod -R 755 .
chmod -R 777 src/client/uploads  # If upload directory exists
```

### Accessing the Application

After setup, access the application via web browser:

- Homepage: http://your-domain/ or http://localhost/
- Admin Tools: http://your-domain/admin-tools.html or http://localhost/admin-tools.html

## Development Notes

### Frontend-Backend Separation

This project uses a frontend-backend separated structure within the same codebase:

- **Backend code** (`src/server/`): Contains all PHP processing logic, responsible for data handling, business logic, and API responses
- **Frontend code** (`src/client/`): Contains all JavaScript, CSS, HTML, and images, responsible for user interface and interactions

### Adding New Controllers

1. Create a new PHP class file in the `src/server/controllers/` directory
2. Add corresponding route rules in `src/server/index.php`

### Adding New Frontend Pages

1. Create new HTML files in the `src/client/html/` directory
2. If necessary, add new path mappings in the `$html_pages` array in `src/server/index.php`

### Testing

The project includes test scripts for login functionality and user profile pages:

- src/client/js/test-login.js: For testing login functionality
- src/client/js/test-profile.js: For testing user profile functionality

## License

[MIT License](LICENSE)

# PurelyHandmade 网站导航指南

## 网站页面访问链接

本网站通过PHP本地服务器提供服务，主要页面的访问链接如下：

### 产品相关页面

- **产品列表页面**：
  http://localhost:8000/src/client/views/product/product-list.html

- **产品详情页面**：
  http://localhost:8000/src/client/views/product/product_detail.html?id=17
  (可将ID替换为其他产品ID)

- **分类列表页面**：
  http://localhost:8000/src/client/views/product/category-list.html

- **分类产品页面**：
  http://localhost:8000/src/client/views/product/category-page.html?id=10
  (可将ID替换为其他分类ID)

### 其他页面

- **特卖页面**：
  http://localhost:8000/src/client/views/on-sale.html

- **关于我们**：
  http://localhost:8000/src/client/views/about.html

## API访问

API基础URL为：`http://localhost:8000/api`

可用的API端点：
- `/products` - 获取所有产品
- `/products/detail?id=17` - 获取特定产品详情
- `/categories` - 获取所有分类
- `/designers` - 获取所有设计师
- `/designers/featured` - 获取精选设计师

## 开发说明

本网站现已完成从localStorage本地存储到后端API数据获取的迁移，所有页面都能够正确地从后端数据库获取数据并显示。 