# Apache .htaccess Configuration Documentation

## Overview
The .htaccess file manages URL routing and request handling for the PurelyHandmade application. It provides a robust routing system for both API endpoints and frontend resources.

## Configuration Sections

### Base Configuration
```apache
RewriteEngine On
RewriteBase /~xzy2020c/PurelyHandmade/
```
- Enables Apache's rewrite engine
- Sets the base URL for all rewrite rules
- **Example**:  
  A request to `/~xzy2020c/PurelyHandmade/api/products` will be processed relative to the base URL `/~xzy2020c/PurelyHandmade/`.

### API Request Handling

#### Nested API Endpoints
```apache
RewriteCond %{REQUEST_URI} ^/~xzy2020c/PurelyHandmade/api [NC]
RewriteRule ^api/([^/]+)/([^/]+)$ src/server/api/$1/$2.php [QSA,L]
```
- Handles nested API requests
- **Examples**:
  - `/api/designers/featured` → `src/server/api/designers/featured.php`
  - `/api/products/detail` → `src/server/api/products/detail.php`

#### Root API Endpoints
```apache
RewriteRule ^api/([^/]+)$ src/server/api/$1/index.php [QSA,L]
```
- Handles root-level API requests
- **Examples**:
  - `/api/products` → `src/server/api/products/index.php`
  - `/api/categories` → `src/server/api/categories/index.php`

### Static Resource Routing

#### CSS Files
```apache
RewriteRule ^css/(.*)$ src/client/css/$1 [QSA,L]
```
- Routes requests for CSS files
- **Examples**:
  - `/css/style.css` → `src/client/css/style.css`
  - `/css/navbar.css` → `src/client/css/navbar.css`

#### JavaScript Files
```apache
RewriteRule ^js/(.*)$ src/client/js/$1 [QSA,L]
```
- Routes requests for JavaScript files
- **Examples**:
  - `/js/main.js` → `src/client/js/main.js`
  - `/js/api-data-loader.js` → `src/client/js/api-data-loader.js`

#### Image Files
```apache
RewriteRule ^img/(.*)$ src/client/img/$1 [QSA,L]
```
- Routes requests for image files
- **Examples**:
  - `/img/logo.png` → `src/client/img/logo.png`
  - `/img/placeholder.jpg` → `src/client/img/placeholder.jpg`

#### Assets (Images, Fonts, etc.)
```apache
RewriteRule ^assets/(.*)$ src/client/assets/$1 [QSA,L]
```
- Routes requests for assets
- **Examples**:
  - `/assets/images/product1.jpg` → `src/client/assets/images/product1.jpg`
  - `/assets/fonts/custom-font.ttf` → `src/client/assets/fonts/custom-font.ttf`

### View Routing
```apache
RewriteRule ^views/(.*)$ src/client/views/$1 [QSA,L]
```
- Handles dynamic view requests
- **Examples**:
  - `/views/product/detail.html` → `src/client/views/product/detail.html`
  - `/views/designer/designer-page.html` → `src/client/views/designer-page.html`

### Default Routing
```apache
RewriteRule ^(.*)$ src/client/html/index.html [QSA,L]
```
- Routes all other requests to the main entry file
- **Example**:
  - `/random-page` → `src/client/html/index.html`

## Security Configuration

### File Access Protection
```apache
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```
- Prevents access to dot files
- **Example**:
  - A request to `/.env` will be denied.

### PHP Error Log Protection
```apache
<Files error_log>
    Order allow,deny
    Deny from all
</Files>
```
- Prevents access to the PHP error log file
- **Example**:
  - A request to `/error_log` will be denied.

### CORS Configuration
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```
- Enables Cross-Origin Resource Sharing
- **Examples**:
  - Allows requests from any origin (`*`)
  - Supports HTTP methods like `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`

## URL Examples

### API Endpoints
- `/api/products` → `src/server/api/products/index.php`
- `/api/designers/featured` → `src/server/api/designers/featured.php`
- `/api/categories` → `src/server/api/categories/index.php`

### Frontend Resources
- `/css/style.css` → `src/client/css/style.css`
- `/js/main.js` → `src/client/js/main.js`
- `/img/logo.png` → `src/client/img/logo.png`
- `/assets/images/product1.jpg` → `src/client/assets/images/product1.jpg`

### Views
- `/views/product/detail.html` → `src/client/views/product/detail.html`
- `/views/designer/designer-page.html` → `src/client/views/designer/designer-page.html`

## Best Practices
1. Always test new rewrite rules thoroughly
2. Keep rules organized by functionality
3. Use [L] flag to prevent unnecessary rule processing
4. Include clear comments for complex rules
5. Monitor server error logs for routing issues

## Integration with Config.js
The .htaccess configuration complements the Config.js system by:
- Matching the same base URL structure
- Supporting the path generation patterns
- Ensuring consistent resource routing